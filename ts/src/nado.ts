// ---------------------------------------------------------------------------

import Exchange from './abstract/nado.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { ecdsa } from './base/functions/crypto.js';
import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadResponse, BadSymbol, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidAddress, InvalidNonce, InvalidOrder, NotSupported, OnMaintenance, OperationFailed, OperationRejected, OrderImmediatelyFillable, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded, RestrictedLocation } from './base/errors.js';
import type { Balances, Currencies, Currency, Dict, FundingHistory, FundingRate, FundingRates, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class nado
 * @augments Exchange
 */
export default class nado extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'nado',
            'name': 'Nado',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 25,
            'version': 'v1',
            'precisionMode': TICK_SIZE,
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRates': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterests': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': false,
            },
            'urls': {
                'logo': undefined,
                'api': {
                    'gateway': 'https://gateway.prod.nado.xyz/v1',
                    'gatewayV2': 'https://gateway.prod.nado.xyz/v2',
                    'archive': 'https://archive.prod.nado.xyz/v1',
                    'archiveV2': 'https://archive.prod.nado.xyz/v2',
                    'trigger': 'https://trigger.prod.nado.xyz/v1',
                },
                'test': {
                    'gateway': 'https://gateway.test.nado.xyz/v1',
                    'gatewayV2': 'https://gateway.test.nado.xyz/v2',
                    'archive': 'https://archive.test.nado.xyz/v1',
                    'archiveV2': 'https://archive.test.nado.xyz/v2',
                    'trigger': 'https://trigger.test.nado.xyz/v1',
                },
                'www': 'https://nado.xyz',
                'doc': 'https://docs.nado.xyz/',
            },
            'api': {
                'gateway': {
                    'public': {
                        'get': {
                            'symbols': 2,
                            'query': 1,
                            'edge/query': 1,
                        },
                        'post': {
                            'query': 1,
                        },
                    },
                    'private': {
                        'post': {
                            'execute': 1,
                        },
                    },
                },
                'gatewayV2': {
                    'public': {
                        'get': {
                            'assets': 2,
                            'pairs': 1,
                            'orderbook': 1,
                        },
                    },
                },
                'archive': {
                    'post': {
                        '': 1,
                    },
                },
                'archiveV2': {
                    'public': {
                        'get': {
                            'tickers': 1,
                            'contracts': 1,
                            'trades': 1,
                        },
                    },
                },
                'trigger': {
                    'private': {
                        'post': {
                            'execute': 1,
                            'query': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0001'),
                    'taker': this.parseNumber ('0.00035'),
                },
            },
            'options': {
                'defaultType': 'swap',
                'recvWindow': 5000,
                'expiration': '4294967295',
                'subaccount': 'default',
                'editOrder': {
                    'placeRequiresUnfilled': true,
                },
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '1h': 3600,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
                '1w': 604800,
                '4w': 2419200,
            },
            'features': {},
            'exceptions': {
                'exact': {
                    '1000': RateLimitExceeded,
                    '1015': RateLimitExceeded,
                    '1001': PermissionDenied,
                    '1002': RestrictedLocation,
                    '1003': RestrictedLocation,
                    '1004': OnMaintenance,
                    '2000': InvalidOrder,
                    '2001': InvalidOrder,
                    '2002': InvalidOrder,
                    '2003': InvalidOrder,
                    '2004': InvalidOrder,
                    '2005': OperationRejected,
                    '2006': InsufficientFunds,
                    '2007': InvalidOrder,
                    '2008': OrderImmediatelyFillable,
                    '2009': InvalidOrder,
                    '2010': InvalidOrder,
                    '2011': InvalidNonce,
                    '2012': InvalidNonce,
                    '2013': DuplicateOrderId,
                    '2014': PermissionDenied,
                    '2015': BadSymbol,
                    '2016': BadSymbol,
                    '2017': InsufficientFunds,
                    '2019': InvalidOrder,
                    '2020': OrderNotFound,
                    '2021': PermissionDenied,
                    '2022': InvalidNonce,
                    '2023': OperationRejected,
                    '2024': InvalidAddress,
                    '2025': InsufficientFunds,
                    '2026': BadRequest,
                    '2027': BadRequest,
                    '2028': AuthenticationError,
                    '2029': BadRequest,
                    '2030': RateLimitExceeded,
                    '2031': OrderNotFillable,
                    '2033': InvalidNonce,
                    '2034': AuthenticationError,
                    '2035': AuthenticationError,
                    '2036': InsufficientFunds,
                    '2037': InsufficientFunds,
                    '2038': BadRequest,
                    '2039': BadRequest,
                    '2040': BadRequest,
                    '2041': BadRequest,
                    '2042': OperationRejected,
                    '2043': InsufficientFunds,
                    '2044': OperationRejected,
                    '2045': InvalidOrder,
                    '2046': InvalidOrder,
                    '2047': InvalidOrder,
                    '2048': InvalidOrder,
                    '2049': OperationFailed,
                    '2050': PermissionDenied,
                    '2051': OperationRejected,
                    '2052': InvalidOrder,
                    '2053': OperationFailed,
                    '2054': InvalidOrder,
                    '2055': InvalidOrder,
                    '2056': OrderNotFillable,
                    '2057': OperationRejected,
                    '2058': OrderNotFound,
                    '2059': InvalidOrder,
                    '2060': BadSymbol,
                    '2061': BadRequest,
                    '2062': ArgumentsRequired,
                    '2063': BadResponse,
                    '2064': InvalidOrder,
                    '2065': InvalidOrder,
                    '2066': InvalidOrder,
                    '2067': InvalidOrder,
                    '2068': OnMaintenance,
                    '2069': OperationRejected,
                    '2070': OperationRejected,
                    '2071': OperationRejected,
                    '2072': InvalidOrder,
                    '2073': InvalidOrder,
                    '2074': BadRequest,
                    '2075': InvalidOrder,
                    '2076': InvalidOrder,
                    '2077': BadRequest,
                    '2078': RateLimitExceeded,
                    '2079': BadRequest,
                    '2080': BadRequest,
                    '2081': InvalidOrder,
                    '2082': BadSymbol,
                    '2083': InvalidOrder,
                    '2084': InvalidOrder,
                    '2085': InvalidOrder,
                    '2086': BadRequest,
                    '2087': OperationFailed,
                    '2088': InvalidOrder,
                    '2089': BadRequest,
                    '2090': BadRequest,
                    '2091': BadRequest,
                    '2092': InsufficientFunds,
                    '2093': OperationRejected,
                    '2094': InvalidOrder,
                    '2095': InvalidOrder,
                    '2096': InsufficientFunds,
                    '2097': InvalidOrder,
                    '2098': InvalidOrder,
                    '2099': InvalidOrder,
                    '2100': InvalidOrder,
                    '2101': InvalidOrder,
                    '2102': InvalidOrder,
                    '2103': InvalidOrder,
                    '2104': InvalidOrder,
                    '2105': InvalidOrder,
                    '2106': InvalidOrder,
                    '2107': InvalidOrder,
                    '2108': InvalidOrder,
                    '2109': InvalidOrder,
                    '2110': InvalidOrder,
                    '2111': InvalidOrder,
                    '2112': InvalidOrder,
                    '2113': InvalidOrder,
                    '2114': InvalidOrder,
                    '2115': OperationFailed,
                    '2117': InvalidOrder,
                    '2118': BadRequest,
                    '2119': InvalidOrder,
                    '2120': OperationFailed,
                    '2121': OperationFailed,
                    '2122': InvalidOrder,
                    '2123': BadRequest,
                    '2124': InvalidOrder,
                    '2125': OperationRejected,
                    '3000': BadRequest,
                    '3001': BadRequest,
                    '3002': ArgumentsRequired,
                    '3003': BadRequest,
                    '3004': BadRequest,
                    '3005': OperationFailed,
                    '4000': BadRequest,
                    '4001': NotSupported,
                    '4002': ExchangeNotAvailable,
                    '4003': OperationFailed,
                    '4004': OperationRejected,
                    '5000': ExchangeNotAvailable,
                },
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name nado#createOrder
     * @description create a trade order
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string|int} [params.expiration] order expiration timestamp in seconds, defaults to 4294967295
     * @param {string|int} [params.appendix] pre-encoded order appendix
     * @param {boolean} [params.reduceOnly] true if the order should only reduce position
     * @param {boolean} [params.postOnly] true to create a post-only order
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', or 'PO'
     * @param {boolean} [params.spotLeverage] whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' createOrder() supports limit orders only');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument');
        }
        const productId = this.parseToInt (market['id']);
        const priceString = this.priceToPrecision (symbol, price);
        const amountString = this.amountToPrecision (symbol, amount);
        const priceX18 = this.convertToX18 (priceString);
        let amountX18 = this.convertToX18 (amountString);
        if (side === 'sell') {
            amountX18 = Precise.stringMul (amountX18, '-1');
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'createOrder', 'subaccount', 'default');
        let expiration = undefined;
        [ expiration, params ] = this.handleOptionAndParams (params, 'createOrder', 'expiration', '4294967295');
        let recvWindow = undefined;
        [ recvWindow, params ] = this.handleOptionAndParams (params, 'createOrder', 'recvWindow', 5000);
        const nonce = this.createOrderNonce (recvWindow);
        let appendix = this.safeString (params, 'appendix');
        if (appendix === undefined) {
            appendix = this.createOrderAppendix (params);
        }
        const requestId = this.safeInteger (params, 'id');
        const spotLeverage = this.safeBool2 (params, 'spotLeverage', 'spot_leverage');
        params = this.omit (params, [ 'expiration', 'nonce', 'appendix', 'reduceOnly', 'postOnly', 'timeInForce', 'id', 'spotLeverage', 'spot_leverage' ]);
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const order: Dict = {
            'sender': sender,
            'priceX18': priceX18,
            'amount': amountX18,
            'expiration': expiration,
            'nonce': nonce,
            'appendix': appendix,
        };
        const contracts = await this.queryContracts ();
        const chainId = this.safeString (contracts, 'chain_id');
        const signature = this.signOrder (order, productId, chainId);
        const placeOrder: Dict = {
            'product_id': productId,
            'order': order,
            'signature': signature,
        };
        if (requestId !== undefined) {
            placeOrder['id'] = requestId;
        }
        if (spotLeverage !== undefined) {
            placeOrder['spot_leverage'] = spotLeverage;
        }
        const request: Dict = {
            'place_order': placeOrder,
        };
        const response = await this.gatewayPrivatePostExecute (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "digest": "0x..."
        //         },
        //         "request_type": "execute_place_order",
        //         "id": 100
        //     }
        //
        return this.parseOrder (this.extend ({ 'place_order': placeOrder }, response), market);
    }

    /**
     * @method
     * @name nado#editOrder
     * @description edit a trade order
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-and-place
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string|int} [params.expiration] order expiration timestamp in seconds, defaults to 4294967295
     * @param {string|int} [params.appendix] pre-encoded order appendix
     * @param {boolean} [params.reduceOnly] true if the order should only reduce position
     * @param {boolean} [params.postOnly] true to create a post-only order
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', or 'PO'
     * @param {boolean} [params.spotLeverage] whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage
     * @param {boolean} [params.placeRequiresUnfilled] when true, aborts the new order if the canceled order had partial fills or the cancel failed, exchange-specific alias params.place_requires_unfilled, defaults to true
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' editOrder() supports limit orders only');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount argument');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a price argument');
        }
        const productId = this.parseToInt (market['id']);
        const priceString = this.priceToPrecision (symbol, price);
        const amountString = this.amountToPrecision (symbol, amount);
        const priceX18 = this.convertToX18 (priceString);
        let amountX18 = this.convertToX18 (amountString);
        if (side === 'sell') {
            amountX18 = Precise.stringMul (amountX18, '-1');
        }
        const editOrderOptions = this.safeDict (this.options, 'editOrder', {});
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'editOrder', 'subaccount', 'default');
        let expiration = undefined;
        [ expiration, params ] = this.handleOptionAndParams (params, 'editOrder', 'expiration', '4294967295');
        let recvWindow = undefined;
        [ recvWindow, params ] = this.handleOptionAndParams (params, 'editOrder', 'recvWindow', 5000);
        const cancelNonce = this.createOrderNonce (recvWindow);
        const orderNonce = Precise.stringAdd (cancelNonce, '1');
        let appendix = this.safeString (params, 'appendix');
        if (appendix === undefined) {
            appendix = this.createOrderAppendix (params);
        }
        const requestId = this.safeInteger (params, 'id');
        const spotLeverage = this.safeBool2 (params, 'spotLeverage', 'spot_leverage');
        const placeRequiresUnfilled = this.safeBool2 (params, 'placeRequiresUnfilled', 'place_requires_unfilled', this.safeBool (editOrderOptions, 'placeRequiresUnfilled', true));
        params = this.omit (params, [ 'expiration', 'nonce', 'appendix', 'reduceOnly', 'postOnly', 'timeInForce', 'id', 'spotLeverage', 'spot_leverage', 'placeRequiresUnfilled', 'place_requires_unfilled' ]);
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const cancelTx: Dict = {
            'sender': sender,
            'productIds': [ productId ],
            'digests': [ id ],
            'nonce': cancelNonce,
        };
        const order: Dict = {
            'sender': sender,
            'priceX18': priceX18,
            'amount': amountX18,
            'expiration': expiration,
            'nonce': orderNonce,
            'appendix': appendix,
        };
        const contracts = await this.queryContracts ();
        const chainId = this.safeString (contracts, 'chain_id');
        const endpointAddress = this.safeString (contracts, 'endpoint_addr');
        if (endpointAddress === undefined) {
            throw new ExchangeError (this.id + ' editOrder() requires endpoint_addr from contracts query');
        }
        const cancelSignature = this.signCancellation (cancelTx, chainId, endpointAddress);
        const orderSignature = this.signOrder (order, productId, chainId);
        const placeOrder: Dict = {
            'product_id': productId,
            'order': order,
            'signature': orderSignature,
        };
        if (requestId !== undefined) {
            placeOrder['id'] = requestId;
        }
        if (spotLeverage !== undefined) {
            placeOrder['spot_leverage'] = spotLeverage;
        }
        const cancelAndPlace: Dict = {
            'cancel_tx': cancelTx,
            'cancel_signature': cancelSignature,
            'place_order': placeOrder,
            'place_requires_unfilled': placeRequiresUnfilled,
        };
        const request: Dict = {
            'cancel_and_place': cancelAndPlace,
        };
        const response = await this.gatewayPrivatePostExecute (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "digest": "0x..."
        //         },
        //         "request_type": "execute_cancel_and_place"
        //     }
        //
        return this.parseOrder (this.extend ({ 'place_order': placeOrder }, response), market);
    }

    /**
     * @method
     * @name nado#cancelOrder
     * @description cancels an open order
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string} [params.requiredUnfilledAmount] cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        const orders = await this.cancelOrders ([ id ], symbol, params);
        return this.safeDict (orders, 0) as Order;
    }

    /**
     * @method
     * @name nado#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-product-orders
     * @param {string} [symbol] unified market symbol, when undefined all orders for all products are canceled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market = undefined;
        const productIds = [];
        if (symbol !== undefined) {
            market = this.market (symbol);
            productIds.push (this.parseToInt (market['id']));
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        let recvWindow = undefined;
        [ recvWindow, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'recvWindow', 5000);
        const nonce = this.createOrderNonce (recvWindow);
        const tx: Dict = {
            'sender': sender,
            'productIds': productIds,
            'nonce': nonce,
        };
        const contracts = await this.queryContracts ();
        const chainId = this.safeString (contracts, 'chain_id');
        const endpointAddress = this.safeString (contracts, 'endpoint_addr');
        if (endpointAddress === undefined) {
            throw new ExchangeError (this.id + ' cancelAllOrders() requires endpoint_addr from contracts query');
        }
        const signature = this.signCancellationProducts (tx, chainId, endpointAddress);
        const requestId = this.safeInteger (params, 'id');
        params = this.omit (params, [ 'id' ]);
        const cancelProductOrders: Dict = {
            'tx': tx,
            'signature': signature,
        };
        if (requestId !== undefined) {
            cancelProductOrders['id'] = requestId;
        }
        const request: Dict = {
            'cancel_product_orders': cancelProductOrders,
        };
        const response = await this.gatewayPrivatePostExecute (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "cancelled_orders": [
        //                 {
        //                     "product_id": 2,
        //                     "sender": "0x...",
        //                     "price_x18": "20000000000000000000000",
        //                     "amount": "-100000000000000000",
        //                     "expiration": "1686332748",
        //                     "order_type": "post_only",
        //                     "nonce": "1768248100142339392",
        //                     "unfilled_amount": "-100000000000000000",
        //                     "digest": "0x...",
        //                     "appendix": "1537",
        //                     "placed_at": 1686332708
        //                 }
        //             ]
        //         },
        //         "request_type": "execute_cancel_product_orders",
        //         "id": 100
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const cancelledOrders = this.safeList (data, 'cancelled_orders', []);
        const result = [];
        for (let i = 0; i < cancelledOrders.length; i++) {
            result.push (this.parseOrder (this.extend ({ 'status': 'canceled' }, cancelledOrders[i]), market));
        }
        return result;
    }

    /**
     * @method
     * @name nado#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {string} [params.requiredUnfilledAmount] cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount
     * @param {int} [params.id] client-provided request id, returned by the exchange in the response
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const productId = this.parseToInt (market['id']);
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'cancelOrders', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const productIds = [];
        for (let i = 0; i < ids.length; i++) {
            productIds.push (productId);
        }
        let recvWindow = undefined;
        [ recvWindow, params ] = this.handleOptionAndParams (params, 'cancelOrders', 'recvWindow', 5000);
        const nonce = this.createOrderNonce (recvWindow);
        const tx: Dict = {
            'sender': sender,
            'productIds': productIds,
            'digests': ids,
            'nonce': nonce,
        };
        const contracts = await this.queryContracts ();
        const chainId = this.safeString (contracts, 'chain_id');
        const endpointAddress = this.safeString (contracts, 'endpoint_addr');
        if (endpointAddress === undefined) {
            throw new ExchangeError (this.id + ' cancelOrders() requires endpoint_addr from contracts query');
        }
        const signature = this.signCancellation (tx, chainId, endpointAddress);
        const requestId = this.safeInteger (params, 'id');
        const requiredUnfilledAmountRaw = this.safeString (params, 'required_unfilled_amount');
        const requiredUnfilledAmount = this.safeString (params, 'requiredUnfilledAmount');
        params = this.omit (params, [ 'id', 'requiredUnfilledAmount', 'required_unfilled_amount' ]);
        const cancelOrders: Dict = {
            'tx': tx,
            'signature': signature,
        };
        if (requiredUnfilledAmountRaw !== undefined) {
            cancelOrders['required_unfilled_amount'] = requiredUnfilledAmountRaw;
        } else if (requiredUnfilledAmount !== undefined) {
            cancelOrders['required_unfilled_amount'] = this.convertToX18 (requiredUnfilledAmount);
        }
        if (requestId !== undefined) {
            cancelOrders['id'] = requestId;
        }
        const request: Dict = {
            'cancel_orders': cancelOrders,
        };
        const response = await this.gatewayPrivatePostExecute (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "cancelled_orders": [
        //                 {
        //                     "product_id": 2,
        //                     "sender": "0x...",
        //                     "price_x18": "20000000000000000000000",
        //                     "amount": "-100000000000000000",
        //                     "expiration": "1686332748",
        //                     "order_type": "post_only",
        //                     "nonce": "1768248100142339392",
        //                     "unfilled_amount": "-100000000000000000",
        //                     "digest": "0x...",
        //                     "appendix": "1537",
        //                     "placed_at": 1686332708
        //                 }
        //             ]
        //         },
        //         "request_type": "execute_cancel_orders",
        //         "id": 100
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const cancelledOrders = this.safeList (data, 'cancelled_orders', []);
        const result = [];
        for (let i = 0; i < cancelledOrders.length; i++) {
            result.push (this.parseOrder (this.extend ({ 'status': 'canceled' }, cancelledOrders[i]), market));
        }
        return result;
    }

    /**
     * @method
     * @name nado#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'type': 'order',
            'product_id': this.parseToInt (market['id']),
            'digest': id,
        };
        const response = await this.gatewayPublicGetQuery (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "data": {
        //             "product_id": 1,
        //             "sender": "0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43000000000000000000000000",
        //             "price_x18": "1000000000000000000",
        //             "amount": "1000000000000000000",
        //             "expiration": "2000000000",
        //             "nonce": "1",
        //             "unfilled_amount": "1000000000000000000",
        //             "digest": "0x0000000000000000000000000000000000000000000000000000000000000000",
        //             "placed_at": 1681951347,
        //             "appendix": "1537",
        //             "order_type": "ioc"
        //         },
        //         "request_type": "query_order"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name nado#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires walletAddress');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'subaccount', 'default');
        const sender = this.createSubaccount (this.walletAddress, subaccount);
        const request: Dict = {
            'sender': sender,
            'type': 'subaccount_orders',
            'product_id': this.parseToInt (market['id']),
        };
        const response = await this.gatewayPublicGetQuery (this.extend (request, params));
        //
        // single product
        //
        //     {
        //         "status": "success",
        //         "data": {
        //             "sender": "0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43000000000000000000000000",
        //             "product_id": 1,
        //             "orders": [
        //                 {
        //                     "product_id": 1,
        //                     "sender": "0x7a5ec2748e9065794491a8d29dcf3f9edb8d7c43000000000000000000000000",
        //                     "price_x18": "1000000000000000000",
        //                     "amount": "1000000000000000000",
        //                     "expiration": "2000000000",
        //                     "nonce": "1",
        //                     "unfilled_amount": "1000000000000000000",
        //                     "digest": "0x0000000000000000000000000000000000000000000000000000000000000000",
        //                     "placed_at": 1682437739,
        //                     "appendix": "1537",
        //                     "order_type": "ioc"
        //                 }
        //             ]
        //         },
        //         "request_type": "query_subaccount_orders"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'orders', []);
        return this.parseOrders (orders, market, since, limit, { 'status': 'open' });
    }

    /**
     * @method
     * @name nado#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.until] timestamp in ms of the latest order to fetch
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires walletAddress');
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'fetchClosedOrders', 'subaccount', 'default');
        let ordersRequest: Dict = {
            'subaccounts': [
                this.createSubaccount (this.walletAddress, subaccount),
            ],
        };
        if (market !== undefined) {
            ordersRequest['product_ids'] = [ this.parseToInt (market['id']) ];
        }
        [ ordersRequest, params ] = this.handleUntilOption ('max_time', ordersRequest, params, 0.001);
        if (limit !== undefined) {
            ordersRequest['limit'] = Math.min (limit, 500);
        }
        const request: Dict = {
            'orders': ordersRequest,
        };
        const response = await this.archivePost (this.deepExtend (request, params));
        //
        //     {
        //         "orders": [
        //             {
        //                 "digest": "0xf4f7a8767faf0c7f72251a1f9e5da590f708fd9842bf8fcdeacbaa0237958fff",
        //                 "subaccount": "0x12a0b4888021576eb10a67616dd3dd3d9ce206b664656661756c740000000000",
        //                 "product_id": 1,
        //                 "submission_idx": "563024",
        //                 "amount": "20000000000000000000",
        //                 "price_x18": "1751900000000000000000",
        //                 "base_filled": "20000000000000000000",
        //                 "quote_filled": "-35038000000000000000000",
        //                 "fee": "7007600000000000000",
        //                 "first_fill_timestamp": "1679728133",
        //                 "last_fill_timestamp": "1679728133"
        //             }
        //         ]
        //     }
        //
        const orders = this.safeList (response, 'orders', []);
        const closedOrders = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if (this.isArchiveOrderClosed (order)) {
                closedOrders.push (this.extend ({ 'status': 'closed' }, order));
            }
        }
        return this.parseOrders (closedOrders, market, since, limit);
    }

    /**
     * @method
     * @name nado#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/matches
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires walletAddress');
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'subaccount', 'default');
        let matchesRequest: Dict = {
            'subaccounts': [
                this.createSubaccount (this.walletAddress, subaccount),
            ],
        };
        if (market !== undefined) {
            matchesRequest['product_ids'] = [ this.parseToInt (market['id']) ];
        }
        [ matchesRequest, params ] = this.handleUntilOption ('max_time', matchesRequest, params, 0.001);
        if (limit !== undefined) {
            matchesRequest['limit'] = Math.min (limit, 500);
        }
        const request: Dict = {
            'matches': matchesRequest,
        };
        const response = await this.archivePost (this.deepExtend (request, params));
        //
        //     {
        //         "matches": [
        //             {
        //                 "digest": "0x80ce789702b670b7d33f2aa67e12c85f124395c3f9acdb422dde3b4973ccd50c",
        //                 "order": {
        //                     "sender": "0x12a0b4888021576eb10a67616dd3dd3d9ce206b664656661756c740000000000",
        //                     "priceX18": "27544000000000000000000",
        //                     "amount": "2000000000000000000",
        //                     "expiration": "4611686020107119633",
        //                     "nonce": "1761322608857448448"
        //                 },
        //                 "base_filled": "736000000000000000",
        //                 "quote_filled": "-20276464287857571514302",
        //                 "fee": "4055287857571514302",
        //                 "submission_idx": "563012",
        //                 "is_taker": true
        //             }
        //         ],
        //         "txs": [
        //             {
        //                 "submission_idx": "563012",
        //                 "product_id": 2,
        //                 "timestamp": "1679728133"
        //             }
        //         ]
        //     }
        //
        const matches = this.safeList (response, 'matches', []);
        const txs = this.safeList (response, 'txs', []);
        const txsBySubmission = this.indexBy (txs, 'submission_idx');
        const trades = [];
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const submissionIdx = this.safeString (match, 'submission_idx');
            const tx = this.safeDict (txsBySubmission, submissionIdx, {});
            trades.push (this.extend (tx, match));
        }
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * @method
     * @name nado#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/subaccount-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBalance() requires walletAddress');
        }
        await this.loadMarkets ();
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'subaccount', 'default');
        const request: Dict = {
            'type': 'subaccount_info',
            'subaccount': this.createSubaccount (this.walletAddress, subaccount),
        };
        const response = await this.gatewayPublicGetQuery (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "data": {
        //             "subaccount": "0x8d7d64d6cf1d4f018dd101482ac71ad49e30c56064656661756c740000000000",
        //             "exists": true,
        //             "spot_balances": [
        //                 {
        //                     "product_id": 0,
        //                     "balance": {
        //                         "amount": "456895621098158389211471"
        //                     }
        //                 }
        //             ],
        //             "perp_balances": []
        //         },
        //         "request_type": "query_subaccount_info"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseBalance (data);
    }

    /**
     * @method
     * @name nado#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/events
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.until] timestamp in ms of the latest deposit to fetch
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchTransactionsByEventType ('deposit_collateral', 'deposit', 'fetchDeposits', code, since, limit, params);
    }

    /**
     * @method
     * @name nado#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/events
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @param {int} [params.until] timestamp in ms of the latest withdrawal to fetch
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchTransactionsByEventType ('withdraw_collateral', 'withdrawal', 'fetchWithdrawals', code, since, limit, params);
    }

    async fetchTransactionsByEventType (eventType: string, transactionType: string, methodName: string, code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactionsByEventType() requires walletAddress');
        }
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, methodName, 'subaccount', 'default');
        let eventsRequest: Dict = {
            'subaccounts': [
                this.createSubaccount (this.walletAddress, subaccount),
            ],
            'event_types': [
                eventType,
            ],
            'limit': {
                'raw': (limit === undefined) ? 100 : Math.min (limit, 500),
            },
        };
        if (currency !== undefined) {
            eventsRequest['product_ids'] = [
                this.parseToInt (currency['id']),
            ];
        }
        [ eventsRequest, params ] = this.handleUntilOption ('max_time', eventsRequest, params, 0.001);
        const request: Dict = {
            'events': eventsRequest,
        };
        const response = await this.archivePost (this.deepExtend (request, params));
        //
        //     {
        //         "events": [
        //             {
        //                 "subaccount": "0x...",
        //                 "product_id": 5,
        //                 "submission_idx": "563011",
        //                 "event_type": "deposit_collateral",
        //                 "pre_balance": {
        //                     "spot": {
        //                         "balance": {
        //                             "amount": "1000000000000000000"
        //                         }
        //                     }
        //                 },
        //                 "post_balance": {
        //                     "spot": {
        //                         "balance": {
        //                             "amount": "2000000000000000000"
        //                         }
        //                     }
        //                 }
        //             }
        //         ],
        //         "txs": [
        //             {
        //                 "submission_idx": "563011",
        //                 "timestamp": "1679728127"
        //             }
        //         ]
        //     }
        //
        const events = this.safeList (response, 'events', []);
        const txs = this.safeList (response, 'txs', []);
        const transactions = [];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const submissionIdx = this.safeString (event, 'submission_idx');
            let tx = {};
            for (let j = 0; j < txs.length; j++) {
                const rawTx = txs[j];
                const txSubmissionIdx = this.safeString (rawTx, 'submission_idx');
                if (txSubmissionIdx === submissionIdx) {
                    tx = rawTx;
                    break;
                }
            }
            transactions.push (this.parseTransaction (this.extend (tx, event, { 'transaction_type': transactionType }), currency));
        }
        return this.filterByCurrencySinceLimit (transactions, code, since, limit);
    }

    /**
     * @method
     * @name nado#fetchPositions
     * @description fetch all open positions
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/subaccount-info
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPositions() requires walletAddress');
        }
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'subaccount', 'default');
        const request: Dict = {
            'type': 'subaccount_info',
            'subaccount': this.createSubaccount (this.walletAddress, subaccount),
        };
        const response = await this.gatewayPublicGetQuery (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "data": {
        //             "perp_balances": [
        //                 {
        //                     "product_id": 2,
        //                     "balance": {
        //                         "amount": "100000000000000000",
        //                         "v_quote_balance": "3033500000000000000000",
        //                         "last_cumulative_funding_x18": "-394223711772447555304"
        //                     }
        //                 }
        //             ],
        //             "perp_products": [
        //                 {
        //                     "product_id": 2,
        //                     "oracle_price_x18": "115596528090565357611177",
        //                     "risk": {
        //                         "price_x18": "115596528090565357611177"
        //                     }
        //                 }
        //             ]
        //         },
        //         "request_type": "query_subaccount_info"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const positions = this.safeList (data, 'perp_balances', []);
        const products = this.safeList (data, 'perp_products', []);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const productId = this.safeString (position, 'product_id');
            let product = {};
            for (let j = 0; j < products.length; j++) {
                const rawProduct = products[j];
                const rawProductId = this.safeString (rawProduct, 'product_id');
                if (rawProductId === productId) {
                    product = rawProduct;
                    break;
                }
            }
            result.push (this.parsePosition (this.extend ({ 'product': product }, position)));
        }
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    /**
     * @method
     * @name nado#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.nado.xyz/developer-resources/api/gateway/edge#control-messages
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const request: Dict = {
            'type': 'time',
        };
        const response = await this.gatewayPublicGetEdgeQuery (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "method": "time",
        //         "id": 2,
        //         "server_time": "1780000000123"
        //     }
        //
        return this.safeInteger (response, 'server_time');
    }

    /**
     * @method
     * @name nado#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const request: Dict = {
            'type': 'status',
        };
        const response = await this.gatewayPublicGetQuery (this.extend (request, params));
        //
        //     {
        //         "status": "success",
        //         "data": "active",
        //         "request_type": "query_status"
        //     }
        //
        const status = this.safeString (response, 'data');
        return {
            'status': (status === 'active') ? 'ok' : 'error',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name nado#fetchMarkets
     * @description retrieves data on all markets for nado
     * @see https://docs.nado.xyz/developer-resources/api/gateway/queries/symbols
     * @see https://docs.nado.xyz/developer-resources/api/v2/pairs
     * @see https://docs.nado.xyz/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const symbolsRequest = this.gatewayPublicGetSymbols (params);
        const pairsRequest = this.gatewayV2PublicGetPairs (params);
        const assetsRequest = this.gatewayV2PublicGetAssets (params);
        const responses = await Promise.all ([ symbolsRequest, pairsRequest, assetsRequest ]);
        const symbols = this.safeList (responses, 0, []);
        const pairs = this.safeList (responses, 1, []);
        const assets = this.safeList (responses, 2, []);
        const pairsById = this.indexBy (pairs, 'product_id');
        const assetsById = this.indexBy (assets, 'product_id');
        const markets = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const id = this.safeString (market, 'product_id');
            const pair = this.safeDict (pairsById, id, {});
            const asset = this.safeDict (assetsById, id, {});
            const rawType = this.safeString (market, 'type');
            const type = (rawType === 'perp') ? 'swap' : rawType;
            const contract = (type === 'swap');
            const tickerId = this.safeString2 (pair, 'ticker_id', 'tickerId');
            if (tickerId === undefined) {
                continue;
            }
            const baseId = this.safeString (market, 'symbol');
            const quoteId = this.safeString (pair, 'quote', 'USDT0');
            const settleId = contract ? quoteId : undefined;
            const base = this.safeCurrencyCode (this.removeMarketSuffix (baseId));
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            let symbol = base + '/' + quote;
            if (contract) {
                symbol += ':' + settle;
            }
            const tradingStatus = this.safeString (market, 'trading_status');
            const active = (tradingStatus !== 'not_tradable');
            const priceIncrement = this.parseX18 (this.safeString (market, 'price_increment_x18'));
            const amountIncrement = this.parseX18 (this.safeString (market, 'size_increment'));
            const minCost = this.parseX18 (this.safeString (market, 'min_size'));
            markets.push ({
                'id': id,
                'lowercaseId': undefined,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': (type === 'spot'),
                'margin': undefined,
                'swap': contract,
                'future': false,
                'option': false,
                'active': active,
                'contract': contract,
                'linear': contract ? true : undefined,
                'inverse': contract ? false : undefined,
                'taker': this.parseX18 (this.safeString (market, 'taker_fee_rate_x18')),
                'maker': this.parseX18 (this.safeString (market, 'maker_fee_rate_x18')),
                'contractSize': contract ? 1 : undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountIncrement,
                    'price': priceIncrement,
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
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': this.extend (market, {
                    'ticker_id': tickerId,
                    'name': this.safeString (asset, 'name'),
                    'v2Pair': pair,
                    'v2Asset': asset,
                }),
            });
        }
        return markets;
    }

    /**
     * @method
     * @name nado#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.nado.xyz/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.gatewayV2PublicGetAssets (params);
        const currencies = [];
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const marketType = this.safeString (currency, 'market_type');
            const canDeposit = this.safeBool (currency, 'can_deposit', false);
            const canWithdraw = this.safeBool (currency, 'can_withdraw', false);
            if ((marketType === 'perp') && !canDeposit && !canWithdraw) {
                continue;
            }
            currencies.push (currency);
        }
        return this.parseCurrencies (currencies);
    }

    /**
     * @method
     * @name nado#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.nado.xyz/developer-resources/api/v2/tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.archiveV2PublicGetTickers (params);
        //
        //     {
        //         "BTC-PERP_USDT0": {
        //             "product_id": 2,
        //             "ticker_id": "BTC-PERP_USDT0",
        //             "base_currency": "BTC",
        //             "quote_currency": "USDT0",
        //             "last_price": 25728.0,
        //             "base_volume": 552.048,
        //             "quote_volume": 14238632.207250029,
        //             "price_change_percent_24h": -0.6348599635253989
        //         }
        //     }
        //
        const tickers = this.toArray (response);
        return this.parseTickers (tickers, symbols);
    }

    /**
     * @method
     * @name nado#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.nado.xyz/developer-resources/api/v2/tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ symbol ], params);
        return this.safeTicker (this.safeDict (tickers, symbol), market);
    }

    /**
     * @method
     * @name nado#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.nado.xyz/developer-resources/api/v2/contracts
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.edge] whether to retrieve volume and open interest metrics for all chains, defaults to true
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const tickerId = this.safeString (market['info'], 'ticker_id');
        const response = await this.archiveV2PublicGetContracts (params);
        //
        //     {
        //         "BTC-PERP_USDT0": {
        //             "product_id": 1,
        //             "ticker_id": "BTC-PERP_USDT0",
        //             "base_currency": "BTC-PERP",
        //             "quote_currency": "USDT0",
        //             "last_price": 25744.0,
        //             "base_volume": 794.154,
        //             "quote_volume": 20475749.367766097,
        //             "product_type": "perpetual",
        //             "contract_price": 25830.738843799172,
        //             "contract_price_currency": "USD",
        //             "open_interest": 3059.325,
        //             "open_interest_usd": 79024625.11330591,
        //             "index_price": 25878.913320746455,
        //             "mark_price": 25783.996946729356,
        //             "funding_rate": -0.003664562348812546,
        //             "next_funding_rate_timestamp": 1694379600,
        //             "price_change_percent_24h": -0.6348599635253989
        //         }
        //     }
        //
        const data = this.safeDict (response, tickerId, {});
        return this.parseFundingRate (data, market);
    }

    /**
     * @method
     * @name nado#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/interest-and-funding-payments
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount] the 12-byte subaccount identifier, defaults to 'default'
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        if (this.walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires walletAddress');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingHistory() supports swap contracts only');
        }
        let subaccount = undefined;
        [ subaccount, params ] = this.handleOptionAndParams (params, 'fetchFundingHistory', 'subaccount', 'default');
        const request: Dict = {
            'interest_and_funding': {
                'subaccount': this.createSubaccount (this.walletAddress, subaccount),
                'product_ids': [
                    this.parseToInt (market['id']),
                ],
                'limit': (limit === undefined) ? 100 : Math.min (limit, 100),
            },
        };
        const response = await this.archivePost (this.deepExtend (request, params));
        //
        //     {
        //         "interest_payments": [],
        //         "funding_payments": [
        //             {
        //                 "product_id": 2,
        //                 "idx": "5968022",
        //                 "timestamp": "1701698400",
        //                 "amount": "-12273223338657163",
        //                 "balance_amount": "1000000000000000000",
        //                 "rate_x18": "47928279191008320",
        //                 "oracle_price_x18": "2243215034242228224820"
        //             }
        //         ],
        //         "next_idx": "1314805"
        //     }
        //
        const fundingPayments = this.safeList (response, 'funding_payments', []);
        const result = [];
        for (let i = 0; i < fundingPayments.length; i++) {
            result.push (this.parseFundingHistory (fundingPayments[i], market));
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingHistory[];
    }

    /**
     * @method
     * @name nado#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://docs.nado.xyz/developer-resources/api/v2/contracts
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.edge] whether to retrieve volume and open interest metrics for all chains, defaults to true
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, 'swap', true);
        const response = await this.archiveV2PublicGetContracts (params);
        //
        //     {
        //         "BTC-PERP_USDT0": {
        //             "product_id": 1,
        //             "ticker_id": "BTC-PERP_USDT0",
        //             "base_currency": "BTC-PERP",
        //             "quote_currency": "USDT0",
        //             "last_price": 25744.0,
        //             "base_volume": 794.154,
        //             "quote_volume": 20475749.367766097,
        //             "product_type": "perpetual",
        //             "contract_price": 25830.738843799172,
        //             "contract_price_currency": "USD",
        //             "open_interest": 3059.325,
        //             "open_interest_usd": 79024625.11330591,
        //             "index_price": 25878.913320746455,
        //             "mark_price": 25783.996946729356,
        //             "funding_rate": -0.003664562348812546,
        //             "next_funding_rate_timestamp": 1694379600,
        //             "price_change_percent_24h": -0.6348599635253989
        //         }
        //     }
        //
        const tickers = Object.keys (response);
        const rates = [];
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            rates.push (response[ticker]);
        }
        return this.parseFundingRates (rates, symbols);
    }

    /**
     * @method
     * @name nado#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://docs.nado.xyz/developer-resources/api/v2/contracts
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @param {boolean} [params.edge] whether to retrieve volume and open interest metrics for all chains, defaults to true
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterest (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchOpenInterest() supports swap contracts only');
        }
        const tickerId = this.safeString (market['info'], 'ticker_id');
        const response = await this.archiveV2PublicGetContracts (params);
        //
        //     {
        //         "BTC-PERP_USDT0": {
        //             "product_id": 1,
        //             "ticker_id": "BTC-PERP_USDT0",
        //             "base_currency": "BTC-PERP",
        //             "quote_currency": "USDT0",
        //             "last_price": 25744.0,
        //             "base_volume": 794.154,
        //             "quote_volume": 20475749.367766097,
        //             "product_type": "perpetual",
        //             "contract_price": 25830.738843799172,
        //             "contract_price_currency": "USD",
        //             "open_interest": 3059.325,
        //             "open_interest_usd": 79024625.11330591,
        //             "index_price": 25878.913320746455,
        //             "mark_price": 25783.996946729356,
        //             "funding_rate": -0.003664562348812546,
        //             "next_funding_rate_timestamp": 1694379600,
        //             "price_change_percent_24h": -0.6348599635253989
        //         }
        //     }
        //
        const data = this.safeDict (response, tickerId, {});
        return this.parseOpenInterest (data, market);
    }

    /**
     * @method
     * @name nado#fetchOpenInterests
     * @description retrieves the open interests of some currencies
     * @see https://docs.nado.xyz/developer-resources/api/v2/contracts
     * @param {string[]} [symbols] unified CCXT market symbols
     * @param {object} [params] exchange specific parameters
     * @param {boolean} [params.edge] whether to retrieve volume and open interest metrics for all chains, defaults to true
     * @returns {object} a dictionary of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterests (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, 'swap', true);
        const response = await this.archiveV2PublicGetContracts (params);
        //
        //     {
        //         "BTC-PERP_USDT0": {
        //             "product_id": 1,
        //             "ticker_id": "BTC-PERP_USDT0",
        //             "base_currency": "BTC-PERP",
        //             "quote_currency": "USDT0",
        //             "last_price": 25744.0,
        //             "base_volume": 794.154,
        //             "quote_volume": 20475749.367766097,
        //             "product_type": "perpetual",
        //             "contract_price": 25830.738843799172,
        //             "contract_price_currency": "USD",
        //             "open_interest": 3059.325,
        //             "open_interest_usd": 79024625.11330591,
        //             "index_price": 25878.913320746455,
        //             "mark_price": 25783.996946729356,
        //             "funding_rate": -0.003664562348812546,
        //             "next_funding_rate_timestamp": 1694379600,
        //             "price_change_percent_24h": -0.6348599635253989
        //         }
        //     }
        //
        const tickers = Object.keys (response);
        const interests = [];
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            interests.push (response[ticker]);
        }
        return this.parseOpenInterests (interests, symbols);
    }

    /**
     * @method
     * @name nado#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.nado.xyz/developer-resources/api/v2/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickerId = this.safeString (market['info'], 'ticker_id');
        const request: Dict = {
            'ticker_id': tickerId,
            'depth': (limit === undefined) ? 100 : limit,
        };
        const response = await this.gatewayV2PublicGetOrderbook (this.extend (request, params));
        //
        //     {
        //         "product_id": 1,
        //         "ticker_id": "BTC-PERP_USDT0",
        //         "bids": [
        //             [ 116215.0, 0.128 ],
        //             [ 116214.0, 0.172 ]
        //         ],
        //         "asks": [
        //             [ 116225.0, 0.043 ],
        //             [ 116226.0, 0.172 ]
        //         ],
        //         "timestamp": 1757913317944
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp);
    }

    /**
     * @method
     * @name nado#fetchTrades
     * @description get the list of the most recent trades for a particular symbol
     * @see https://docs.nado.xyz/developer-resources/api/v2/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.max_trade_id] max trade id to include in the result for pagination
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickerId = this.safeString (market['info'], 'ticker_id');
        const request: Dict = {
            'ticker_id': tickerId,
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 500);
        }
        const response = await this.archiveV2PublicGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "product_id": 1,
        //             "ticker_id": "BTC-PERP_USDT0",
        //             "trade_id": 6351,
        //             "price": 112029.5896,
        //             "base_filled": -0.388,
        //             "quote_filled": 43467.4807648,
        //             "timestamp": 1757335618,
        //             "trade_type": "sell"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name nado#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.nado.xyz/developer-resources/api/archive-indexer/candlesticks
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        const request: Dict = {
            'candlesticks': {
                'product_id': this.parseToInt (market['id']),
                'granularity': this.safeInteger (this.timeframes, timeframe, this.parseTimeframe (timeframe)),
            },
        };
        if (limit !== undefined) {
            request['candlesticks']['limit'] = limit;
        }
        if (until !== undefined) {
            request['candlesticks']['max_time'] = this.parseToInt (until / 1000);
        }
        const response = await this.archivePost (this.deepExtend (request, params));
        //
        //     {
        //         "candlesticks": [
        //             {
        //                 "product_id": 1,
        //                 "granularity": 60,
        //                 "submission_idx": "627709",
        //                 "timestamp": "1680118140",
        //                 "open_x18": "27235000000000000000000",
        //                 "high_x18": "27298000000000000000000",
        //                 "low_x18": "27235000000000000000000",
        //                 "close_x18": "27298000000000000000000",
        //                 "volume": "1999999999999999998"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'candlesticks', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "product_id": 1,
        //         "granularity": 60,
        //         "submission_idx": "627709",
        //         "timestamp": "1680118140",
        //         "open_x18": "27235000000000000000000",
        //         "high_x18": "27298000000000000000000",
        //         "low_x18": "27235000000000000000000",
        //         "close_x18": "27298000000000000000000",
        //         "volume": "1999999999999999998"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            this.parseX18 (this.safeString (ohlcv, 'open_x18')),
            this.parseX18 (this.safeString (ohlcv, 'high_x18')),
            this.parseX18 (this.safeString (ohlcv, 'low_x18')),
            this.parseX18 (this.safeString (ohlcv, 'close_x18')),
            this.parseX18 (this.safeString (ohlcv, 'volume')),
        ];
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "product_id": 1,
        //         "ticker_id": "BTC-PERP_USDT0",
        //         "trade_id": 6351,
        //         "price": 112029.5896,
        //         "base_filled": -0.388,
        //         "quote_filled": 43467.4807648,
        //         "timestamp": 1757335618,
        //         "trade_type": "sell"
        //     }
        //
        // archive match
        //
        //     {
        //         "submission_idx": "563012",
        //         "product_id": 2,
        //         "timestamp": "1679728133",
        //         "digest": "0x80ce789702b670b7d33f2aa67e12c85f124395c3f9acdb422dde3b4973ccd50c",
        //         "order": {
        //             "priceX18": "27544000000000000000000",
        //             "amount": "2000000000000000000"
        //         },
        //         "base_filled": "736000000000000000",
        //         "quote_filled": "-20276464287857571514302",
        //         "fee": "4055287857571514302",
        //         "is_taker": true
        //     }
        //
        const marketId = this.safeString (trade, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const rawOrder = this.safeDict (trade, 'order');
        const isArchiveMatch = rawOrder !== undefined;
        const order = (rawOrder === undefined) ? {} : rawOrder;
        const amountString = this.safeString (trade, 'base_filled');
        const costString = this.safeString (trade, 'quote_filled');
        const rawOrderAmount = this.safeString (order, 'amount');
        let side = this.safeString (trade, 'trade_type');
        if ((side === undefined) && (rawOrderAmount !== undefined)) {
            if (Precise.stringLt (rawOrderAmount, '0')) {
                side = 'sell';
            } else {
                side = 'buy';
            }
        }
        let price: any = this.safeString (trade, 'price');
        if (price === undefined) {
            const parsedPrice = this.parseX18 (this.safeString (order, 'priceX18'));
            price = (parsedPrice === undefined) ? undefined : this.numberToString (parsedPrice);
        }
        let takerOrMaker = undefined;
        const isTaker = this.safeBool (trade, 'is_taker');
        if (isTaker !== undefined) {
            if (isTaker) {
                takerOrMaker = 'taker';
            } else {
                takerOrMaker = 'maker';
            }
        }
        const feeString = this.safeString (trade, 'fee');
        let feeCost = undefined;
        if (isArchiveMatch) {
            feeCost = this.parseX18 (feeString);
        } else {
            feeCost = this.parseNumber (feeString);
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        let parsedAmount = undefined;
        if (amountString !== undefined) {
            const absoluteAmount = Precise.stringAbs (amountString);
            if (isArchiveMatch) {
                parsedAmount = this.parseX18 (absoluteAmount);
            } else {
                parsedAmount = absoluteAmount;
            }
        }
        let parsedCost = undefined;
        if (costString !== undefined) {
            const absoluteCost = Precise.stringAbs (costString);
            if (isArchiveMatch) {
                parsedCost = this.parseX18 (absoluteCost);
            } else {
                parsedCost = absoluteCost;
            }
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString2 (trade, 'trade_id', 'submission_idx'),
            'order': this.safeString (trade, 'digest'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': parsedAmount,
            'cost': parsedCost,
            'fee': fee,
        }, market);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "product_id": 1,
        //         "ticker_id": "BTC-PERP_USDT0",
        //         "base_currency": "BTC-PERP",
        //         "quote_currency": "USDT0",
        //         "last_price": 25744.0,
        //         "base_volume": 794.154,
        //         "quote_volume": 20475749.367766097,
        //         "product_type": "perpetual",
        //         "contract_price": 25830.738843799172,
        //         "contract_price_currency": "USD",
        //         "open_interest": 3059.325,
        //         "open_interest_usd": 79024625.11330591,
        //         "index_price": 25878.913320746455,
        //         "mark_price": 25783.996946729356,
        //         "funding_rate": -0.003664562348812546,
        //         "next_funding_rate_timestamp": 1694379600,
        //         "price_change_percent_24h": -0.6348599635253989
        //     }
        //
        const marketId = this.safeString (contract, 'product_id');
        market = this.safeMarket (marketId, market);
        const fundingTimestamp = this.safeTimestamp (contract, 'next_funding_rate_timestamp');
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': this.safeNumber (contract, 'mark_price'),
            'indexPrice': this.safeNumber (contract, 'index_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': '24h',
        };
    }

    parseFundingHistory (funding: Dict, market: Market = undefined) {
        //
        //     {
        //         "product_id": 2,
        //         "idx": "5968022",
        //         "timestamp": "1701698400",
        //         "amount": "-12273223338657163",
        //         "balance_amount": "1000000000000000000",
        //         "rate_x18": "47928279191008320",
        //         "oracle_price_x18": "2243215034242228224820"
        //     }
        //
        const marketId = this.safeString (funding, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (funding, 'timestamp');
        return {
            'info': funding,
            'symbol': market['symbol'],
            'code': this.safeString (market, 'settle'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': this.safeString (funding, 'idx'),
            'amount': this.parseX18 (this.safeString (funding, 'amount')),
        };
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //     {
        //         "product_id": 1,
        //         "ticker_id": "BTC-PERP_USDT0",
        //         "base_currency": "BTC-PERP",
        //         "quote_currency": "USDT0",
        //         "last_price": 25744.0,
        //         "base_volume": 794.154,
        //         "quote_volume": 20475749.367766097,
        //         "product_type": "perpetual",
        //         "contract_price": 25830.738843799172,
        //         "contract_price_currency": "USD",
        //         "open_interest": 3059.325,
        //         "open_interest_usd": 79024625.11330591,
        //         "index_price": 25878.913320746455,
        //         "mark_price": 25783.996946729356,
        //         "funding_rate": -0.003664562348812546,
        //         "next_funding_rate_timestamp": 1694379600,
        //         "price_change_percent_24h": -0.6348599635253989
        //     }
        //
        const marketId = this.safeString (interest, 'product_id');
        market = this.safeMarket (marketId, market);
        return this.safeOpenInterest ({
            'symbol': market['symbol'],
            'openInterestAmount': this.safeNumber (interest, 'open_interest'),
            'openInterestValue': this.safeNumber (interest, 'open_interest_usd'),
            'timestamp': undefined,
            'datetime': undefined,
            'info': interest,
        }, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'product_id');
        market = this.safeMarket (marketId, market);
        const timestamp = undefined;
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'price_change_percent_24h'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const canDeposit = this.safeBool (rawCurrency, 'can_deposit', false);
        const canWithdraw = this.safeBool (rawCurrency, 'can_withdraw', false);
        const id = this.safeString (rawCurrency, 'product_id');
        const currencyId = this.safeString (rawCurrency, 'symbol');
        const code = this.safeCurrencyCode (this.removeMarketSuffix (currencyId));
        return this.safeCurrencyStructure ({
            'id': id,
            'name': this.safeString (rawCurrency, 'name'),
            'code': code,
            'precision': undefined,
            'active': undefined,
            'fee': undefined,
            'networks': {},
            'deposit': canDeposit,
            'withdraw': canWithdraw,
            'type': 'crypto',
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': rawCurrency,
        });
    }

    parseBalance (response): Balances {
        //
        //     {
        //         "subaccount": "0x8d7d64d6cf1d4f018dd101482ac71ad49e30c56064656661756c740000000000",
        //         "exists": true,
        //         "spot_balances": [
        //             {
        //                 "product_id": 0,
        //                 "balance": {
        //                     "amount": "456895621098158389211471"
        //                 }
        //             }
        //         ],
        //         "perp_balances": []
        //     }
        //
        const result: Dict = {
            'info': response,
        };
        const balances = this.safeList (response, 'spot_balances', []);
        for (let i = 0; i < balances.length; i++) {
            const rawBalance = balances[i];
            const currencyId = this.safeString (rawBalance, 'product_id');
            let code = this.safeCurrencyCode (currencyId);
            if (code === '0') {
                code = 'USDT0';
            } else if (code === currencyId) {
                const market = this.safeMarket (currencyId, undefined, undefined, 'spot');
                if (this.safeBool (market, 'spot')) {
                    code = this.safeString (market, 'base', code);
                }
            }
            const balance = this.safeDict (rawBalance, 'balance', {});
            const amount = Precise.stringDiv (this.safeString (balance, 'amount'), '1000000000000000000');
            const account = this.account ();
            account['total'] = amount;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "submission_idx": "563011",
        //         "timestamp": "1679728127",
        //         "subaccount": "0x...",
        //         "product_id": 5,
        //         "event_type": "deposit_collateral",
        //         "transaction_type": "deposit",
        //         "pre_balance": {
        //             "spot": {
        //                 "balance": {
        //                     "amount": "1000000000000000000"
        //                 }
        //             }
        //         },
        //         "post_balance": {
        //             "spot": {
        //                 "balance": {
        //                     "amount": "2000000000000000000"
        //                 }
        //             }
        //         }
        //     }
        //
        const currencyId = this.safeString (transaction, 'product_id');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        const preBalance = this.safeDict (transaction, 'pre_balance', {});
        const postBalance = this.safeDict (transaction, 'post_balance', {});
        const preSpot = this.safeDict (preBalance, 'spot', {});
        const postSpot = this.safeDict (postBalance, 'spot', {});
        const preSpotBalance = this.safeDict (preSpot, 'balance', {});
        const postSpotBalance = this.safeDict (postSpot, 'balance', {});
        const preAmount = this.safeString (preSpotBalance, 'amount', '0');
        const postAmount = this.safeString (postSpotBalance, 'amount', '0');
        const amount = this.parseX18 (Precise.stringAbs (Precise.stringSub (postAmount, preAmount)));
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'submission_idx'),
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': this.safeString (transaction, 'transaction_type'),
            'amount': amount,
            'currency': code,
            'status': 'ok',
            'updated': undefined,
            'fee': undefined,
            'network': undefined,
            'comment': undefined,
            'internal': undefined,
        };
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        //
        //     {
        //         "product_id": 2,
        //         "balance": {
        //             "amount": "100000000000000000",
        //             "v_quote_balance": "3033500000000000000000",
        //             "last_cumulative_funding_x18": "-394223711772447555304"
        //         },
        //         "product": {
        //             "product_id": 2,
        //             "oracle_price_x18": "115596528090565357611177",
        //             "risk": {
        //                 "price_x18": "115596528090565357611177"
        //             }
        //         }
        //     }
        //
        const marketId = this.safeString (position, 'product_id');
        market = this.safeMarket (marketId, market);
        const balance = this.safeDict (position, 'balance', {});
        const amountString = this.safeString (balance, 'amount');
        const product = this.safeDict (position, 'product', {});
        const risk = this.safeDict (product, 'risk', {});
        const markPriceX18 = this.safeString2 (risk, 'price_x18', 'oracle_price_x18');
        const vQuoteBalance = this.safeString (balance, 'v_quote_balance');
        let side = undefined;
        let contracts = undefined;
        let entryPrice = undefined;
        let markPrice = undefined;
        let notional = undefined;
        if (amountString !== undefined) {
            if (Precise.stringGt (amountString, '0')) {
                side = 'long';
            } else if (Precise.stringLt (amountString, '0')) {
                side = 'short';
            }
            const absoluteAmount = Precise.stringAbs (amountString);
            contracts = this.parseX18 (absoluteAmount);
            if ((vQuoteBalance !== undefined) && !Precise.stringEquals (absoluteAmount, '0')) {
                entryPrice = this.parseNumber (Precise.stringDiv (Precise.stringAbs (vQuoteBalance), absoluteAmount));
            }
            if (markPriceX18 !== undefined) {
                markPrice = this.parseX18 (markPriceX18);
                const notionalX36 = Precise.stringMul (absoluteAmount, markPriceX18);
                notional = this.parseNumber (Precise.stringDiv (notionalX36, '1000000000000000000000000000000000000'));
            }
        }
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'isolated': undefined,
            'hedged': false,
            'side': side,
            'contracts': contracts,
            'contractSize': this.safeNumber (market, 'contractSize'),
            'entryPrice': entryPrice,
            'markPrice': markPrice,
            'notional': notional,
            'leverage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'liquidationPrice': undefined,
            'marginMode': undefined,
            'marginRatio': undefined,
            'percentage': undefined,
        });
    }

    isArchiveOrderClosed (order: Dict): boolean {
        const amount = this.safeString (order, 'amount');
        const filled = this.safeString (order, 'base_filled');
        if ((amount === undefined) || (filled === undefined)) {
            return false;
        }
        return Precise.stringGe (Precise.stringAbs (filled), Precise.stringAbs (amount));
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // create order
        //
        //     {
        //         "status": "success",
        //         "signature": "0x...",
        //         "data": {
        //             "digest": "0x..."
        //         },
        //         "request_type": "execute_place_order",
        //         "id": 100,
        //         "place_order": {
        //             "product_id": 2,
        //             "order": {
        //                 "sender": "0x...",
        //                 "priceX18": "1000000000000000000",
        //                 "amount": "1000000000000000000",
        //                 "expiration": "4294967295",
        //                 "nonce": "1757062078359666688",
        //                 "appendix": "1"
        //             },
        //             "signature": "0x..."
        //         }
        //     }
        //
        // open/cancel order
        //
        //     {
        //         "product_id": 2,
        //         "sender": "0x...",
        //         "price_x18": "20000000000000000000000",
        //         "amount": "-100000000000000000",
        //         "expiration": "1686332748",
        //         "order_type": "post_only",
        //         "nonce": "1768248100142339392",
        //         "unfilled_amount": "-100000000000000000",
        //         "digest": "0x...",
        //         "appendix": "1537",
        //         "placed_at": 1686332708
        //     }
        //
        let id = undefined;
        let timestamp = undefined;
        let timeInForce = undefined;
        let postOnly = undefined;
        let side = undefined;
        let price = undefined;
        let amount = undefined;
        let filled = undefined;
        let remaining = undefined;
        let cost = undefined;
        let average = undefined;
        let fee = undefined;
        let lastTradeTimestamp = undefined;
        let status = undefined;
        const cancelOrderDigest = this.safeString (order, 'digest');
        const archiveFilled = this.safeString (order, 'base_filled');
        if (archiveFilled !== undefined) {
            id = cancelOrderDigest;
            const marketId = this.safeString (order, 'product_id');
            market = this.safeMarket (marketId, market);
            const amountString = this.safeString (order, 'amount');
            if (amountString !== undefined) {
                side = Precise.stringLt (amountString, '0') ? 'sell' : 'buy';
                amount = this.parseX18 (Precise.stringAbs (amountString));
            }
            filled = this.parseX18 (Precise.stringAbs (archiveFilled));
            const costString = this.safeString (order, 'quote_filled');
            cost = (costString === undefined) ? undefined : this.parseX18 (Precise.stringAbs (costString));
            if ((filled !== undefined) && (cost !== undefined)) {
                average = Precise.stringDiv (this.numberToString (cost), this.numberToString (filled));
            }
            if ((amountString !== undefined) && (archiveFilled !== undefined)) {
                remaining = this.parseX18 (Precise.stringMax (Precise.stringSub (Precise.stringAbs (amountString), Precise.stringAbs (archiveFilled)), '0'));
            }
            timestamp = this.safeTimestamp (order, 'first_fill_timestamp');
            lastTradeTimestamp = this.safeTimestamp (order, 'last_fill_timestamp');
            price = this.parseX18 (this.safeString (order, 'price_x18'));
            status = this.safeString (order, 'status');
            if (status === undefined) {
                if (this.isArchiveOrderClosed (order)) {
                    status = 'closed';
                }
            }
            const feeCost = this.parseX18 (this.safeString (order, 'fee'));
            if (feeCost !== undefined) {
                fee = {
                    'cost': feeCost,
                    'currency': market['quote'],
                };
            }
        } else if (cancelOrderDigest !== undefined) {
            id = cancelOrderDigest;
            const marketId = this.safeString (order, 'product_id');
            market = this.safeMarket (marketId, market);
            const amountString = this.safeString (order, 'amount');
            if (amountString !== undefined) {
                side = Precise.stringLt (amountString, '0') ? 'sell' : 'buy';
                amount = this.parseX18 (Precise.stringAbs (amountString));
            }
            const unfilledAmount = this.safeString (order, 'unfilled_amount');
            if (unfilledAmount !== undefined) {
                remaining = this.parseX18 (Precise.stringAbs (unfilledAmount));
            }
            timestamp = this.safeTimestamp (order, 'placed_at');
            const orderType = this.safeString (order, 'order_type');
            timeInForce = this.parseOrderTimeInForce (orderType);
            postOnly = orderType === 'post_only';
            price = this.parseX18 (this.safeString (order, 'price_x18'));
            status = this.safeString (order, 'status', 'open');
        } else {
            const placeOrder = this.safeDict (order, 'place_order', {});
            const rawOrder = this.safeDict (placeOrder, 'order', {});
            const marketId = this.safeString (placeOrder, 'product_id');
            market = this.safeMarket (marketId, market);
            const data = this.safeDict (order, 'data', {});
            id = this.safeString (data, 'digest');
            const amountString = this.safeString (rawOrder, 'amount');
            if (amountString !== undefined) {
                side = Precise.stringLt (amountString, '0') ? 'sell' : 'buy';
                amount = this.parseX18 (Precise.stringAbs (amountString));
            }
            const responseStatus = this.safeString (order, 'status');
            status = 'rejected';
            if (responseStatus === 'success') {
                status = 'open';
            }
            price = this.parseX18 (this.safeString (rawOrder, 'priceX18'));
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': undefined,
            'symbol': market['symbol'],
            'type': 'limit',
            'timeInForce': timeInForce,
            'postOnly': postOnly,
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

    parseOrderTimeInForce (timeInForce: Str) {
        const timeInForces: Dict = {
            'default': 'GTC',
            'ioc': 'IOC',
            'fok': 'FOK',
            'post_only': 'PO',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    convertToX18 (value: string) {
        return Precise.stringDiv (Precise.stringMul (value, '1000000000000000000'), '1', 0);
    }

    parseX18 (value) {
        if (value === undefined) {
            return undefined;
        }
        return this.parseNumber (Precise.stringDiv (value, '1000000000000000000'));
    }

    createOrderNonce (recvWindow) {
        const expires = this.sum (this.milliseconds (), recvWindow);
        return Precise.stringMul (this.numberToString (expires), '1048576');
    }

    createOrderAppendix (params = {}) {
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        const postOnly = this.isPostOnly (false, undefined, params);
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        let orderType = 0;
        if (timeInForce === 'IOC') {
            orderType = 1;
        } else if (timeInForce === 'FOK') {
            orderType = 2;
        } else if (postOnly || (timeInForce === 'PO')) {
            orderType = 3;
        } else if ((timeInForce !== undefined) && (timeInForce !== 'GTC')) {
            throw new BadRequest (this.id + ' createOrder() only supports timeInForce values GTC, IOC, FOK, or PO');
        }
        let appendix = '1'; // version
        if (orderType !== 0) {
            appendix = Precise.stringAdd (appendix, Precise.stringMul (this.numberToString (orderType), '512'));
        }
        if (reduceOnly) {
            appendix = Precise.stringAdd (appendix, '2048');
        }
        return appendix;
    }

    createSubaccount (walletAddress: string, subaccount = 'default') {
        if (walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires exchange.walletAddress');
        }
        const address = this.remove0xPrefix (walletAddress).toLowerCase ();
        if (address.length !== 40) {
            throw new BadRequest (this.id + ' createOrder() requires a 20-byte walletAddress');
        }
        const encoded = this.remove0xPrefix (this.stringToBase16 (subaccount));
        if (encoded.length > 24) {
            throw new BadRequest (this.id + ' createOrder() subaccount must fit in 12 bytes');
        }
        return '0x' + address + this.padHex (encoded, 24, false);
    }

    async queryContracts (params = {}) {
        const cachedContracts = this.safeDict (this.options, 'gatewayContracts');
        if (cachedContracts !== undefined) {
            return cachedContracts;
        }
        const request: Dict = {
            'type': 'contracts',
        };
        const response = await this.gatewayPublicGetQuery (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        this.options['gatewayContracts'] = data;
        return data;
    }

    orderVerifyingContract (productId: Int) {
        return '0x' + this.padHex (this.intToBase16 (productId), 40);
    }

    padHex (value: string, length: Int, left = true) {
        const zeros = '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
        const padded = left ? (zeros + value) : (value + zeros);
        if (left) {
            const start = padded.length - length;
            return padded.slice (start, padded.length);
        }
        return padded.slice (0, length);
    }

    signOrder (order, productId: Int, chainId) {
        const domain: Dict = {
            'name': 'Nado',
            'version': '0.0.1',
            'chainId': chainId,
            'verifyingContract': this.orderVerifyingContract (productId),
        };
        const messageTypes: Dict = {
            'Order': [
                { 'name': 'sender', 'type': 'bytes32' },
                { 'name': 'priceX18', 'type': 'int128' },
                { 'name': 'amount', 'type': 'int128' },
                { 'name': 'expiration', 'type': 'uint64' },
                { 'name': 'nonce', 'type': 'uint64' },
                { 'name': 'appendix', 'type': 'uint128' },
            ],
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, order);
        const hash = '0x' + this.hash (encoded, keccak, 'hex');
        return this.signHash (hash, this.privateKey);
    }

    signCancellation (cancellation, chainId, endpointAddress: string) {
        const domain: Dict = {
            'name': 'Nado',
            'version': '0.0.1',
            'chainId': chainId,
            'verifyingContract': endpointAddress,
        };
        const messageTypes: Dict = {
            'Cancellation': [
                { 'name': 'sender', 'type': 'bytes32' },
                { 'name': 'productIds', 'type': 'uint32[]' },
                { 'name': 'digests', 'type': 'bytes32[]' },
                { 'name': 'nonce', 'type': 'uint64' },
            ],
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, cancellation);
        const hash = '0x' + this.hash (encoded, keccak, 'hex');
        return this.signHash (hash, this.privateKey);
    }

    signCancellationProducts (cancellation, chainId, endpointAddress: string) {
        const domain: Dict = {
            'name': 'Nado',
            'version': '0.0.1',
            'chainId': chainId,
            'verifyingContract': endpointAddress,
        };
        const messageTypes: Dict = {
            'CancellationProducts': [
                { 'name': 'sender', 'type': 'bytes32' },
                { 'name': 'productIds', 'type': 'uint32[]' },
                { 'name': 'nonce', 'type': 'uint64' },
            ],
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, cancellation);
        const hash = '0x' + this.hash (encoded, keccak, 'hex');
        return this.signHash (hash, this.privateKey);
    }

    signHash (hash, privateKey) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = this.intToBase16 (this.sum (27, signature['v'])).toLowerCase ();
        return '0x' + this.padHex (r, 64) + this.padHex (s, 64) + v;
    }

    removeMarketSuffix (marketId) {
        if (marketId === undefined) {
            return undefined;
        }
        if (marketId.endsWith ('-PERP')) {
            return marketId.slice (0, -5);
        }
        return marketId;
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = api[0];
        if (typeof api === 'string') {
            endpoint = api;
        }
        let url = this.urls['api'][endpoint];
        if (path !== '') {
            url += '/' + this.implodeParams (path, params);
        }
        const query = this.omit (params, this.extractParams (path));
        headers = {};
        if ((endpoint === 'gateway') || (endpoint === 'archive')) {
            headers['Accept-Encoding'] = 'gzip, br, deflate';
        }
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            headers['Content-Type'] = 'application/json';
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "status": "failure",
        //         "signature": "0x...",
        //         "error_code": 2007,
        //         "error": "Order price must be within a range of 80% to 120% of oracle price.",
        //         "request_type": "execute_place_order"
        //     }
        //
        const status = this.safeString (response, 'status');
        const errorCode = this.safeString (response, 'error_code');
        const error = this.safeString (response, 'error');
        if ((status === 'failure') || (errorCode !== undefined) || (error !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
