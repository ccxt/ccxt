//  ---------------------------------------------------------------------------

import Exchange from './abstract/aster.js';
import { AccountNotEnabled, AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadResponse, BadSymbol, DuplicateOrderId, ExchangeClosedByUser, ExchangeError, InsufficientFunds, InvalidNonce, InvalidOrder, MarketClosed, NetworkError, NoChange, NotSupported, OperationFailed, OperationRejected, OrderImmediatelyFillable, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import Precise from './base/Precise.js';
import type { Balances, Currencies, Currency, Dict, FundingRate, FundingRateHistory, FundingRates, int, Int, LedgerEntry, Leverage, Leverages, MarginMode, MarginModes, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface } from './base/types.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';

//  ---------------------------------------------------------------------------xs
/**
 * @class aster
 * @augments Exchange
 */
export default class aster extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'aster',
            'name': 'Aster',
            'countries': [ 'US' ],
            // 3 req/s for free
            // 150 req/s for subscribers: https://aster.markets/data
            // for brokers: https://aster.markets/docs/api-references/broker-api/#authentication-and-rate-limit
            'rateLimit': 333,
            'hostname': 'aster.markets',
            'pro': true,
            'urls': {
                'logo': '',
                'www': 'https://www.asterdex.com/en',
                'api': {
                    'rest': 'https://fapi.asterdex.com',
                },
                'doc': 'https://github.com/asterdex/api-docs',
                'fees': 'https://docs.asterdex.com/product/asterex-simple/fees-and-slippage',
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': false,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'editOrders': false,
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': 'emulated',
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrder': false,
                'fetchClosedOrders': 'emulated',
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingInterval': 'emulated',
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': 'emulated',
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': true,
                'fetchLedgerEntry': false,
                'fetchLeverage': 'emulated',
                'fetchLeverages': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': true,
                'fetchMarginMode': 'emulated',
                'fetchMarginModes': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrice': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': true,
                'fetchPositions': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': 'emulated',
                'fetchTransactionFee': 'emulated',
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'api': {
                'public': {
                    'get': [
                        'fapi/v1/ping',
                        'fapi/v1/time',
                        'fapi/v1/exchangeInfo',
                        'fapi/v1/depth',
                        'fapi/v1/trades',
                        'fapi/v1/historicalTrades',
                        'fapi/v1/aggTrades',
                        'fapi/v1/klines',
                        'fapi/v1/indexPriceKlines',
                        'fapi/v1/markPriceKlines',
                        'fapi/v1/premiumIndex',
                        'fapi/v1/fundingRate',
                        'fapi/v1/ticker/24hr',
                        'fapi/v1/ticker/price',
                        'fapi/v1/ticker/bookTicker',
                        'fapi/v1/leverageBracket',
                        'fapi/v1/adlQuantile',
                        'fapi/v1/forceOrders',
                    ],
                },
                'private': {
                    'get': [
                        'fapi/v1/positionSide/dual',
                        'fapi/v1/multiAssetsMargin',
                        'fapi/v1/order',
                        'fapi/v1/openOrder',
                        'fapi/v1/openOrders',
                        'fapi/v1/allOrders',
                        'fapi/v2/balance',
                        'fapi/v2/account',
                        'fapi/v1/positionMargin/history',
                        'fapi/v2/positionRisk',
                        'fapi/v1/userTrades',
                        'fapi/v1/income',
                        'fapi/v1/commissionRate',
                    ],
                    'post': [
                        'fapi/v1/order',
                        'fapi/v1/positionSide/dual',
                        'fapi/v1/multiAssetsMargin',
                        'fapi/v1/order/test',
                        'fapi/v1/batchOrders',
                        'fapi/v1/countdownCancelAll',
                        'fapi/v1/leverage',
                        'fapi/v1/marginType',
                        'fapi/v1/positionMargin',
                        'fapi/v1/listenKey',
                    ],
                    'put': [
                        'fapi/v1/listenKey',
                    ],
                    'delete': [
                        'fapi/v1/order',
                        'fapi/v1/allOpenOrders',
                        'fapi/v1/batchOrders',
                        'fapi/v1/listenKey',
                    ],
                },
            },
            'timeframes': {
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
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
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
                'recvWindow': 10 * 1000, // 10 sec
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            },
            'exceptions': {
                'exact': {
                    // 10xx - General Server or Network issues
                    '-1000': OperationFailed, // UNKNOWN
                    '-1001': NetworkError, // DISCONNECTED
                    '-1002': AuthenticationError, // UNAUTHORIZED
                    '-1003': RateLimitExceeded, // TOO_MANY_REQUESTS
                    '-1004': DuplicateOrderId, // DUPLICATE_IP
                    '-1005': BadRequest, // NO_SUCH_IP
                    '-1006': BadResponse, // UNEXPECTED_RESP
                    '-1007': RequestTimeout, // TIMEOUT
                    '-1010': OperationFailed, // ERROR_MSG_RECEIVED
                    '-1011': PermissionDenied, // NON_WHITE_LIST
                    '-1013': BadRequest, // INVALID_MESSAGE
                    '-1014': OrderNotFillable, // UNKNOWN_ORDER_COMPOSITION
                    '-1015': RateLimitExceeded, // TOO_MANY_ORDERS
                    '-1016': ExchangeClosedByUser, // SERVICE_SHUTTING_DOWN
                    '-1020': NotSupported, // UNSUPPORTED_OPERATION
                    '-1021': InvalidNonce, // INVALID_TIMESTAMP
                    '-1022': AuthenticationError, // INVALID_SIGNATURE
                    '-1023': BadRequest, // START_TIME_GREATER_THAN_END_TIME
                    // 11xx - Request issues
                    '-1100': BadRequest, // ILLEGAL_CHARS
                    '-1101': BadRequest, // TOO_MANY_PARAMETERS
                    '-1102': ArgumentsRequired, // MANDATORY_PARAM_EMPTY_OR_MALFORMED
                    '-1103': BadRequest, // UNKNOWN_PARAM
                    '-1104': BadRequest, // UNREAD_PARAMETERS
                    '-1105': ArgumentsRequired, // PARAM_EMPTY
                    '-1106': BadRequest, // PARAM_NOT_REQUIRED
                    '-1108': BadRequest, // BAD_ASSET
                    '-1109': BadRequest, // BAD_ACCOUNT
                    '-1110': BadSymbol, // BAD_INSTRUMENT_TYPE
                    '-1111': BadRequest, // BAD_PRECISION
                    '-1112': BadRequest, // NO_DEPTH
                    '-1113': BadRequest, // WITHDRAW_NOT_NEGATIVE
                    '-1114': BadRequest, // TIF_NOT_REQUIRED
                    '-1115': InvalidOrder, // INVALID_TIF
                    '-1116': InvalidOrder, // INVALID_ORDER_TYPE
                    '-1117': InvalidOrder, // INVALID_SIDE
                    '-1118': InvalidOrder, // EMPTY_NEW_CL_ORD_ID
                    '-1119': InvalidOrder, // EMPTY_ORG_CL_ORD_ID
                    '-1120': BadRequest, // BAD_INTERVAL
                    '-1121': BadSymbol, // BAD_SYMBOL
                    '-1125': AuthenticationError, // INVALID_LISTEN_KEY
                    '-1127': BadRequest, // MORE_THAN_XX_HOURS
                    '-1128': BadRequest, // OPTIONAL_PARAMS_BAD_COMBO
                    '-1130': BadRequest, // INVALID_PARAMETER
                    '-1136': InvalidOrder, // INVALID_NEW_ORDER_RESP_TYPE
                    // 20xx - Processing Issues
                    '-2010': InvalidOrder, // NEW_ORDER_REJECTED
                    '-2011': OrderNotFound, // CANCEL_REJECTED
                    '-2013': OrderNotFound, // NO_SUCH_ORDER
                    '-2014': AuthenticationError, // BAD_API_KEY_FMT
                    '-2015': AuthenticationError, // REJECTED_MBX_KEY
                    '-2016': MarketClosed, // NO_TRADING_WINDOW
                    '-2018': InsufficientFunds, // BALANCE_NOT_SUFFICIENT
                    '-2019': InsufficientFunds, // MARGIN_NOT_SUFFICIEN
                    '-2020': OrderNotFillable, // UNABLE_TO_FILL
                    '-2021': OrderImmediatelyFillable, // ORDER_WOULD_IMMEDIATELY_TRIGGER
                    '-2022': OperationRejected, // REDUCE_ONLY_REJECT
                    '-2023': AccountSuspended, // USER_IN_LIQUIDATION
                    '-2024': InsufficientFunds, // POSITION_NOT_SUFFICIENT
                    '-2025': RateLimitExceeded, // MAX_OPEN_ORDER_EXCEEDED
                    '-2026': NotSupported, // REDUCE_ONLY_ORDER_TYPE_NOT_SUPPORTED
                    '-2027': BadRequest, // MAX_LEVERAGE_RATIO
                    '-2028': BadRequest, // MIN_LEVERAGE_RATIO
                    // 40xx - Filters and other Issues
                    '-4000': InvalidOrder, // INVALID_ORDER_STATUS
                    '-4001': InvalidOrder, // PRICE_LESS_THAN_ZERO
                    '-4002': InvalidOrder, // PRICE_GREATER_THAN_MAX_PRICE
                    '-4003': InvalidOrder, // QTY_LESS_THAN_ZERO
                    '-4004': InvalidOrder, // QTY_LESS_THAN_MIN_QTY
                    '-4005': InvalidOrder, // QTY_GREATER_THAN_MAX_QTY
                    '-4006': InvalidOrder, // STOP_PRICE_LESS_THAN_ZERO
                    '-4007': InvalidOrder, // STOP_PRICE_GREATER_THAN_MAX_PRICE
                    '-4008': InvalidOrder, // TICK_SIZE_LESS_THAN_ZERO
                    '-4009': InvalidOrder, // MAX_PRICE_LESS_THAN_MIN_PRICE
                    '-4010': InvalidOrder, // MAX_QTY_LESS_THAN_MIN_QTY
                    '-4011': InvalidOrder, // STEP_SIZE_LESS_THAN_ZERO
                    '-4012': RateLimitExceeded, // MAX_NUM_ORDERS_LESS_THAN_ZERO
                    '-4013': InvalidOrder, // PRICE_LESS_THAN_MIN_PRICE
                    '-4014': InvalidOrder, // PRICE_NOT_INCREASED_BY_TICK_SIZE
                    '-4015': InvalidOrder, // INVALID_CL_ORD_ID_LEN
                    '-4016': InvalidOrder, // PRICE_HIGHTER_THAN_MULTIPLIER_UP
                    '-4017': InvalidOrder, // MULTIPLIER_UP_LESS_THAN_ZERO
                    '-4018': InvalidOrder, // MULTIPLIER_DOWN_LESS_THAN_ZERO
                    '-4019': BadRequest, // COMPOSITE_SCALE_OVERFLOW
                    '-4020': BadRequest, // TARGET_STRATEGY_INVALID
                    '-4021': BadRequest, // INVALID_DEPTH_LIMIT
                    '-4022': MarketClosed, // WRONG_MARKET_STATUS
                    '-4023': InvalidOrder, // QTY_NOT_INCREASED_BY_STEP_SIZE
                    '-4024': InvalidOrder, // PRICE_LOWER_THAN_MULTIPLIER_DOWN
                    '-4025': BadRequest, // MULTIPLIER_DECIMAL_LESS_THAN_ZERO
                    '-4026': BadRequest, // COMMISSION_INVALID
                    '-4027': BadRequest, // INVALID_ACCOUNT_TYPE
                    '-4028': BadRequest, // INVALID_LEVERAGE
                    '-4029': BadRequest, // INVALID_TICK_SIZE_PRECISION
                    '-4030': BadRequest, // INVALID_STEP_SIZE_PRECISION
                    '-4031': BadRequest, // INVALID_WORKING_TYPE
                    '-4032': RateLimitExceeded, // EXCEED_MAX_CANCEL_ORDER_SIZE
                    '-4033': AccountNotEnabled, // INSURANCE_ACCOUNT_NOT_FOUND
                    '-4044': BadRequest, // INVALID_BALANCE_TYPE
                    '-4045': RateLimitExceeded, // MAX_STOP_ORDER_EXCEEDED
                    '-4046': NoChange, // NO_NEED_TO_CHANGE_MARGIN_TYPE
                    '-4047': OperationRejected, // THERE_EXISTS_OPEN_ORDERS
                    '-4048': OperationRejected, // THERE_EXISTS_QUANTITY
                    '-4049': OperationRejected, // ADD_ISOLATED_MARGIN_REJECT
                    '-4050': InsufficientFunds, // CROSS_BALANCE_INSUFFICIENT
                    '-4051': InsufficientFunds, // ISOLATED_BALANCE_INSUFFICIENT
                    '-4052': NoChange, // NO_NEED_TO_CHANGE_AUTO_ADD_MARGIN
                    '-4053': OperationRejected, // AUTO_ADD_CROSSED_MARGIN_REJECT
                    '-4054': OperationRejected, // ADD_ISOLATED_MARGIN_NO_POSITION_REJECT
                    '-4055': ArgumentsRequired, // AMOUNT_MUST_BE_POSITIVE
                    '-4056': AuthenticationError, // INVALID_API_KEY_TYPE
                    '-4057': AuthenticationError, // INVALID_RSA_PUBLIC_KEY
                    '-4058': InvalidOrder, // MAX_PRICE_TOO_LARGE
                    '-4059': NoChange, // NO_NEED_TO_CHANGE_POSITION_SIDE
                    '-4060': InvalidOrder, // INVALID_POSITION_SIDE
                    '-4061': InvalidOrder, // POSITION_SIDE_NOT_MATCH
                    '-4062': OperationRejected, // REDUCE_ONLY_CONFLICT
                    '-4063': BadRequest, // INVALID_OPTIONS_REQUEST_TYPE
                    '-4064': BadRequest, // INVALID_OPTIONS_TIME_FRAME
                    '-4065': BadRequest, // INVALID_OPTIONS_AMOUNT
                    '-4066': BadRequest, // INVALID_OPTIONS_EVENT_TYPE
                    '-4067': OperationRejected, // POSITION_SIDE_CHANGE_EXISTS_OPEN_ORDERS
                    '-4068': OperationRejected, // POSITION_SIDE_CHANGE_EXISTS_QUANTITY
                    '-4069': BadRequest, // INVALID_OPTIONS_PREMIUM_FEE
                    '-4070': InvalidOrder, // INVALID_CL_OPTIONS_ID_LEN
                    '-4071': InvalidOrder, // INVALID_OPTIONS_DIRECTION
                    '-4072': NoChange, // OPTIONS_PREMIUM_NOT_UPDATE
                    '-4073': BadRequest, // OPTIONS_PREMIUM_INPUT_LESS_THAN_ZERO
                    '-4074': InvalidOrder, // OPTIONS_AMOUNT_BIGGER_THAN_UPPER
                    '-4075': OperationRejected, // OPTIONS_PREMIUM_OUTPUT_ZERO
                    '-4076': OperationRejected, // OPTIONS_PREMIUM_TOO_DIFF
                    '-4077': RateLimitExceeded, // OPTIONS_PREMIUM_REACH_LIMIT
                    '-4078': BadRequest, // OPTIONS_COMMON_ERROR
                    '-4079': BadRequest, // INVALID_OPTIONS_ID
                    '-4080': BadRequest, // OPTIONS_USER_NOT_FOUND
                    '-4081': BadRequest, // OPTIONS_NOT_FOUND
                    '-4082': RateLimitExceeded, // INVALID_BATCH_PLACE_ORDER_SIZE
                    '-4083': OperationFailed, // PLACE_BATCH_ORDERS_FAIL
                    '-4084': NotSupported, // UPCOMING_METHOD
                    '-4085': BadRequest, // INVALID_NOTIONAL_LIMIT_COEF
                    '-4086': BadRequest, // INVALID_PRICE_SPREAD_THRESHOLD
                    '-4087': PermissionDenied, // REDUCE_ONLY_ORDER_PERMISSION
                    '-4088': PermissionDenied, // NO_PLACE_ORDER_PERMISSION
                    '-4104': BadSymbol, // INVALID_CONTRACT_TYPE
                    '-4114': InvalidOrder, // INVALID_CLIENT_TRAN_ID_LEN
                    '-4115': DuplicateOrderId, // DUPLICATED_CLIENT_TRAN_ID
                    '-4118': InsufficientFunds, // REDUCE_ONLY_MARGIN_CHECK_FAILED
                    '-4131': InvalidOrder, // MARKET_ORDER_REJECT
                    '-4135': InvalidOrder, // INVALID_ACTIVATION_PRICE
                    '-4137': InvalidOrder, // QUANTITY_EXISTS_WITH_CLOSE_POSITION
                    '-4138': OperationRejected, // REDUCE_ONLY_MUST_BE_TRUE
                    '-4139': InvalidOrder, // ORDER_TYPE_CANNOT_BE_MKT
                    '-4140': OperationRejected, // INVALID_OPENING_POSITION_STATUS
                    '-4141': MarketClosed, // SYMBOL_ALREADY_CLOSED
                    '-4142': InvalidOrder, // STRATEGY_INVALID_TRIGGER_PRICE
                    '-4144': BadSymbol, // INVALID_PAIR
                    '-4161': OperationRejected, // ISOLATED_LEVERAGE_REJECT_WITH_POSITION
                    '-4164': InvalidOrder, // MIN_NOTIONAL
                    '-4165': BadRequest, // INVALID_TIME_INTERVAL
                    '-4183': InvalidOrder, // PRICE_HIGHTER_THAN_STOP_MULTIPLIER_UP
                    '-4184': InvalidOrder, // PRICE_LOWER_THAN_STOP_MULTIPLIER_DOWN
                },
                'broad': {
                },
            },
        });
    }

    /**
     * @method
     * @name aster#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response: Dict = await this.publicGetFapiV1ExchangeInfo (params);
        const rows = this.safeList (response, 'assets', []);
        //
        //     [
        //         {
        //             "asset": "USDT",
        //             "marginAvailable": true,
        //             "autoAssetExchange": "-10000"
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString (currency, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'code': code,
                'id': currencyId,
                'name': code,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': undefined,
                'type': 'crypto', // atm exchange api provides only cryptos
            });
        }
        return result;
    }

    /**
     * @method
     * @name aster#fetchMarkets
     * @description retrieves data on all markets for bigone
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response: Dict = await this.publicGetFapiV1ExchangeInfo (params);
        const markets = this.safeList (response, 'symbols', []);
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "pair": "BTCUSDT",
        //             "contractType": "PERPETUAL",
        //             "deliveryDate": 4133404800000,
        //             "onboardDate": 1627628400000,
        //             "status": "TRADING",
        //             "maintMarginPercent": "2.5000",
        //             "requiredMarginPercent": "5.0000",
        //             "baseAsset": "BTC",
        //             "quoteAsset": "USDT",
        //             "marginAsset": "USDT",
        //             "pricePrecision": 1,
        //             "quantityPrecision": 3,
        //             "baseAssetPrecision": 8,
        //             "quotePrecision": 8,
        //             "underlyingType": "COIN",
        //             "underlyingSubType": [],
        //             "settlePlan": 0,
        //             "triggerProtect": "0.0200",
        //             "liquidationFee": "0.025000",
        //             "marketTakeBound": "0.02",
        //             "filters": [
        //                 {
        //                     "minPrice": "1",
        //                     "maxPrice": "1000000",
        //                     "filterType": "PRICE_FILTER",
        //                     "tickSize": "0.1"
        //                 },
        //                 {
        //                     "stepSize": "0.001",
        //                     "filterType": "LOT_SIZE",
        //                     "maxQty": "100",
        //                     "minQty": "0.001"
        //                 },
        //                 {
        //                     "stepSize": "0.001",
        //                     "filterType": "MARKET_LOT_SIZE",
        //                     "maxQty": "10",
        //                     "minQty": "0.001"
        //                 },
        //                 {
        //                     "limit": 200,
        //                     "filterType": "MAX_NUM_ORDERS"
        //                 },
        //                 {
        //                     "limit": 10,
        //                     "filterType": "MAX_NUM_ALGO_ORDERS"
        //                 },
        //                 {
        //                     "notional": "5",
        //                     "filterType": "MIN_NOTIONAL"
        //                 },
        //                 {
        //                     "multiplierDown": "0.9800",
        //                     "multiplierUp": "1.0200",
        //                     "multiplierDecimal": "4",
        //                     "filterType": "PERCENT_PRICE"
        //                 }
        //             ],
        //             "orderTypes": [
        //                 "LIMIT",
        //                 "MARKET",
        //                 "STOP",
        //                 "STOP_MARKET",
        //                 "TAKE_PROFIT",
        //                 "TAKE_PROFIT_MARKET",
        //                 "TRAILING_STOP_MARKET"
        //             ],
        //             "timeInForce": [
        //                 "GTC",
        //                 "IOC",
        //                 "FOK",
        //                 "GTX",
        //                 "RPI"
        //             ]
        //         }
        //     ]
        //
        const fees = this.fees;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const settleId = this.safeString (market, 'marginAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const symbol = base + '/' + quote + ':' + settle;
            const status = this.safeString (market, 'status');
            const active = status === 'TRADING';
            const filters = this.safeList (market, 'filters', []);
            const filtersByType = this.indexBy (filters, 'filterType');
            const entry = this.safeMarketStructure ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': active,
                'contract': true,
                'linear': true,
                'inverse': false,
                'taker': fees['trading']['taker'],
                'maker': fees['trading']['maker'],
                'contractSize': 1,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityPrecision'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision'))),
                    'base': this.parseNumber (this.parsePrecision (this.safeString (market, 'baseAssetPrecision'))),
                    'quote': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
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
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': this.safeInteger (market, 'onboardDate'),
                'info': market,
            });
            if ('PRICE_FILTER' in filtersByType) {
                const filter = this.safeDict (filtersByType, 'PRICE_FILTER', {});
                entry['limits']['price'] = {
                    'min': this.safeNumber (filter, 'minPrice'),
                    'max': this.safeNumber (filter, 'maxPrice'),
                };
                entry['precision']['price'] = this.safeNumber (filter, 'tickSize');
            }
            if ('LOT_SIZE' in filtersByType) {
                const filter = this.safeDict (filtersByType, 'LOT_SIZE', {});
                entry['precision']['amount'] = this.safeNumber (filter, 'stepSize');
                entry['limits']['amount'] = {
                    'min': this.safeNumber (filter, 'minQty'),
                    'max': this.safeNumber (filter, 'maxQty'),
                };
            }
            if ('MARKET_LOT_SIZE' in filtersByType) {
                const filter = this.safeDict (filtersByType, 'MARKET_LOT_SIZE', {});
                entry['limits']['market'] = {
                    'min': this.safeNumber (filter, 'minQty'),
                    'max': this.safeNumber (filter, 'maxQty'),
                };
            }
            if (('MIN_NOTIONAL' in filtersByType) || ('NOTIONAL' in filtersByType)) {
                const filter = this.safeDict2 (filtersByType, 'MIN_NOTIONAL', 'NOTIONAL', {});
                entry['limits']['cost']['min'] = this.safeNumber (filter, 'notional');
            }
            result.push (entry);
        }
        return result;
    }

    /**
     * @method
     * @name aster#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetFapiV1Time (params);
        //
        //     {
        //         "serverTime": 1499827319559
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         1631158560000,
        //         "208.1850",
        //         "208.1850",
        //         "208.1850",
        //         "208.1850",
        //         "11.84",
        //         1631158619999,
        //         "2464.910400",
        //         1,
        //         "11.84",
        //         "2464.910400",
        //         "0"
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name aster#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#klinecandlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {};
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1500) {
                limit = 1500; // Default 500; max 1500.
            }
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        request['interval'] = this.safeString (this.timeframes, timeframe, timeframe);
        const price = this.safeString (params, 'price');
        const isMark = (price === 'mark');
        const isIndex = (price === 'index');
        params = this.omit (params, 'price');
        let response = undefined;
        if (isMark) {
            request['symbol'] = market['id'];
            response = await this.publicGetFapiV1MarkPriceKlines (this.extend (request, params));
        } else if (isIndex) {
            request['pair'] = market['id'];
            response = await this.publicGetFapiV1IndexPriceKlines (this.extend (request, params));
        } else {
            request['symbol'] = market['id'];
            response = await this.publicGetFapiV1Klines (this.extend (request, params));
        }
        //
        //     [
        //         [
        //             1631158560000,
        //             "208.1850",
        //             "208.1850",
        //             "208.1850",
        //             "208.1850",
        //             "11.84",
        //             1631158619999,
        //             "2464.910400",
        //             1,
        //             "11.84",
        //             "2464.910400",
        //             "0"
        //         ]
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //     {
        //         "id": 3913206,
        //         "price": "644.100",
        //         "qty": "0.08",
        //         "quoteQty": "51.528",
        //         "time": 1749784506633,
        //         "isBuyerMaker": true
        //     }
        //
        // fetchMyTrades
        //
        //     {
        //         "buyer": false,
        //         "commission": "-0.07819010",
        //         "commissionAsset": "USDT",
        //         "id": 698759,
        //         "maker": false,
        //         "orderId": 25851813,
        //         "price": "7819.01",
        //         "qty": "0.002",
        //         "quoteQty": "15.63802",
        //         "realizedPnl": "-0.91539999",
        //         "side": "SELL",
        //         "positionSide": "SHORT",
        //         "symbol": "BTCUSDT",
        //         "time": 1569514978020
        //     }
        //
        const id = this.safeString (trade, 'id');
        const symbol = market['symbol'];
        const currencyId = this.safeString (trade, 'commissionAsset');
        const currencyCode = this.safeCurrencyCode (currencyId);
        const amountString = this.safeString (trade, 'qty');
        const priceString = this.safeString (trade, 'price');
        const costString = this.safeString (trade, 'quoteQty');
        const timestamp = this.safeInteger (trade, 'time');
        let side = this.safeString (trade, 'side');
        const isMaker = this.safeBool (trade, 'maker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        const isBuyerMaker = this.safeBool (trade, 'isBuyerMaker');
        if (isBuyerMaker !== undefined) {
            side = isBuyerMaker ? 'sell' : 'buy';
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'orderId'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': {
                'cost': this.parseNumber (Precise.stringAbs (this.safeString (trade, 'commission'))),
                'currency': currencyCode,
            },
        }, market);
    }

    /**
     * @method
     * @name aster#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#recent-trades-list
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000.
            }
            request['limit'] = limit;
        }
        const response = await this.publicGetFapiV1Trades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 3913206,
        //             "price": "644.100",
        //             "qty": "0.08",
        //             "quoteQty": "51.528",
        //             "time": 1749784506633,
        //             "isBuyerMaker": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name aster#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#account-trade-list-user_data
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is undefined
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000.
            }
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.privateGetFapiV1UserTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "buyer": false,
        //             "commission": "-0.07819010",
        //             "commissionAsset": "USDT",
        //             "id": 698759,
        //             "maker": false,
        //             "orderId": 25851813,
        //             "price": "7819.01",
        //             "qty": "0.002",
        //             "quoteQty": "15.63802",
        //             "realizedPnl": "-0.91539999",
        //             "side": "SELL",
        //             "positionSide": "SHORT",
        //             "symbol": "BTCUSDT",
        //             "time": 1569514978020
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit, params);
    }

    /**
     * @method
     * @name aster#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            // limit: [5, 10, 20, 50, 100, 500, 1000]. Default: 500
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000.
            }
            request['limit'] = limit;
        }
        const response = await this.publicGetFapiV1Depth (this.extend (request, params));
        //
        //     {
        //         "lastUpdateId": 1027024,
        //         "E": 1589436922972, //     Message output time
        //         "T": 1589436922959, //     Transaction time
        //         "bids": [
        //             [
        //                 "4.00000000", //     PRICE
        //                 "431.00000000" //     QTY
        //             ]
        //         ],
        //         "asks": [
        //             [
        //                 "4.00000200",
        //                 "12.00000000"
        //             ]
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'T');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks');
    }

    /**
     * @method
     * @name aster#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let request: Dict = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 100; max 1000
            }
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.publicGetFapiV1FundingRate (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "fundingTime": 1747209600000,
        //             "fundingRate": "0.00010000"
        //         }
        //     ]
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeInteger (entry, 'fundingTime');
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (this.safeString (entry, 'symbol')),
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingRateHistory[];
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "1845.7",
        //         "priceChangePercent": "1.755",
        //         "weightedAvgPrice": "105515.5",
        //         "lastPrice": "107037.7",
        //         "lastQty": "0.004",
        //         "openPrice": "105192.0",
        //         "highPrice": "107223.5",
        //         "lowPrice": "104431.6",
        //         "volume": "8753.286",
        //         "quoteVolume": "923607368.61",
        //         "openTime": 1749976620000,
        //         "closeTime": 1750063053754,
        //         "firstId": 24195078,
        //         "lastId": 24375783,
        //         "count": 180706
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'lastPrice');
        const open = this.safeString (ticker, 'openPrice');
        let percentage = this.safeString (ticker, 'priceChangePercent');
        percentage = Precise.stringMul (percentage, '100');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        const baseVolume = this.safeString (ticker, 'volume');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name aster#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#24hr-ticker-price-change-statistics
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetFapiV1Ticker24hr (this.extend (request, params));
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "1845.7",
        //         "priceChangePercent": "1.755",
        //         "weightedAvgPrice": "105515.5",
        //         "lastPrice": "107037.7",
        //         "lastQty": "0.004",
        //         "openPrice": "105192.0",
        //         "highPrice": "107223.5",
        //         "lowPrice": "104431.6",
        //         "volume": "8753.286",
        //         "quoteVolume": "923607368.61",
        //         "openTime": 1749976620000,
        //         "closeTime": 1750063053754,
        //         "firstId": 24195078,
        //         "lastId": 24375783,
        //         "count": 180706
        //     }
        //
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name aster#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#24hr-ticker-price-change-statistics
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetFapiV1Ticker24hr (params);
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "priceChange": "1845.7",
        //             "priceChangePercent": "1.755",
        //             "weightedAvgPrice": "105515.5",
        //             "lastPrice": "107037.7",
        //             "lastQty": "0.004",
        //             "openPrice": "105192.0",
        //             "highPrice": "107223.5",
        //             "lowPrice": "104431.6",
        //             "volume": "8753.286",
        //             "quoteVolume": "923607368.61",
        //             "openTime": 1749976620000,
        //             "closeTime": 1750063053754,
        //             "firstId": 24195078,
        //             "lastId": 24375783,
        //             "count": 180706
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "106729.84047826",
        //         "indexPrice": "106775.72673913",
        //         "estimatedSettlePrice": "106708.84997006",
        //         "lastFundingRate": "0.00010000",
        //         "interestRate": "0.00010000",
        //         "nextFundingTime": 1750147200000,
        //         "time": 1750146970000
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const nextFundingTimestamp = this.safeInteger (contract, 'nextFundingTime');
        const timestamp = this.safeInteger (contract, 'time');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market),
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': this.safeNumber (contract, 'interestRate'),
            'estimatedSettlePrice': this.safeNumber (contract, 'estimatedSettlePrice'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'lastFundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name aster#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#mark-price
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRate() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetFapiV1PremiumIndex (this.extend (request, params));
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "106729.84047826",
        //         "indexPrice": "106775.72673913",
        //         "estimatedSettlePrice": "106708.84997006",
        //         "lastFundingRate": "0.00010000",
        //         "interestRate": "0.00010000",
        //         "nextFundingTime": 1750147200000,
        //         "time": 1750146970000
        //     }
        //
        return this.parseFundingRate (response, market);
    }

    /**
     * @method
     * @name aster#fetchFundingRates
     * @description fetch the current funding rate for multiple symbols
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#24hr-ticker-price-change-statistics
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetFapiV1PremiumIndex (this.extend (params));
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "markPrice": "106729.84047826",
        //             "indexPrice": "106775.72673913",
        //             "estimatedSettlePrice": "106708.84997006",
        //             "lastFundingRate": "0.00010000",
        //             "interestRate": "0.00010000",
        //             "nextFundingTime": 1750147200000,
        //             "time": 1750146970000
        //         }
        //     ]
        //
        return this.parseFundingRates (response, symbols);
    }

    parseBalance (response): Balances {
        const result: Dict = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'availableBalance');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name aster#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#futures-account-balance-v2-user_data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        const response = await this.privateGetFapiV2Balance (params);
        //
        //     [
        //         {
        //             "accountAlias": "SgsR", // unique account code
        //             "asset": "USDT", // asset name
        //             "balance": "122607.35137903", // wallet balance
        //             "crossWalletBalance": "23.72469206", // crossed wallet balance
        //             "crossUnPnl": "0.00000000", // unrealized profit of crossed positions
        //             "availableBalance": "23.72469206", // available balance
        //             "maxWithdrawAmount": "23.72469206", // maximum amount for transfer out
        //             "marginAvailable": true, // whether the asset can be used as margin in Multi-Assets mode
        //             "updateTime": 1617939110373
        //         }
        //     ]
        //
        return this.parseBalance (response);
    }

    /**
     * @method
     * @name aster#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#change-margin-type-trade
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toUpperCase ();
        if (marginMode === 'CROSS') {
            marginMode = 'CROSSED';
        }
        if ((marginMode !== 'ISOLATED') && (marginMode !== 'CROSSED')) {
            throw new BadRequest (this.id + ' marginMode must be either isolated or cross');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'marginType': marginMode,
        };
        const response = await this.privatePostFapiV1MarginType (this.extend (request, params));
        //
        //     {
        //         "amount": 100.0,
        //         "code": 200,
        //         "msg": "Successfully modify position margin.",
        //         "type": 1
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name aster#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#get-current-position-modeuser_data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode (symbol: Str = undefined, params = {}) {
        const response = await this.privateGetFapiV1PositionSideDual (params);
        //
        //     {
        //         "dualSidePosition": true // "true": Hedge Mode; "false": One-way Mode
        //     }
        //
        const dualSidePosition = this.safeBool (response, 'dualSidePosition');
        return {
            'info': response,
            'hedged': (dualSidePosition === true),
        };
    }

    /**
     * @method
     * @name aster#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#change-position-modetrade
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by bingx setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}) {
        const request: Dict = {
            'dualSidePosition': hedged,
        };
        //
        //     {
        //         "code": 200,
        //         "msg": "success"
        //     }
        //
        return await this.privatePostFapiV1PositionSideDual (this.extend (request, params));
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        const marketId = this.safeString (fee, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'makerCommissionRate'),
            'taker': this.safeNumber (fee, 'takerCommissionRate'),
            'percentage': false,
            'tierBased': false,
        };
    }

    /**
     * @method
     * @name aster#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#change-position-modetrade
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateGetFapiV1CommissionRate (this.extend (request, params));
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "makerCommissionRate": "0.0002",
        //         "takerCommissionRate": "0.0004"
        //     }
        //
        return this.parseTradingFee (response, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REJECTED': 'canceled',
            'EXPIRED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str) {
        const types: Dict = {
            'LIMIT': 'limit',
            'MARKET': 'market',
            'STOP': 'limit',
            'STOP_MARKET': 'market',
            'TAKE_PROFIT': 'limit',
            'TAKE_PROFIT_MARKET': 'market',
            'TRAILING_STOP_MARKET': 'market',
        };
        return this.safeString (types, type, type);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "avgPrice": "0.00000",
        //         "clientOrderId": "abc",
        //         "cumQuote": "0",
        //         "executedQty": "0",
        //         "orderId": 1917641,
        //         "origQty": "0.40",
        //         "origType": "TRAILING_STOP_MARKET",
        //         "price": "0",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "SHORT",
        //         "status": "NEW",
        //         "stopPrice": "9300",
        //         "closePosition": false,
        //         "symbol": "BTCUSDT",
        //         "time": 1579276756075,
        //         "timeInForce": "GTC",
        //         "type": "TRAILING_STOP_MARKET",
        //         "activatePrice": "9020",
        //         "priceRate": "0.3",
        //         "updateTime": 1579276756075,
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false
        //     }
        //
        const info = order;
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const side = this.safeStringLower (order, 'side');
        const timestamp = this.safeInteger (order, 'time');
        const lastTradeTimestamp = this.safeInteger (order, 'updateTime');
        const statusId = this.safeStringUpper (order, 'status');
        const rawType = this.safeStringUpper (order, 'type');
        const stopPriceString = this.safeString (order, 'stopPrice');
        const triggerPrice = this.parseNumber (this.omitZero (stopPriceString));
        return this.safeOrder ({
            'info': info,
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': this.safeInteger (order, 'updateTime'),
            'type': this.parseOrderType (rawType),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'price'),
            'triggerPrice': triggerPrice,
            'average': this.safeString (order, 'avgPrice'),
            'cost': this.safeString (order, 'cumQuote'),
            'amount': this.safeString (order, 'origQty'),
            'filled': this.safeString (order, 'executedQty'),
            'remaining': undefined,
            'status': this.parseOrderStatus (statusId),
            'fee': undefined,
            'trades': undefined,
            'reduceOnly': this.safeBool2 (order, 'reduceOnly', 'ro'),
        }, market);
    }

    /**
     * @method
     * @name aster#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#query-order-user_data
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clientOid');
        params = this.omit (params, [ 'clientOrderId', 'clientOid' ]);
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const response = await this.privateGetFapiV1Order (this.extend (request, params));
        //
        //     {
        //         "avgPrice": "0.00000",
        //         "clientOrderId": "abc",
        //         "cumQuote": "0",
        //         "executedQty": "0",
        //         "orderId": 1917641,
        //         "origQty": "0.40",
        //         "origType": "TRAILING_STOP_MARKET",
        //         "price": "0",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "SHORT",
        //         "status": "NEW",
        //         "stopPrice": "9300",
        //         "closePosition": false,
        //         "symbol": "BTCUSDT",
        //         "time": 1579276756075,
        //         "timeInForce": "GTC",
        //         "type": "TRAILING_STOP_MARKET",
        //         "activatePrice": "9020",
        //         "priceRate": "0.3",
        //         "updateTime": 1579276756075,
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name aster#fetchOpenOrder
     * @description fetch an open order by the id
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#query-current-open-order-user_data
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clientOid');
        params = this.omit (params, [ 'clientOrderId', 'clientOid' ]);
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const response = await this.privateGetFapiV1OpenOrder (this.extend (request, params));
        //
        //     {
        //         "avgPrice": "0.00000",
        //         "clientOrderId": "abc",
        //         "cumQuote": "0",
        //         "executedQty": "0",
        //         "orderId": 1917641,
        //         "origQty": "0.40",
        //         "origType": "TRAILING_STOP_MARKET",
        //         "price": "0",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "SHORT",
        //         "status": "NEW",
        //         "stopPrice": "9300",
        //         "closePosition": false,
        //         "symbol": "BTCUSDT",
        //         "time": 1579276756075,
        //         "timeInForce": "GTC",
        //         "type": "TRAILING_STOP_MARKET",
        //         "activatePrice": "9020",
        //         "priceRate": "0.3",
        //         "updateTime": 1579276756075,
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name aster#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#all-orders-user_data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000; // Default 500; max 1000
            }
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.privateGetFapiV1AllOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "avgPrice": "0.00000",
        //             "clientOrderId": "abc",
        //             "cumQuote": "0",
        //             "executedQty": "0",
        //             "orderId": 1917641,
        //             "origQty": "0.40",
        //             "origType": "TRAILING_STOP_MARKET",
        //             "price": "0",
        //             "reduceOnly": false,
        //             "side": "BUY",
        //             "positionSide": "SHORT",
        //             "status": "NEW",
        //             "stopPrice": "9300",
        //             "closePosition": false,
        //             "symbol": "BTCUSDT",
        //             "time": 1579276756075,
        //             "timeInForce": "GTC",
        //             "type": "TRAILING_STOP_MARKET",
        //             "activatePrice": "9020",
        //             "priceRate": "0.3",
        //             "updateTime": 1579276756075,
        //             "workingType": "CONTRACT_PRICE",
        //             "priceProtect": false
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name aster#fetchOpenOrders
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#current-all-open-orders-user_data
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetFapiV1OpenOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "avgPrice": "0.00000",
        //             "clientOrderId": "abc",
        //             "cumQuote": "0",
        //             "executedQty": "0",
        //             "orderId": 1917641,
        //             "origQty": "0.40",
        //             "origType": "TRAILING_STOP_MARKET",
        //             "price": "0",
        //             "reduceOnly": false,
        //             "side": "BUY",
        //             "positionSide": "SHORT",
        //             "status": "NEW",
        //             "stopPrice": "9300",
        //             "closePosition": false,
        //             "symbol": "BTCUSDT",
        //             "time": 1579276756075,
        //             "timeInForce": "GTC",
        //             "type": "TRAILING_STOP_MARKET",
        //             "activatePrice": "9020",
        //             "priceRate": "0.3",
        //             "updateTime": 1579276756075,
        //             "workingType": "CONTRACT_PRICE",
        //             "priceProtect": false
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name aster#createOrder
     * @description create a trade order
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#new-order--trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP' or 'STOP_MARKET' or 'TAKE_PROFIT' or 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.reduceOnly] for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean.
     * @param {boolean} [params.test] whether to use the test endpoint or not, default is false
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {string} [params.positionSide] "BOTH" for one-way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const test = this.safeBool (params, 'test', false);
        params = this.omit (params, 'test');
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (test) {
            response = await this.privatePostFapiV1OrderTest (request);
        } else {
            response = await this.privatePostFapiV1Order (request);
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name aster#createOrders
     * @description create a list of trade orders
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#place-multiple-orders--trade
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        const ordersRequests = [];
        if (orders.length > 5) {
            throw new InvalidOrder (this.id + ' createOrders() order list max 5 orders');
        }
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString (rawOrder, 'symbol');
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'amount');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest (marketId, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        const request: Dict = {
            'batchOrders': ordersRequests,
        };
        const response = await this.privatePostFapiV1BatchOrders (this.extend (request, params));
        return this.parseOrders (response);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name binance#createOrderRequest
         * @description helper function to build the request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} request to be sent to the exchange
         */
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': uppercaseType,
        };
        const clientOrderId = this.safeString2 (params, 'newClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
        }
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let triggerPriceIsRequired = false;
        let quantityIsRequired = false;
        if (uppercaseType === 'MARKET') {
            quantityIsRequired = true;
        } else if (uppercaseType === 'LIMIT') {
            timeInForceIsRequired = true;
            quantityIsRequired = true;
            priceIsRequired = true;
        } else if ((uppercaseType === 'STOP') || (uppercaseType === 'TAKE_PROFIT')) {
            quantityIsRequired = true;
            priceIsRequired = true;
            triggerPriceIsRequired = true;
        } else if ((uppercaseType === 'STOP_MARKET') || (uppercaseType === 'TAKE_PROFIT_MARKET')) {
            triggerPriceIsRequired = true;
        } else if (uppercaseType === 'TRAILING_STOP_MARKET') {
            const trailingPercent = this.safeStringN (params, [ 'trailingPercent', 'callbackRate', 'trailingDelta' ]);
            const trailingTriggerPrice = this.safeString2 (params, 'trailingTriggerPrice', 'activationPrice');
            request['callbackRate'] = trailingPercent;
            if (trailingTriggerPrice !== undefined) {
                request['activationPrice'] = this.priceToPrecision (symbol, trailingTriggerPrice);
            }
        }
        if (quantityIsRequired) {
            const marketAmountPrecision = this.safeString (market['precision'], 'amount');
            const isPrecisionAvailable = (marketAmountPrecision !== undefined);
            if (isPrecisionAvailable) {
                request['quantity'] = this.amountToPrecision (symbol, amount);
            } else {
                request['quantity'] = this.parseToNumeric (amount);
            }
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            const pricePrecision = this.safeString (market['precision'], 'price');
            const isPricePrecisionAvailable = (pricePrecision !== undefined);
            if (isPricePrecisionAvailable) {
                request['price'] = this.priceToPrecision (symbol, price);
            } else {
                request['price'] = this.parseToNumeric (price);
            }
        }
        if (triggerPriceIsRequired) {
            const stopPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice extra param for a ' + type + ' order');
            }
            if (stopPrice !== undefined) {
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        if (timeInForceIsRequired && (this.safeString (params, 'timeInForce') === undefined) && (this.safeString (request, 'timeInForce') === undefined)) {
            request['timeInForce'] = this.safeString (this.options, 'defaultTimeInForce'); // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        const requestParams = this.omit (params, [ 'newClientOrderId', 'clientOrderId', 'stopPrice', 'triggerPrice', 'trailingTriggerPrice', 'trailingPercent', 'trailingDelta' ]);
        return this.extend (request, requestParams);
    }

    /**
     * @method
     * @name aster#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#cancel-all-open-orders-trade
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateDeleteFapiV1AllOpenOrders (this.extend (request, params));
        //
        //     {
        //         "code": "200",
        //         "msg": "The operation of cancel all open order is done."
        //     }
        //
        return [
            this.safeOrder ({
                'info': response,
            }),
        ];
    }

    /**
     * @method
     * @name aster#cancelOrder
     * @description cancels an open order
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#cancel-order-trade
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeStringN (params, [ 'origClientOrderId', 'clientOrderId', 'newClientStrategyId' ]);
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        params = this.omit (params, [ 'origClientOrderId', 'clientOrderId', 'newClientStrategyId' ]);
        const response = await this.privateDeleteFapiV1Order (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name aster#cancelOrders
     * @description cancel multiple orders
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#cancel-multiple-orders-trade
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string[]} [params.origClientOrderIdList] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @param {int[]} [params.recvWindow]
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids:string[], symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderIdList = this.safeList (params, 'origClientOrderIdList');
        if (clientOrderIdList !== undefined) {
            request['origClientOrderIdList'] = clientOrderIdList;
        } else {
            request['orderIdList'] = ids;
        }
        const response = await this.privateDeleteFapiV1BatchOrders (this.extend (request, params));
        //
        //    [
        //        {
        //            "clientOrderId": "myOrder1",
        //            "cumQty": "0",
        //            "cumQuote": "0",
        //            "executedQty": "0",
        //            "orderId": 283194212,
        //            "origQty": "11",
        //            "origType": "TRAILING_STOP_MARKET",
        //            "price": "0",
        //            "reduceOnly": false,
        //            "side": "BUY",
        //            "positionSide": "SHORT",
        //            "status": "CANCELED",
        //            "stopPrice": "9300",                  // please ignore when order type is TRAILING_STOP_MARKET
        //            "closePosition": false,               // if Close-All
        //            "symbol": "BTCUSDT",
        //            "timeInForce": "GTC",
        //            "type": "TRAILING_STOP_MARKET",
        //            "activatePrice": "9020",              // activation price, only return with TRAILING_STOP_MARKET order
        //            "priceRate": "0.3",                   // callback rate, only return with TRAILING_STOP_MARKET order
        //            "updateTime": 1571110484038,
        //            "workingType": "CONTRACT_PRICE",
        //            "priceProtect": false,                // if conditional order trigger is protected
        //        },
        //        {
        //            "code": -2011,
        //            "msg": "Unknown order sent."
        //        }
        //    ]
        //
        return this.parseOrders (response, market);
    }

    /**
     * @method
     * @name aster#setLeverage
     * @description set the level of leverage for a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#change-initial-leverage-trade
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 1) || (leverage > 125)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 125');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        const response = await this.privatePostFapiV1Leverage (this.extend (request, params));
        //
        //     {
        //         "leverage": 21,
        //         "maxNotionalValue": "1000000",
        //         "symbol": "BTCUSDT"
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name aster#fetchLeverages
     * @description fetch the set leverage for all markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#position-information-v2-user_data
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverages (symbols: Strings = undefined, params = {}): Promise<Leverages> {
        await this.loadMarkets ();
        const response = await this.privateGetFapiV2PositionRisk (params);
        //
        //     [
        //         {
        //             "symbol": "INJUSDT",
        //             "positionAmt": "0.0",
        //             "entryPrice": "0.0",
        //             "markPrice": "0.00000000",
        //             "unRealizedProfit": "0.00000000",
        //             "liquidationPrice": "0",
        //             "leverage": "20",
        //             "maxNotionalValue": "25000",
        //             "marginType": "cross",
        //             "isolatedMargin": "0.00000000",
        //             "isAutoAddMargin": "false",
        //             "positionSide": "BOTH",
        //             "notional": "0",
        //             "isolatedWallet": "0",
        //             "updateTime": 0
        //         }
        //     ]
        //
        return this.parseLeverages (response, symbols, 'symbol');
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        //
        //     {
        //         "symbol": "INJUSDT",
        //         "positionAmt": "0.0",
        //         "entryPrice": "0.0",
        //         "markPrice": "0.00000000",
        //         "unRealizedProfit": "0.00000000",
        //         "liquidationPrice": "0",
        //         "leverage": "20",
        //         "maxNotionalValue": "25000",
        //         "marginType": "cross",
        //         "isolatedMargin": "0.00000000",
        //         "isAutoAddMargin": "false",
        //         "positionSide": "BOTH",
        //         "notional": "0",
        //         "isolatedWallet": "0",
        //         "updateTime": 0
        //     }
        //
        const marketId = this.safeString (leverage, 'symbol');
        const marginMode = this.safeStringLower (leverage, 'marginType');
        const side = this.safeStringLower (leverage, 'positionSide');
        let longLeverage = undefined;
        let shortLeverage = undefined;
        const leverageValue = this.safeInteger (leverage, 'leverage');
        if ((side === undefined) || (side === 'both')) {
            longLeverage = leverageValue;
            shortLeverage = leverageValue;
        } else if (side === 'long') {
            longLeverage = leverageValue;
        } else if (side === 'short') {
            shortLeverage = leverageValue;
        }
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': marginMode,
            'longLeverage': longLeverage,
            'shortLeverage': shortLeverage,
        } as Leverage;
    }

    /**
     * @method
     * @name aster#fetchMarginModes
     * @description fetches margin mode of the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#position-information-v2-user_data
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    async fetchMarginModes (symbols: Strings = undefined, params = {}): Promise<MarginModes> {
        await this.loadMarkets ();
        const response = await this.privateGetFapiV2PositionRisk (params);
        //
        //
        //     [
        //         {
        //             "symbol": "INJUSDT",
        //             "positionAmt": "0.0",
        //             "entryPrice": "0.0",
        //             "markPrice": "0.00000000",
        //             "unRealizedProfit": "0.00000000",
        //             "liquidationPrice": "0",
        //             "leverage": "20",
        //             "maxNotionalValue": "25000",
        //             "marginType": "cross",
        //             "isolatedMargin": "0.00000000",
        //             "isAutoAddMargin": "false",
        //             "positionSide": "BOTH",
        //             "notional": "0",
        //             "isolatedWallet": "0",
        //             "updateTime": 0
        //         }
        //     ]
        //
        //
        return this.parseMarginModes (response, symbols, 'symbol', 'swap');
    }

    parseMarginMode (marginMode: Dict, market = undefined): MarginMode {
        //
        //     {
        //         "symbol": "INJUSDT",
        //         "positionAmt": "0.0",
        //         "entryPrice": "0.0",
        //         "markPrice": "0.00000000",
        //         "unRealizedProfit": "0.00000000",
        //         "liquidationPrice": "0",
        //         "leverage": "20",
        //         "maxNotionalValue": "25000",
        //         "marginType": "cross",
        //         "isolatedMargin": "0.00000000",
        //         "isAutoAddMargin": "false",
        //         "positionSide": "BOTH",
        //         "notional": "0",
        //         "isolatedWallet": "0",
        //         "updateTime": 0
        //     }
        //
        const marketId = this.safeString (marginMode, 'symbol');
        market = this.safeMarket (marketId, market);
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': this.safeStringLower (marginMode, 'marginType'),
        } as MarginMode;
    }

    /**
     * @method
     * @name aster#fetchMarginAdjustmentHistory
     * @description fetches the history of margin added or reduced from contract isolated positions
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#get-position-margin-change-history-trade
     * @param {string} symbol unified market symbol
     * @param {string} [type] "add" or "reduce"
     * @param {int} [since] timestamp in ms of the earliest change to fetch
     * @param {int} [limit] the maximum amount of changes to fetch
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest change to fetch
     * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async fetchMarginAdjustmentHistory (symbol: Str = undefined, type: Str = undefined, since: Num = undefined, limit: Num = undefined, params = {}): Promise<MarginModification[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMarginAdjustmentHistory () requires a symbol argument');
        }
        const market = this.market (symbol);
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        const request: Dict = {
            'symbol': market['id'],
        };
        if (type !== undefined) {
            request['type'] = (type === 'add') ? 1 : 2;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.privateGetFapiV1PositionMarginHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "amount": "23.36332311",
        //             "asset": "USDT",
        //             "symbol": "BTCUSDT",
        //             "time": 1578047897183,
        //             "type": 1,
        //             "positionSide": "BOTH"
        //         }
        //     ]
        //
        const modifications = this.parseMarginModifications (response);
        return this.filterBySymbolSinceLimit (modifications, symbol, since, limit);
    }

    parseMarginModification (data: Dict, market: Market = undefined): MarginModification {
        //
        //     {
        //         "amount": "100",
        //         "asset": "USDT",
        //         "symbol": "BTCUSDT",
        //         "time": 1578047900425,
        //         "type": 1,
        //         "positionSide": "LONG"
        //     }
        //
        //     {
        //         "amount": 100.0,
        //         "code": 200,
        //         "msg": "Successfully modify position margin.",
        //         "type": 1
        //     }
        //
        const rawType = this.safeInteger (data, 'type');
        const errorCode = this.safeString (data, 'code');
        const marketId = this.safeString (data, 'symbol');
        const timestamp = this.safeInteger (data, 'time');
        market = this.safeMarket (marketId, market);
        const noErrorCode = errorCode === undefined;
        const success = errorCode === '200';
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': (rawType === 1) ? 'add' : 'reduce',
            'marginMode': 'isolated',
            'amount': this.safeNumber (data, 'amount'),
            'code': this.safeString (data, 'asset'),
            'total': undefined,
            'status': (success || noErrorCode) ? 'ok' : 'failed',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    async modifyMarginHelper (symbol: string, amount, addOrReduce, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        amount = this.amountToPrecision (symbol, amount);
        const request: Dict = {
            'type': addOrReduce,
            'symbol': market['id'],
            'amount': amount,
        };
        const code = market['quote'];
        const response = await this.privatePostFapiV1PositionMargin (this.extend (request, params));
        //
        //     {
        //         "amount": 100.0,
        //         "code": 200,
        //         "msg": "Successfully modify position margin.",
        //         "type": 1
        //     }
        //
        return this.extend (this.parseMarginModification (response, market), {
            'code': code,
        });
    }

    /**
     * @method
     * @name aster#reduceMargin
     * @description remove margin from a position
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#modify-isolated-position-margin-trade
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.modifyMarginHelper (symbol, amount, 2, params);
    }

    /**
     * @method
     * @name aster#addMargin
     * @description add margin
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#modify-isolated-position-margin-trade
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.modifyMarginHelper (symbol, amount, 1, params);
    }

    parseIncome (income, market: Market = undefined) {
        //
        //     {
        //       "symbol": "ETHUSDT",
        //       "incomeType": "FUNDING_FEE",
        //       "income": "0.00134317",
        //       "asset": "USDT",
        //       "time": "1621584000000",
        //       "info": "FUNDING_FEE",
        //       "tranId": "4480321991774044580",
        //       "tradeId": ""
        //     }
        //
        const marketId = this.safeString (income, 'symbol');
        const currencyId = this.safeString (income, 'asset');
        const timestamp = this.safeInteger (income, 'time');
        return {
            'info': income,
            'symbol': this.safeSymbol (marketId, market, undefined, 'swap'),
            'code': this.safeCurrencyCode (currencyId),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': this.safeString (income, 'tranId'),
            'amount': this.safeNumber (income, 'income'),
        };
    }

    /**
     * @method
     * @name aster#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#get-income-historyuser_data
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding history entry
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the funding history for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request: Dict = {
            'incomeType': 'FUNDING_FEE', // "TRANSFER"，"WELCOME_BONUS", "REALIZED_PNL"，"FUNDING_FEE", "COMMISSION", "INSURANCE_CLEAR", and "MARKET_MERCHANT_RETURN_REWARD"
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000); // max 1000
        }
        const response = await this.privateGetFapiV1Income (this.extend (request, params));
        return this.parseIncomes (response, market, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        //
        //     {
        //         "symbol": "",
        //         "incomeType": "TRANSFER",
        //         "income": "10.00000000",
        //         "asset": "USDT",
        //         "time": 1677645250000,
        //         "info": "TRANSFER",
        //         "tranId": 131001573082,
        //         "tradeId": ""
        //     }
        //
        let amount = this.safeString (item, 'income');
        let direction = undefined;
        if (Precise.stringLe (amount, '0')) {
            direction = 'out';
            amount = Precise.stringMul ('-1', amount);
        } else {
            direction = 'in';
        }
        const currencyId = this.safeString (item, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        currency = this.safeCurrency (currencyId, currency);
        const timestamp = this.safeInteger (item, 'time');
        const type = this.safeString (item, 'incomeType');
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'tranId'),
            'direction': direction,
            'account': undefined,
            'referenceAccount': undefined,
            'referenceId': this.safeString (item, 'tradeId'),
            'type': this.parseLedgerEntryType (type),
            'currency': code,
            'amount': this.parseNumber (amount),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency) as LedgerEntry;
    }

    parseLedgerEntryType (type) {
        const ledgerType: Dict = {
            'TRANSFER': 'transfer',
            'WELCOME_BONUS': 'cashback',
            'REALIZED_PNL': 'trade',
            'FUNDING_FEE': 'fee',
            'COMMISSION': 'commission',
            'INSURANCE_CLEAR': 'settlement',
            'MARKET_MERCHANT_RETURN_REWARD': 'cashback',
        };
        return this.safeString (ledgerType, type, type);
    }

    /**
     * @method
     * @name aster#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#get-income-historyuser_data
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request: Dict = {};
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000); // max 1000
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        const response = await this.privateGetFapiV1Income (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "",
        //             "incomeType": "TRANSFER",
        //             "income": "10.00000000",
        //             "asset": "USDT",
        //             "time": 1677645250000,
        //             "info": "TRANSFER",
        //             "tranId": 131001573082,
        //             "tradeId": ""
        //         }
        //     ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    parsePositionRisk (position, market: Market = undefined) {
        //
        //     {
        //         "entryPrice": "6563.66500",
        //         "marginType": "isolated",
        //         "isAutoAddMargin": "false",
        //         "isolatedMargin": "15517.54150468",
        //         "leverage": "10",
        //         "liquidationPrice": "5930.78",
        //         "markPrice": "6679.50671178",
        //         "maxNotionalValue": "20000000",
        //         "positionSide": "LONG",
        //         "positionAmt": "20.000",
        //         "symbol": "BTCUSDT",
        //         "unRealizedProfit": "2316.83423560",
        //         "updateTime": 1625474304765
        //     }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'contract');
        const symbol = this.safeString (market, 'symbol');
        const contractsAbs = Precise.stringAbs (this.safeString (position, 'positionAmt'));
        const contracts = this.parseNumber (contractsAbs);
        const unrealizedPnlString = this.safeString (position, 'unRealizedProfit');
        const unrealizedPnl = this.parseNumber (unrealizedPnlString);
        const liquidationPriceString = this.omitZero (this.safeString (position, 'liquidationPrice'));
        const liquidationPrice = this.parseNumber (liquidationPriceString);
        const marginMode = this.safeString (position, 'marginType');
        const side = this.safeStringLower (position, 'positionSide');
        const entryPriceString = this.safeString (position, 'entryPrice');
        const entryPrice = this.parseNumber (entryPriceString);
        const collateralString = this.safeString (position, 'isolatedMargin');
        const collateral = this.parseNumber (collateralString);
        const markPrice = this.parseNumber (this.omitZero (this.safeString (position, 'markPrice')));
        const timestamp = this.safeInteger (position, 'updateTime');
        const positionSide = this.safeString (position, 'positionSide');
        const hedged = positionSide !== 'BOTH';
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': contracts,
            'contractSize': undefined,
            'unrealizedPnl': unrealizedPnl,
            'leverage': this.safeNumber (position, 'leverage'),
            'liquidationPrice': liquidationPrice,
            'collateral': collateral,
            'notional': undefined,
            'markPrice': markPrice,
            'entryPrice': entryPrice,
            'timestamp': timestamp,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'marginRatio': undefined,
            'datetime': this.iso8601 (timestamp),
            'marginMode': marginMode,
            'marginType': marginMode, // deprecated
            'side': side,
            'hedged': hedged,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        };
    }

    /**
     * @method
     * @name aster#fetchPositionsRisk
     * @description fetch positions risk
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-api.md#position-information-v2-user_data
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} data on the positions risk
     */
    async fetchPositionsRisk (symbols: Strings = undefined, params = {}) {
        if (symbols !== undefined) {
            if (!Array.isArray (symbols)) {
                throw new ArgumentsRequired (this.id + ' fetchPositionsRisk() requires an array argument for symbols');
            }
        }
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateGetFapiV2PositionRisk (this.extend (request, params));
        //
        //     [
        //         {
        //             "entryPrice": "6563.66500",
        //             "marginType": "isolated",
        //             "isAutoAddMargin": "false",
        //             "isolatedMargin": "15517.54150468",
        //             "leverage": "10",
        //             "liquidationPrice": "5930.78",
        //             "markPrice": "6679.50671178",
        //             "maxNotionalValue": "20000000",
        //             "positionSide": "LONG",
        //             "positionAmt": "20.000", // negative value for 'SHORT'
        //             "symbol": "BTCUSDT",
        //             "unRealizedProfit": "2316.83423560",
        //             "updateTime": 1625474304765
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const rawPosition = response[i];
            const entryPriceString = this.safeString (rawPosition, 'entryPrice');
            if (Precise.stringGt (entryPriceString, '0')) {
                result.push (this.parsePositionRisk (response[i]));
            }
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api']['rest']) + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.rawencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            const defaultRecvWindow = this.safeInteger (this.options, 'recvWindow');
            let extendedParams = this.extend ({
                'timestamp': this.milliseconds (),
            }, params);
            if (defaultRecvWindow !== undefined) {
                extendedParams['recvWindow'] = defaultRecvWindow;
            }
            const recvWindow = this.safeInteger (params, 'recvWindow');
            if (recvWindow !== undefined) {
                extendedParams['recvWindow'] = recvWindow;
            }
            let query = undefined;
            if ((method === 'DELETE') && (path === 'fapi/v1/batchOrders')) {
                const orderidlist = this.safeList (extendedParams, 'orderIdList', []);
                const origclientorderidlist = this.safeList (extendedParams, 'origClientOrderIdList', []);
                extendedParams = this.omit (extendedParams, [ 'orderIdList', 'origClientOrderIdList' ]);
                query = this.rawencode (extendedParams);
                const orderidlistLength = orderidlist.length;
                const origclientorderidlistLength = origclientorderidlist.length;
                if (orderidlistLength > 0) {
                    query = query + '&' + 'orderidlist=%5B' + orderidlist.join ('%2C') + '%5D';
                }
                if (origclientorderidlistLength > 0) {
                    query = query + '&' + 'origclientorderidlist=%5B' + origclientorderidlist.join ('%2C') + '%5D';
                }
            } else {
                query = this.rawencode (extendedParams);
            }
            const signature = this.hmac (this.encode (query), this.encode (this.secret), sha256);
            query += '&' + 'signature=' + signature;
            if (method === 'GET') {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //    {
        //        "code": -1121,
        //        "msg": "Invalid symbol.",
        //    }
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (code !== undefined && code !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
