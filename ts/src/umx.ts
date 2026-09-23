//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/umx.js';
import { AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, NotSupported, OperationRejected, OrderImmediatelyFillable, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout, RestrictedLocation } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Currencies, Currency, Dict, Endpoint, Int, List, Market, NullableDict, OrderBook, Str, Strings, Ticker, Tickers, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class umx
 * @augments Exchange
 */
export default class umx extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'umx',
            'name': 'UMX',
            'countries': [ ],
            'version': 'v1', // the api block carries the per-endpoint version prefix (v1 or v2)
            'rateLimit': 20, // 50 requests per second on most endpoints, 800 requests per second per ip overall
            'certified': false,
            'pro': false,
            'has': {
                // market types supported by the venue, businessType: spot | linear_perpetual | linear_futures
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                // nothing is implemented yet, flags are flipped on as the methods land
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true, // private
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false, // the venue has no testnet
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1s': '1s',
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'hostname': 'umx.com',
            'urls': {
                'logo': 'https://fe-static.xcoin.com/web-public/favicon.ico', // todo: replace with an uploaded logo
                'api': {
                    'public': 'https://api.{hostname}/api',
                    'private': 'https://api.{hostname}/api',
                },
                'www': 'https://www.umx.com',
                'doc': [
                    'https://www.umx.com/docs/coin-apis/introduction/quick-start',
                ],
                'fees': 'https://www.umx.com/guide/spot-fee-rate',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/market/time': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/public/symbols': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/depth': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/ticker/mini': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/ticker/24hr': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/trade': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/kline': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/markPriceKline': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/index': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/indexPriceKline': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/deliveryExercise/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/market/fundingRate': { 'cost': 1 } as Endpoint<List>,
                        'v1/market/fundingRate/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/public/baseRates': { 'cost': 1 } as Endpoint<List>,
                        'v1/public/spotMarginCollateral': { 'cost': 1 } as Endpoint<List>,
                        'v1/public/haircut': { 'cost': 1 } as Endpoint<List>,
                        'v1/public/flexible/product': { 'cost': 1 } as Endpoint<List>,
                        'v1/public/flexible/rateHistory': { 'cost': 1 } as Endpoint<List>,
                    },
                },
                'private': {
                    'get': {
                        // account management
                        'v1/users/apikeys': { 'cost': 1 } as Endpoint<List>,
                        // trading
                        'v2/trade/openOrders': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/order/info': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/history/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/history/order/operations': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/history/trades': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/openOrderComplex': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/history/orderComplexs': { 'cost': 1 } as Endpoint<Dict>,
                        // block spot rfq
                        'v1/account/convert/exchangeInfo': { 'cost': 1 } as Endpoint<List>,
                        'v1/account/convert/orderStatus': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/convert/history/orders': { 'cost': 1 } as Endpoint<Dict>,
                        // trading account
                        'v2/trade/positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trade/lever': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/balance': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/transferBalance': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/availableBalance': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/interest/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/collateralInfo': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/history/bill': { 'cost': 1 } as Endpoint<Dict>,
                        // funding account
                        'v1/asset/account/info': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/balances': { 'cost': 1 } as Endpoint<List>,
                        'v1/asset/bill': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/asset/currencies': { 'cost': 1 } as Endpoint<List>,
                        'v2/asset/chains': { 'cost': 1 } as Endpoint<List>,
                        'v2/asset/fiatChannels': { 'cost': 1 } as Endpoint<List>,
                        'v1/asset/deposit/address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/deposit/record': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/record': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/transfer/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/accountMembers': { 'cost': 1 } as Endpoint<List>,
                        'v1/asset/crossTransfer/history': { 'cost': 1 } as Endpoint<Dict>,
                        // earn
                        'v1/earn/flexible/records': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        // account management
                        'v1/account/create-subaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/account/deactivate-subaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/account/reactivate-subaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/users/create-apikey': { 'cost': 1 } as Endpoint<Dict>,
                        // trading, 500 orders per second shared across place and cancel
                        'v2/trade/order': { 'cost': 0.04 } as Endpoint<Dict>,
                        'v2/trade/batchOrder': { 'cost': 0.04 } as Endpoint<Dict>,
                        'v1/trade/cancelOrder': { 'cost': 0.04 } as Endpoint<Dict>,
                        'v1/trade/batchCancelOrder': { 'cost': 0.04 } as Endpoint<Dict>,
                        'v1/trade/cancelAllOrder': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trade/countdownCancelAll': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/close-positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/orderComplex': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trade/cancelComplex': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/trade/cancelAllOrderComplexs': { 'cost': 1 } as Endpoint<Dict>,
                        // block spot rfq
                        'v1/account/convert/getQuote': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/convert/acceptQuote': { 'cost': 1 } as Endpoint<Dict>,
                        // trading account
                        'v1/trade/lever': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/trade/stopPosition': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/marginModeSet': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/pm/detail': { 'cost': 1 } as Endpoint<Dict>,
                        // funding account
                        'v1/asset/deposit/provide-info': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/add-address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/update-address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/withdrawal/remove-address': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/asset/transfer': { 'cost': 1 } as Endpoint<Dict>,
                        'v2/asset/crossTransfer': { 'cost': 1 } as Endpoint<Dict>,
                        // earn
                        'v1/earn/flexible/setFlexibleOnOff': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    // todo: fill in the default vip0 maker/taker once the published schedule is captured
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'spot',
                'recvWindow': 5000, // X-ACCESS-RECV-WINDOW, the exchange default
                'timeDifference': 0, // the difference between the system clock and the exchange server clock, set it with loadTimeDifference ()
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                // 'accountName': set it in params or options for institutional member api keys only
                'businessTypes': {
                    'spot': 'spot',
                    'margin': 'spot',
                    'swap': 'linear_perpetual',
                    'future': 'linear_futures',
                    'option': 'options',
                },
            },
            'features': {
                // keep this block in sync with the implemented methods, every entry below is
                // filled in when the corresponding method lands and is verified against the venue
                'default': {
                    'sandbox': false, // the venue has no testnet
                    'fetchCurrencies': {
                        'private': true, // /v2/asset/currencies requires an api key
                    },
                    // createOrder is not implemented yet, so every capability below is false, and
                    // the block cannot be omitted or set to undefined: test.features.ts requires the
                    // key to be present and the base featuresMapper dereferences it unconditionally
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'GTC': false,
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
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
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined, // every instrument is settled in USDT
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    '10000': BadRequest, // POST request body cannot be empty
                    '10001': BadRequest, // JSON syntax error
                    '10002': ExchangeNotAvailable, // Network error, please contact customer support
                    '10003': NotSupported, // API has been deprecated or is unavailable
                    '10005': RateLimitExceeded, // User triggered PID-level rate limit
                    '10006': ExchangeNotAvailable, // System busy, please try again later
                    '10008': RateLimitExceeded, // User triggered system-level gateway rate limit
                    '10010': PermissionDenied, // This API requires the APIKey to be bound to an IP
                    '10101': AuthenticationError, // APIKey does not exist
                    '10102': InvalidNonce, // Request timestamp expired
                    '10103': AuthenticationError, // Request header "X-ACCESS-APIKEY" cannot be empty
                    '10104': AuthenticationError, // Request header "X-ACCESS-SIGN" cannot be empty
                    '10105': AuthenticationError, // Request header "X-ACCESS-TIMESTAMP" cannot be empty
                    '10106': BadRequest, // Request header "Content-Type" cannot be empty
                    '10107': PermissionDenied, // Your ip is not in the APIKey's whitelist
                    '10109': AuthenticationError, // Invalid X-ACCESS-APIKEY
                    '10110': InvalidNonce, // Invalid X-ACCESS-TIMESTAMP
                    '10111': BadRequest, // Invalid Content-Type
                    '10112': AuthenticationError, // Invalid signature
                    '10113': BadRequest, // Invalid request method
                    '10114': PermissionDenied, // APIKey has no permission to call this API
                    '10115': AuthenticationError, // APIKey is disabled
                    '10116': PermissionDenied, // Operator associated with APIKey has no permission for this API
                    '10117': PermissionDenied, // Platform restricts this operation
                    '10118': RequestTimeout, // API request timed out
                    '10119': AccountSuspended, // Account is disabled
                    '10120': PermissionDenied, // Account permission prohibits this trade
                    '10121': PermissionDenied, // Account does not support deposits
                    '10122': PermissionDenied, // Only master account supports withdrawals
                    '10123': ArgumentsRequired, // For member-level APIKey, accountName cannot be empty
                    '10124': PermissionDenied, // Current APIKey has no permission to operate accountName
                    '10125': AccountSuspended, // Member is disabled
                    '10126': PermissionDenied, // Risk questionnaire required
                    '10127': PermissionDenied, // KYC not completed
                    '11004': RateLimitExceeded, // rate limit warning
                    '13000': RestrictedLocation, // Restrictions on conducting business due to IP location
                    '13002': RestrictedLocation, // Restrictions on conducting crypto business based on IP location
                    '13004': RestrictedLocation, // Restrictions based on the customer's registered location
                    '14001': RateLimitExceeded, // System traffic too high, system-level frequency limiting
                    '20001': ExchangeNotAvailable, // Service temporarily unavailable
                    '20002': ExchangeError, // System error, please try again later
                    '20003': ExchangeError, // System execution exception
                    '40001': ArgumentsRequired, // Required parameter cannot be empty
                    '40002': BadRequest, // endTime must be greater than startTime
                    '40004': BadRequest, // endTime - startTime must be less than 30 days
                    '40006': BadSymbol, // Symbol is not in tradable status
                    '40007': BadRequest, // This API businessType does not support the given dictionary value
                    '40008': BadRequest, // limit cannot exceed the maximum value for this API
                    '40009': BadSymbol, // Currency is not listed
                    '40013': OrderNotFound, // Order not found, the order does not exist
                    '40014': NotSupported, // Only spot instruments are supported
                    '40015': BadRequest, // parameter is invalid or does not exist
                    '50001': InvalidOrder, // For market order type, price must be empty
                    '50002': InvalidOrder, // For current orderType, price cannot be empty
                    '50004': InvalidOrder, // Price cannot be negative
                    '50006': InvalidOrder, // For market orders, timeInForce only supports IOC
                    '50007': DuplicateOrderId, // Duplicate clientId error
                    '50008': NotSupported, // Spot trading does not support reduce-only orders
                    '50026': InvalidOrder, // Order already completed, cancellation failed
                    '50032': InvalidOrder, // qty must be positive
                    '50101': NotSupported, // Spot instruments do not support setting leverage
                    '50105': BadRequest, // Leverage cannot exceed the maximum
                    '50106': BadRequest, // Leverage must be a positive integer
                    '50113': InvalidOrder, // post_only orders can only be set to GTC
                    '50201': NotSupported, // currency does not support withdrawals
                    '50205': InvalidOrder, // Amount is below minimum withdrawal limit
                    '60100': InsufficientFunds, // Insufficient available balance, and auto-borrow is not enabled
                    '60101': InsufficientFunds, // Insufficient available balance (including borrowable)
                    '60103': InsufficientFunds, // Insufficient transferable balance in trading account
                    '60106': InsufficientFunds, // Insufficient available balance in the funding account
                    '60107': OperationRejected, // Exceeded maximum number of open orders
                    '60112': InvalidOrder, // Below minimum order quantity per order
                    '60113': InvalidOrder, // Below minimum order amount per order
                    '60116': InvalidOrder, // Price decimal places exceed limit
                    '60117': InvalidOrder, // Quantity decimal places exceed limit
                    '60126': InvalidOrder, // No open positions, reduce-only order not allowed
                    '60136': InvalidOrder, // Input price is not a multiple of tickSize
                    '60142': OrderImmediatelyFillable, // Order price would execute immediately, does not meet post_only condition
                    '60143': OrderNotFillable, // Order price cannot be executed, does not meet IOC or FOK condition
                    '60153': BadSymbol, // Current trading pair not in tradable state
                    '70100': RequestTimeout, // Heartbeat check timed out, connection disconnected
                    '70101': InvalidNonce, // accessTimestamp has expired
                    '70106': RateLimitExceeded, // The number of connections exceeds the upper limit for a single ip
                    '70107': RateLimitExceeded, // Exceeding the upper limit of channels for a single connection
                    '70108': RateLimitExceeded, // The number of connections exceeds the maximum limit for a single user
                },
                'broad': {
                    'Invalid signature': AuthenticationError,
                    'Insufficient': InsufficientFunds,
                    'does not exist': BadRequest,
                    'rate limit': RateLimitExceeded,
                },
            },
        });
    }

    override nonce (): number {
        // the exchange rejects a request whose timestamp is more than one second ahead of its own
        // clock, and X-ACCESS-TIMESTAMP is in milliseconds, while the base nonce () is in seconds
        return this.milliseconds () - this.safeInteger (this.options, 'timeDifference', 0);
    }

    /**
     * @method
     * @name umx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.umx.com/docs/coin-apis/ticker/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params: Dict = {}): Promise<Int> {
        const response = await this.publicGetV1MarketTime (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": { "time": "1790161596695" },
        //         "ts": "1790161596695"
        //     }
        //
        // the docs show "data" as an array of one object, the live endpoint returns a plain object
        //
        const data = this.safeDict (response, 'data', {});
        return this.safeInteger (data, 'time');
    }

    /**
     * @method
     * @name umx#fetchMarkets
     * @description retrieves data on all markets for umx
     * @see https://www.umx.com/docs/coin-apis/ticker/get-the-basic-information-of-trading-products
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference'] === true) {
            await this.loadTimeDifference ();
        }
        const response = await this.publicGetV2PublicSymbols (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [ { ... } ],   // see parseMarket () below for a sample of every businessType
        //         "ts": "1790161596695"
        //     }
        //
        // businessType is documented as required, but the live endpoint returns every instrument
        // type when it is omitted, including "options", which the docs do not list at all
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    override parseMarket (market: Dict): Market {
        //
        // spot
        //
        //     {
        //         "businessType": "spot",
        //         "symbol": "BTC-USDT",
        //         "symbolFamily": "BTC-USDT",
        //         "quoteCurrency": "USDT",
        //         "baseCurrency": "BTC",
        //         "settleCurrency": "USDT",
        //         "ctVal": "0",
        //         "optType": null,
        //         "strikePrice": "0",
        //         "tickSize": "0.01",
        //         "status": "trading",
        //         "deliveryTime": null,
        //         "deliveryFeeRate": null,
        //         "pricePrecision": "2",
        //         "quantityPrecision": "5",
        //         "onlineTime": "1750068000000",
        //         "riskEngineRate": null,
        //         "maxLeverage": "10.000000000000000000",
        //         "contractType": null,
        //         "orderParameters": {
        //             "minOrderQty": "0.00001",
        //             "minOrderAmt": "5",
        //             "maxOrderNum": "500",
        //             "maxBaseNum": null,
        //             "maxComboleg": "0",
        //             "maxTriggerOrderNum": "30",
        //             "maxTpslOrderNum": "30",
        //             "maxLmtOrderAmt": "2000000",
        //             "maxMktOrderAmt": "1400000",
        //             "maxLmtOrderQty": null,
        //             "maxMktOrderQty": null,
        //             "basisLimitRatio": null,
        //             "minRfqQty": null,
        //             "minComboQty": null
        //         },
        //         "priceParameters": {
        //             "maxLmtPriceUp": "0.03",
        //             "minLmtPriceDown": "0.03",
        //             "maxMktPriceUp": "0.015",
        //             "minMktPriceDown": "0.015"
        //         },
        //         "positionParameters": null,
        //         "group": [
        //             "0.01",
        //             "0.1",
        //             "1",
        //             "10"
        //         ]
        //     }
        //
        // linear_perpetual
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "BTC-USDT-PERP",
        //         "symbolFamily": "BTC-USDT",
        //         "quoteCurrency": "USDT",
        //         "baseCurrency": "BTC",
        //         "settleCurrency": "USDT",
        //         "ctVal": "0.0001",
        //         "optType": null,
        //         "strikePrice": "0",
        //         "tickSize": "0.1",
        //         "status": "trading",
        //         "deliveryTime": null,
        //         "deliveryFeeRate": null,
        //         "pricePrecision": "1",
        //         "quantityPrecision": "4",
        //         "onlineTime": "1750127400000",
        //         "riskEngineRate": "0.0125",
        //         "maxLeverage": "75.000000000000000000",
        //         "contractType": null,
        //         "orderParameters": {
        //             "minOrderQty": "0.0001",
        //             "minOrderAmt": null,
        //             "maxOrderNum": "500",
        //             "maxBaseNum": null,
        //             "maxComboleg": "0",
        //             "maxTriggerOrderNum": "30",
        //             "maxTpslOrderNum": "30",
        //             "maxLmtOrderAmt": null,
        //             "maxMktOrderAmt": null,
        //             "maxLmtOrderQty": "1000",
        //             "maxMktOrderQty": "60",
        //             "basisLimitRatio": "0.1",
        //             "minRfqQty": null,
        //             "minComboQty": null
        //         },
        //         "priceParameters": {
        //             "maxLmtPriceUp": "0.05",
        //             "minLmtPriceDown": "0.05",
        //             "maxMktPriceUp": "0.015",
        //             "minMktPriceDown": "0.015"
        //         },
        //         "positionParameters": {
        //             "positionRatioThreshold": "-1",
        //             "positionMaxRatio": "0.1",
        //             "positionCidMaxRatio": "0.3",
        //             "defaultLeverRatio": "10",
        //             "maxShortQty": null
        //         },
        //         "group": [
        //             "0.1",
        //             "1",
        //             "10",
        //             "100"
        //         ]
        //     }
        //
        // linear_futures
        //
        //     {
        //         "businessType": "linear_futures",
        //         "symbol": "BTC-USDT-25SEP26",
        //         "symbolFamily": "BTC-USDT",
        //         "quoteCurrency": "USDT",
        //         "baseCurrency": "BTC",
        //         "settleCurrency": "USDT",
        //         "ctVal": "0.0001",
        //         "optType": null,
        //         "strikePrice": "0",
        //         "tickSize": "0.1",
        //         "status": "trading",
        //         "deliveryTime": "1790323200000",
        //         "deliveryFeeRate": "0.0002",
        //         "pricePrecision": "1",
        //         "quantityPrecision": "4",
        //         "onlineTime": null,
        //         "riskEngineRate": "0.0125",
        //         "maxLeverage": "50.000000000000000000",
        //         "contractType": "current_quarter",
        //         "orderParameters": {
        //             "minOrderQty": "0.0001",
        //             "minOrderAmt": null,
        //             "maxOrderNum": "200",
        //             "maxBaseNum": null,
        //             "maxComboleg": "0",
        //             "maxTriggerOrderNum": "30",
        //             "maxTpslOrderNum": "30",
        //             "maxLmtOrderAmt": null,
        //             "maxMktOrderAmt": null,
        //             "maxLmtOrderQty": "500",
        //             "maxMktOrderQty": "1",
        //             "basisLimitRatio": null,
        //             "minRfqQty": null,
        //             "minComboQty": null
        //         },
        //         "priceParameters": {
        //             "maxLmtPriceUp": "0.05",
        //             "minLmtPriceDown": "0.05",
        //             "maxMktPriceUp": "0.05",
        //             "minMktPriceDown": "0.05"
        //         },
        //         "positionParameters": {
        //             "positionRatioThreshold": "-1",
        //             "positionMaxRatio": "0.1",
        //             "positionCidMaxRatio": "0.3",
        //             "defaultLeverRatio": "5",
        //             "maxShortQty": null
        //         },
        //         "group": [
        //             "0.1",
        //             "1",
        //             "10",
        //             "100"
        //         ]
        //     }
        //
        // options
        //
        //     {
        //         "businessType": "options",
        //         "symbol": "BTC-USDT-27SEP26-96000-C",
        //         "symbolFamily": "BTC-USDT",
        //         "quoteCurrency": "USDT",
        //         "baseCurrency": "BTC",
        //         "settleCurrency": "USDT",
        //         "ctVal": "1",
        //         "optType": "call",
        //         "strikePrice": "96000",
        //         "tickSize": "5",
        //         "status": "trading",
        //         "deliveryTime": "1790496000000",
        //         "deliveryFeeRate": null,
        //         "pricePrecision": "0",
        //         "quantityPrecision": "2",
        //         "onlineTime": "1790151930208",
        //         "riskEngineRate": null,
        //         "maxLeverage": null,
        //         "contractType": null,
        //         "orderParameters": {
        //             "minOrderQty": "0.01",
        //             "minOrderAmt": null,
        //             "maxOrderNum": "8",
        //             "maxBaseNum": "4000",
        //             "maxComboleg": "20",
        //             "maxTriggerOrderNum": "8",
        //             "maxTpslOrderNum": "8",
        //             "maxLmtOrderAmt": null,
        //             "maxMktOrderAmt": null,
        //             "maxLmtOrderQty": null,
        //             "maxMktOrderQty": null,
        //             "basisLimitRatio": null,
        //             "minRfqQty": "0.01",
        //             "minComboQty": "0.01"
        //         },
        //         "priceParameters": {
        //             "maxLmtPriceUp": null,
        //             "minLmtPriceDown": null,
        //             "maxMktPriceUp": null,
        //             "minMktPriceDown": null
        //         },
        //         "positionParameters": {
        //             "positionRatioThreshold": null,
        //             "positionMaxRatio": null,
        //             "positionCidMaxRatio": null,
        //             "defaultLeverRatio": null,
        //             "maxShortQty": "1000"
        //         },
        //         "group": [
        //             "1"
        //         ]
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const businessType = this.safeString (market, 'businessType');
        const baseId = this.safeString (market, 'baseCurrency');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const spot = (businessType === 'spot');
        const swap = (businessType === 'linear_perpetual');
        const future = (businessType === 'linear_futures');
        const option = (businessType === 'options');
        const contract = !spot;
        // spot markets report a settleCurrency too, but a unified spot market has no settlement
        const settleId = (contract) ? this.safeString (market, 'settleCurrency') : undefined;
        const settle = this.safeCurrencyCode (settleId);
        const expiry = this.safeInteger (market, 'deliveryTime');
        const strikePrice = this.safeString (market, 'strikePrice');
        const maxLeverage = this.safeString (market, 'maxLeverage');
        const orderParameters = this.safeDict (market, 'orderParameters', {});
        let marketType = 'spot';
        let optionType: Str = undefined;
        let symbol = base + '/' + quote;
        if (contract) {
            symbol = symbol + ':' + settle;
            marketType = 'swap';
            if (expiry !== undefined) {
                symbol = symbol + '-' + this.yymmdd (expiry);
                marketType = 'future';
            }
            if (option) {
                marketType = 'option';
                optionType = this.safeString (market, 'optType');
                const letter = (optionType === 'call') ? 'C' : 'P';
                symbol = symbol + '-' + strikePrice + '-' + letter;
            }
        }
        // the regex transpiler mangles the first ternary of a return statement, and every one of
        // these reads better as a named value anyway, so they are all resolved before the literal
        const margin = (spot) ? (maxLeverage !== undefined) : undefined;
        // every instrument is quoted and settled in USDT, so there are no inverse contracts
        const linear = (contract) ? true : undefined;
        const inverse = (contract) ? false : undefined;
        // the venue quotes qty in the base currency on every contract market, so one contract is
        // one unit of base, ctVal is the nominal face value and not an order size multiplier,
        // verified live as fillAmount / fillQty == the base price across ctVal from 1e-4 to 1e6
        const contractSize = (contract) ? this.parseNumber ('1') : undefined;
        const strike = (option) ? this.parseNumber (strikePrice) : undefined;
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': spot,
            'margin': margin,
            'swap': swap,
            'future': future,
            'option': option,
            'active': (this.safeString (market, 'status') === 'trading'),
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'taker': undefined,
            'maker': undefined,
            'contractSize': contractSize,
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': strike,
            'optionType': optionType,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityPrecision'))),
                'price': this.safeNumber (market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.parseNumber (maxLeverage),
                },
                'amount': {
                    'min': this.safeNumber (orderParameters, 'minOrderQty'),
                    'max': this.safeNumber (orderParameters, 'maxLmtOrderQty'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (orderParameters, 'minOrderAmt'),
                    'max': this.safeNumber (orderParameters, 'maxLmtOrderAmt'),
                },
            },
            'created': this.safeInteger (market, 'onlineTime'),
            'info': market,
        });
    }

    /**
     * @method
     * @name umx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.umx.com/docs/coin-apis/ticker/get-24-hour-ticker-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const businessTypes = this.safeDict (this.options, 'businessTypes', {});
        const marketType = market['type'];
        const businessType = this.safeString (businessTypes, marketType, marketType);
        // unlike fetchTickers, this endpoint answers for an option market once the symbol is given
        const request: Dict = {
            'businessType': businessType,
            'symbol': market['id'],
        };
        const response = await this.publicGetV1MarketTicker24hr (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "businessType": "spot",
        //                 "symbol": "ETH-USDT",
        //                 "priceChange": "-30.46",
        //                 "priceChangePercent": "-0.011",
        //                 "lastPrice": "2722.76",
        //                 "openPrice": "2753.22",
        //                 "highPrice": "2788.61",
        //                 "lowPrice": "2713.98",
        //                 "fillQty": "420.3057",
        //                 "fillAmount": "1155317.195959",
        //                 "count": "18853",
        //                 "baseCurrency": "ETH",
        //                 "indexPrice": "2722.73",
        //                 "markPrice": "0",
        //                 "fundingRate": "0",
        //                 "toNextFundRateTime": "0",
        //                 "markIv": null,
        //                 "underlyingPrice": null,
        //                 "delta": "0",
        //                 "gamma": "0",
        //                 "vega": "0",
        //                 "theta": "0"
        //             }
        //         ],
        //         "ts": "1790167770773"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        // a listed market that has never traded answers with code 0 and an empty data array,
        // the parsed ticker then carries the symbol and the timestamp with empty values
        const first = this.safeDict (data, 0, {});
        const timestamp = this.safeInteger (response, 'ts');
        return this.parseTicker (this.extend (first, {
            'ts': timestamp,
        }), market);
    }

    /**
     * @method
     * @name umx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.umx.com/docs/coin-apis/ticker/get-24-hour-ticker-data
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all markets of one instrument type are returned if not given
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] the instrument type to query, one of 'spot', 'swap' or 'future', defaults to options['defaultType'], option markets are not supported
     * @param {string} [params.baseCurrency] *spot only* base currency id
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true);
        let market: Market = undefined;
        if (symbols !== undefined) {
            market = this.getMarketFromSymbols (symbols);
        }
        let marketType: Str = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        if (marketType === 'option') {
            // the endpoint serves option tickers for one base currency per call and silently
            // defaults to btc, so the whole option universe cannot be returned by a single request
            // even with a base currency specified, the endpoint does not return tickers for all
            // of that currency's option markets, e.g. 9 tickers against 840 listed eth options
            throw new NotSupported (this.id + ' fetchTickers() does not support option markets');
        }
        const businessTypes = this.safeDict (this.options, 'businessTypes', {});
        const businessType = this.safeString (businessTypes, marketType, marketType);
        const request: Dict = {
            'businessType': businessType,
        };
        const response = await this.publicGetV1MarketTicker24hr (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "businessType": "linear_perpetual",
        //                 "symbol": "ETH-USDT-PERP",
        //                 "priceChange": "-30.3",
        //                 "priceChangePercent": "-0.011",
        //                 "lastPrice": "2721.27",
        //                 "openPrice": "2751.57",
        //                 "highPrice": "2787.63",
        //                 "lowPrice": "2709.91",
        //                 "fillQty": "7004.355",
        //                 "fillAmount": "19267598.6709",
        //                 "count": "26317",
        //                 "baseCurrency": "ETH",
        //                 "indexPrice": "2722.74",
        //                 "markPrice": "2721.27",
        //                 "fundingRate": "-0.000024",
        //                 "toNextFundRateTime": "11429182",
        //                 "markIv": null,
        //                 "underlyingPrice": null,
        //                 "delta": "0",
        //                 "gamma": "0",
        //                 "vega": "0",
        //                 "theta": "0"
        //             }
        //         ],
        //         "ts": "1790167771743"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        // the entries carry no timestamp of their own, only the envelope does
        const timestamp = this.safeInteger (response, 'ts');
        const rawTickers: List = [];
        for (let i = 0; i < data.length; i++) {
            rawTickers.push (this.extend (this.safeDict (data, i, {}), {
                'ts': timestamp,
            }));
        }
        return this.parseTickers (rawTickers, symbols);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'ts');
        const last = this.safeString (ticker, 'lastPrice');
        // priceChangePercent is a ratio, e.g. "-0.011" for -1.1%
        const percentage = Precise.stringMul (this.safeString (ticker, 'priceChangePercent'), '100');
        // the endpoint reports no order book top, and it zero fills markPrice on spot markets
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'fillQty'),
            'quoteVolume': this.safeString (ticker, 'fillAmount'),
            'indexPrice': this.omitZero (this.safeString (ticker, 'indexPrice')),
            'markPrice': this.omitZero (this.safeString (ticker, 'markPrice')),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name umx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.umx.com/docs/coin-apis/ticker/get-order-book-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'], // businessType is accepted but not needed, every market id is unique across the venue
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketDepth (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": {
        //             "bids": [ [ "85496.65", "1.2485" ], [ "85490.24", "0.60673" ] ],
        //             "asks": [ [ "85496.66", "14.99583" ], [ "85500.08", "1.88534" ] ],
        //             "lastUpdateId": "2995940926"
        //         },
        //         "ts": "1790166895485"
        //     }
        //
        // the docs cap limit at 100, the endpoint actually returns every level it has
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (response, 'ts');
        const orderbook = this.parseOrderBook (data, market['symbol'], timestamp, 'bids', 'asks');
        orderbook['nonce'] = this.safeInteger (data, 'lastUpdateId');
        return orderbook;
    }

    /**
     * @method
     * @name umx#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.umx.com/docs/coin-apis/funding-account/get-currency-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        // this endpoint requires authentication, while fetchCurrencies is a public method by design,
        // therefore we check the keys here and return an empty result when they are missing
        if (!this.checkRequiredCredentials (false)) {
            return {};
        }
        const response = await this.privateGetV2AssetCurrencies (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "Success",
        //         "data": [
        //             {
        //                 "accountName": "...",
        //                 "pid": "...",
        //                 "uid": "...",
        //                 "cid": "...",
        //                 "currency": "USDT",
        //                 "currencyType": "crypto",
        //                 "name": "Tether",
        //                 "icon": "https://static.xcoin.com/COIN/USDT.png",
        //                 "depositAuth": true,
        //                 "withdrawAuth": true,
        //                 "currencyPrecision": "6",
        //                 "transfer": {
        //                     "fundToTradeAuth": true,
        //                     "fundToSecuritiesAuth": false,
        //                     "securitiesToFundAuth": false,
        //                     "securitiesToTradeAuth": false,
        //                     "tradeToFundAuth": true,
        //                     "tradeToSecuritiesAuth": false
        //                 }
        //             }
        //         ],
        //         "ts": "1790164067624"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseCurrencies (data);
    }

    override parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'currency');
        // the venue reports "crypto", "fiat" and "ST" (tokenized stock), the latter has no unified name
        let currencyType = this.safeString (rawCurrency, 'currencyType');
        if (currencyType === 'ST') {
            currencyType = 'other';
        }
        return this.safeCurrencyStructure ({
            'id': id,
            'code': this.safeCurrencyCode (id),
            'name': this.safeString (rawCurrency, 'name'),
            'type': currencyType,
            // the endpoint has no trading status field, only deposit and withdrawal permissions
            'active': undefined,
            'deposit': this.safeBool (rawCurrency, 'depositAuth'),
            'withdraw': this.safeBool (rawCurrency, 'withdrawAuth'),
            'fee': undefined,
            'precision': this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'currencyPrecision'))),
            // per network data lives in /v2/asset/chains, which only accepts one currency per call
            'networks': {},
            'limits': {
                'deposit': {
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

    override sign (path: any, api = 'public', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        const request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api'][api]) + request;
        let queryString = '';
        if (method === 'GET') {
            if (Object.keys (query).length > 0) {
                // the signature covers the query string exactly as it is sent, and the official sdks
                // join the parameters without percent encoding, e.g. currencyList=BTC,USDT
                queryString = '?' + this.rawencode (query);
                url += queryString;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString (); // the exchange allows same timestamps, so incrementingNonce is not necessary
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length > 0) {
                    payload = this.json (query);
                } else {
                    // this fix for PHP is required otherwise it generates
                    // '[]' on empty arrays even when forced to use objects
                    payload = '{}';
                }
                body = payload;
            }
            const auth = timestamp + method + request + queryString + payload;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'hex');
            headers = {
                'Content-Type': 'application/json',
                'X-ACCESS-APIKEY': this.apiKey,
                'X-ACCESS-TIMESTAMP': timestamp,
                'X-ACCESS-SIGN': signature,
            };
            const recvWindow = this.safeInteger (this.options, 'recvWindow');
            if (recvWindow !== undefined) {
                headers['X-ACCESS-RECV-WINDOW'] = recvWindow.toString ();
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler, the waf rejects blocked requests with a non json 403 page
        }
        // every response carries a string code, "0" means success
        //
        //     { "code": "0", "msg": "Success", "ts": "...", "data": ... }
        //
        const errorCode = this.safeString (response, 'code');
        if ((errorCode !== undefined) && (errorCode !== '0')) {
            const message = this.safeString2 (response, 'msg', 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
