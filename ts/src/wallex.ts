
//  ---------------------------------------------------------------------------

import Exchange from './abstract/wallex.js';
import { ExchangeError, AuthenticationError, InsufficientFunds, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Dict, Endpoint, Market, Num, NullableDict, Order, OrderSide, OrderType, Str, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class wallex
 * @augments Exchange
 */
export default class wallex extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'wallex',
            'name': 'Wallex',
            'countries': [ 'IR' ],
            'rateLimit': 100,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
            },
            'urls': {
                'api': {
                    'rest': 'https://api.wallex.ir',
                },
                'www': 'https://wallex.ir',
                'doc': [
                    'https://developers.wallex.ir',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'v1/markets': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/currencies/stats': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/depth': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trades': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/udf/history': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        'v1/account/profile': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/balances': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/openOrders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/trades': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/orders/{clientOrderId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v1/account/orders': { 'cost': 5 } as Endpoint<Dict>, // documented limit is 20 requests per 10 seconds
                    },
                    'delete': {
                        'v1/account/orders': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'precisionMode': TICK_SIZE,
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': undefined,
                    'fetchOpenOrders': undefined,
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': undefined,
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    '1201': AuthenticationError, // authorization header is missing / invalid API key format
                    '1003': InvalidOrder, // below the market's minimum order value
                    '1006': InsufficientFunds, // not enough balance
                },
                'broad': {},
            },
            'options': {
                // ponytail: binance-style values, wallex does not document the enum
                'orderStatuses': {
                    'NEW': 'open',
                    'PARTIALLY_FILLED': 'open',
                    'FILLED': 'closed',
                    'CANCELED': 'canceled',
                    'REJECTED': 'rejected',
                    'EXPIRED': 'expired',
                },
            },
            'commonCurrencies': {
                'TMN': 'IRT', // toman
            },
        });
    }

    /**
     * @method
     * @name wallex#fetchMarkets
     * @description retrieves data on all markets for wallex
     * @see https://developers.wallex.ir
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV1Markets (params);
        //
        //     {
        //         "result": { "symbols": { "BTCUSDT": { ... }, "USDTTMN": { ... } } },
        //         "message": "The operation was successful",
        //         "success": true
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const symbols = this.safeDict (result, 'symbols', {});
        const markets = Object.values (symbols);
        return this.parseMarkets (markets);
    }

    override parseMarket (market: Dict): Market {
        //
        //     {
        //         "symbol": "USDTTMN",
        //         "baseAsset": "USDT",
        //         "baseAssetPrecision": 8,
        //         "quoteAsset": "TMN",
        //         "quotePrecision": 0,
        //         "stepSize": 2,        // amount decimals, not a step
        //         "tickSize": 0,        // price decimals, not a tick
        //         "minQty": 0.01,
        //         "minNotional": 50000,
        //         "stats": { ... },
        //         "createdAt": "2020-12-01T00:00:00Z",
        //         ...
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return this.safeMarketStructure ({
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'stepSize'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'tickSize'))),
            },
            'limits': {
                'amount': { 'min': this.safeNumber (market, 'minQty'), 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': this.safeNumber (market, 'minNotional'), 'max': undefined },
                'leverage': { 'min': undefined, 'max': undefined },
            },
            'created': this.parse8601 (this.safeString (market, 'createdAt')),
            'info': market,
        });
    }

    /**
     * @method
     * @name wallex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.wallex.ir
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetV1AccountBalances (params);
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        //
        //     {
        //         "result": {
        //             "balances": {
        //                 "BTC": { "asset": "BTC", "faName": "بیت کوین", "fiat": false, "value": "0.5", "locked": "0.1" },
        //                 "TMN": { "asset": "TMN", "faName": "تومان", "fiat": true, "value": "1000000", "locked": "0" }
        //             }
        //         },
        //         "success": true
        //     }
        //
        const result: Dict = { 'info': response };
        const data = this.safeDict (response, 'result', {});
        const balances = this.safeDict (data, 'balances', {});
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = this.safeDict (balances, currencyId, {});
            const account = this.account ();
            account['total'] = this.safeString (balance, 'value');
            account['used'] = this.safeString (balance, 'locked');
            const code = this.safeCurrencyCode (currencyId);
            if (code !== undefined) {
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name wallex#createOrder
     * @description create a trade order
     * @see https://developers.wallex.ir/docs/spot-create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency you want to trade
     * @param {float} [price] the price at which the order is to be fulfilled, wallex marks it required for every type
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] turns the order into STOP_LIMIT or STOP_MARKET
     * @param {string} [params.clientOrderId] [A-Z0-9_], must be unique
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'type': type.toUpperCase (),
            'side': (side === 'buy') ? 'BUY' : 'SELL',
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        if (triggerPrice !== undefined) {
            request['type'] = 'STOP_' + type.toUpperCase ();
            request['stop_Price'] = this.priceToPrecision (symbol, triggerPrice); // sic, capital P
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
        }
        params = this.omit (params, [ 'triggerPrice', 'stopPrice', 'clientOrderId' ]);
        const response = await this.privatePostV1AccountOrders (this.extend (request, params));
        //
        //     {
        //         "message": "...",
        //         "result": {
        //             "symbol": "BTCUSDT", "type": "LIMIT", "side": "BUY", "clientOrderId": "test_clientId",
        //             "price": "82494", "origQty": "0.001", "executedQty": "0", "executedSum": "0", "executedPrice": "0",
        //             "sum": "82.494", "executedPercent": 0, "status": "NEW", "active": true, "fee": "0", "fills": [],
        //             "stopPrice": null, "transactTime": 1700000000, "created_at": "2023-11-14T22:13:20Z"
        //         },
        //         "success": true
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseOrder (result, market);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const statuses = this.safeDict (this.options, 'orderStatuses', {});
        const status = this.safeString (order, 'status');
        let type = this.safeStringLower (order, 'type'); // LIMIT, MARKET, STOP_LIMIT, STOP_MARKET
        if (type !== undefined) {
            type = type.replace ('stop_', '');
        }
        let average = this.safeString (order, 'executedPrice');
        if (Precise.stringEq (average, '0')) {
            average = undefined;
        }
        // wallex identifies orders by clientOrderId for fetch and cancel
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const fills = this.safeList (order, 'fills', []);
        const firstFill = this.safeDict (fills, 0, {});
        const feeCurrencyId = this.safeString (firstFill, 'feeAsset');
        return this.safeOrder ({
            'id': clientOrderId,
            'clientOrderId': clientOrderId,
            'timestamp': this.parse8601 (this.safeString (order, 'created_at')),
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeString (order, 'price'),
            'triggerPrice': this.safeString (order, 'stopPrice'),
            'amount': this.safeString (order, 'origQty'),
            'filled': this.safeString (order, 'executedQty'),
            'remaining': undefined,
            'cost': this.safeString (order, 'executedSum'),
            'average': average,
            'status': this.safeString (statuses, status, status),
            'fee': {
                'cost': this.safeString (order, 'fee'),
                'currency': this.safeCurrencyCode (feeCurrencyId),
            },
            'trades': undefined,
            'info': order,
        }, market);
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        headers = {};
        if (api === 'private') {
            // wallex authenticates with the raw key in x-api-key, there is no secret and no hmac signature
            this.checkRequiredCredentials ();
            headers['X-API-KEY'] = this.apiKey;
        }
        if (method === 'GET') {
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencode (query);
            }
        } else {
            body = this.json (query);
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     { "code": 1201, "message": "invalid API key format", "result": {}, "success": false }
        //     { "code": 422, "message": "...", "result": { "error_code": [ 1006 ], "quantity": [ "..." ] }, "success": false }
        //
        const success = this.safeBool (response, 'success');
        if (success === false) {
            const feedback = this.id + ' ' + body;
            // validation errors carry the specific code in result.error_code, the top-level code is just 422
            const result = this.safeDict (response, 'result', {});
            const errorCodes = this.safeList (result, 'error_code', []);
            this.throwExactlyMatchedException (this.exceptions['exact'], this.safeString (errorCodes, 0), feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], this.safeString (response, 'code'), feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
