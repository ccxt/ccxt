'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sha2_js = require('@noble/hashes/sha2.js');
var toobit$1 = require('./abstract/toobit.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class toobit
 * @augments Exchange
 */
class toobit extends toobit$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'toobit',
            'name': 'Toobit',
            'countries': ['KY'], // Cayman Islands
            'version': 'v1',
            'rateLimit': 20, // 50 requests per second
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchAllGreeks': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': false,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLastPrices': true,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchVolatilityHistory': false,
                'fetchWithdrawals': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': true,
                'setMarginMode': true,
                'transfer': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/58e1b718-c6fd-49e2-8a49-797da6b9c008',
                'api': {
                    'common': 'https://api.toobit.com',
                    'private': 'https://api.toobit.com',
                },
                'www': 'https://www.toobit.com/',
                'doc': [
                    'https://api-docs.toobit.com/',
                ],
                'referral': {
                    'url': 'https://www.toobit.com/en-US/r?i=IFFPy0',
                    'discount': 0.1,
                },
                'fees': 'https://www.toobit.com/fee',
            },
            'api': {
                'common': {
                    'get': {
                        'api/v1/time': 1,
                        'api/v1/ping': 1,
                        'api/v1/exchangeInfo': 1,
                        'quote/v1/depth': 1, // todo: by limit 1-10
                        'quote/v1/depth/merged': 1,
                        'quote/v1/trades': 1,
                        'quote/v1/klines': 1,
                        'quote/v1/index/klines': 1,
                        'quote/v1/indexPriceComponents': 1,
                        'quote/v1/markPrice/klines': 1,
                        'quote/v1/markPrice': 10, // 5 requests per second
                        'quote/v1/index': 1,
                        'quote/v1/ticker/24hr': 40, // todo: 1-40 depenidng noSymbol
                        'quote/v1/contract/ticker/24hr': 40, // todo: 1-40 depenidng noSymbol
                        'quote/v1/ticker/price': 1,
                        'quote/v1/contract/ticker/price': 1,
                        'quote/v1/ticker/bookTicker': 1,
                        'quote/v1/contract/ticker/bookTicker': 1,
                        'api/v1/futures/fundingRate': 1,
                        'api/v1/futures/historyFundingRate': 1,
                        'api/v1/futures/riskLimits': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/v1/account': 5,
                        'api/v1/account/checkApiKey': 1,
                        'api/v1/spot/order': 1 * 1.67,
                        'api/v1/spot/openOrders': 1 * 1.67,
                        'api/v1/futures/openOrders': 1 * 1.67,
                        'api/v1/spot/tradeOrders': 5 * 1.67,
                        'api/v1/futures/historyOrders': 5 * 1.67,
                        'api/v1/account/trades': 5 * 1.67,
                        'api/v1/account/balanceFlow': 5,
                        'api/v1/account/depositOrders': 5,
                        'api/v1/account/withdrawOrders': 5,
                        'api/v1/account/deposit/address': 1,
                        // contracts
                        'api/v1/subAccount': 5,
                        'api/v1/account/subAccount': 5,
                        'api/v1/subAccount/list': 5,
                        'api/v1/futures/accountLeverage': 1,
                        'api/v1/futures/order': 1 * 1.67,
                        'api/v1/futures/positions': 5 * 1.67,
                        'api/v1/futures/historyPositions': 5,
                        'api/v1/futures/balance': 5,
                        'api/v1/futures/userTrades': 5 * 1.67,
                        'api/v1/futures/balanceFlow': 5,
                        'api/v1/futures/commissionRate': 5,
                        'api/v1/futures/todayPnl': 5,
                        'api/v1/account/download/detail': 10,
                        'api/v1/agent/inviteUserList': 1,
                        'api/v1/agent/commissionDataList': 1,
                        'api/v1/agent/commissionDataInfo': 1,
                        'api/v1/agent/inviteRelationCheck': 1,
                        'api/v1/agent/depositDetailList': 1,
                        'api/v1/agent/querySubAgentData': 1,
                        'api/v1/agent/spotOrdersList': 1,
                        'api/v1/agent/futuresOrdersList': 1,
                        'api/v1/agent/futuresPositionsList': 1,
                        'api/v1/agent/invite-commission-detail': 1,
                        'api/v1/agent/user/export': 1,
                        'api/v1/agent/export-list': 1,
                        'api/v1/agent/export-url': 1,
                    },
                    'post': {
                        'api/v1/spot/orderTest': 1 * 1.67,
                        'api/v1/spot/order': 1 * 1.67,
                        'api/v1/futures/order': 1 * 1.67,
                        'api/v1/spot/batchOrders': 2 * 1.67,
                        'api/v1/subAccount/transfer': 1,
                        'api/v1/account/withdraw': 1,
                        // contracts
                        'api/v1/futures/marginType': 1,
                        'api/v1/futures/leverage': 1,
                        'api/v1/futures/batchOrders': 2 * 1.67,
                        'api/v1/futures/position/trading-stop': 3 * 1.67,
                        'api/v1/futures/positionMargin': 1,
                        'api/v1/futures/order/update': 2 * 1.67,
                        'api/v1/futures/autoAddMargin': 1,
                        'api/v1/futures/flashClose': 1,
                        'api/v1/futures/reversePosition': 5,
                        'api/v1/account/download/apply': 1000,
                        'api/v1/userDataStream': 1,
                        'api/v1/listenKey': 1,
                    },
                    'delete': {
                        'api/v1/spot/order': 1 * 1.67,
                        'api/v1/futures/order': 1 * 1.67,
                        'api/v1/spot/openOrders': 5 * 1.67,
                        'api/v1/futures/batchOrders': 3 * 1.67,
                        'api/v1/spot/cancelOrderByIds': 5 * 1.67,
                        'api/v1/futures/cancelOrderByIds': 3 * 1.67,
                        'api/v1/userDataStream': 1,
                        'api/v1/listenKey': 1,
                    },
                    'put': {
                        'api/v1/userDataStream': 1,
                        'api/v1/listenKey': 1,
                    },
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
                '1w': '1w',
                '1M': '1M',
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    '-1000': errors.OperationFailed, // An unknown error occurred while processing the request.
                    '-1001': errors.OperationFailed, // Internal error; unable to process your request. Please try again.
                    '-1002': errors.PermissionDenied, // You are not authorized to execute this request.
                    '-1003': errors.RateLimitExceeded, // Too many requests queued.
                    '-1004': errors.BadRequest, // {"code":-1004,"msg":"Missing required parameter \u0027xyz\u0027"} | {"code":-1004,"msg":"Bad request"}
                    '-1005': errors.PermissionDenied, // No Permission
                    '-1006': errors.OperationFailed, // An unexpected response was received from the message bus. Execution status unknown.
                    '-1007': errors.OperationFailed, // Timeout waiting for response from backend server. Send status unknown; execution status unknown.
                    '-1014': errors.OperationFailed, // Unsupported order combination.
                    '-1015': errors.RateLimitExceeded, // Reach the rate limit .Please slow down your request speed.
                    '-1016': errors.OperationRejected, // This service is no longer available.
                    '-1020': errors.OperationRejected, // This operation is not supported.
                    '-1021': errors.OperationRejected, // Timestamp for this request is outside of the recvWindow.
                    '-1022': errors.OperationRejected, // Signature for this request is not valid.
                    '-1023': errors.PermissionDenied, // Please set IP whitelist before using API
                    '-1031': errors.OperationRejected, // The feature has been suspended
                    '-1100': errors.BadRequest, // Illegal characters found in a parameter.
                    '-1101': errors.BadRequest, // Too many parameters sent for this endpoint.
                    '-1102': errors.BadRequest, // A mandatory parameter was not sent, was empty/null, or malformed.
                    '-1103': errors.BadRequest, // An unknown parameter was sent.
                    '-1104': errors.BadRequest, // Not all sent parameters were read.
                    '-1105': errors.BadRequest, // A parameter was empty.
                    '-1106': errors.BadRequest, // A parameter was sent when not required.
                    '-1107': errors.PermissionDenied, // The accessKey is missing from the request header or parameters, or the accessKey is not in the correct format.
                    '-1111': errors.BadRequest, // Precision is over the maximum defined for this asset.
                    '-1112': errors.OperationRejected, // No orders on book for symbol.
                    '-1114': errors.BadRequest, // TimeInForce parameter sent when not required.
                    '-1115': errors.BadRequest, // Invalid timeInForce.
                    '-1116': errors.BadRequest, // Invalid orderType.
                    '-1117': errors.BadRequest, // Invalid side.
                    '-1118': errors.InvalidOrder, // New client order ID was empty.
                    '-1119': errors.InvalidOrder, // Original client order ID was empty.
                    '-1120': errors.BadRequest, // Invalid interval.
                    '-1121': errors.BadSymbol, // Invalid symbol.
                    '-1125': errors.OperationRejected, // This listenKey does not exist.
                    '-1127': errors.OperationRejected, // Lookup interval is too big.
                    '-1128': errors.BadRequest, // Combination of optional parameters invalid.
                    '-1129': errors.BadRequest, // The time range cannot exceed one year.
                    '-1130': errors.BadRequest, // Invalid data sent for a parameter.
                    '-1131': errors.InsufficientFunds, // Balance insufficient
                    '-1132': errors.OperationRejected, // Order price too high.
                    '-1133': errors.OperationRejected, // Order price lower than the minimum,please check general broker info.
                    '-1134': errors.OperationRejected, // Order price decimal too long,please check general broker info.
                    '-1135': errors.OperationRejected, // Order quantity too large.
                    '-1136': errors.OperationRejected, // Order quantity lower than the minimum.
                    '-1137': errors.OperationRejected, // Order quantity decimal too long.
                    '-1138': errors.OperationRejected, // Order price exceeds permissible range.
                    '-1139': errors.OperationRejected, // Order has been filled.
                    '-1140': errors.OperationRejected, // Transaction amount lower than the minimum.
                    '-1141': errors.InvalidOrder, // Duplicate clientOrderId
                    '-1142': errors.InvalidOrder, // Order has been canceled
                    '-1143': errors.OrderNotFound, // Cannot be found on order book
                    '-1144': errors.OperationRejected, // Order has been locked
                    '-1145': errors.OperationRejected, // This order type does not support cancellation
                    '-1146': errors.OperationFailed, // Order creation timeout
                    '-1147': errors.OperationFailed, // Order cancellation timeout
                    '-1148': errors.InvalidOrder, // Market order amount decimal too long
                    '-1149': errors.OperationFailed, // Create order failed
                    '-1150': errors.OperationFailed, // Cancel order failed
                    '-1151': errors.OperationRejected, // The trading pair is not open yet
                    '-1153': errors.PermissionDenied, // User not exist
                    '-1156': errors.InvalidOrder, // Order quantity invalid
                    '-1157': errors.OperationRejected, // The trading pair is not available for api trading
                    '-1158': errors.InvalidOrder, // create limit maker order failed
                    '-1161': errors.OperationRejected, // Reduce margin forbidden
                    '-1164': errors.OperationRejected, // Auto add margin error
                    '-1165': errors.BadRequest, // Invalid stopType.
                    '-1166': errors.BadRequest, // Invalid callbackType.
                    '-1170': errors.OperationRejected, // finance account exist.
                    '-1171': errors.ExchangeError, // account not exist.
                    '-1172': errors.OperationFailed, // Balance transfer failed.
                    '-1181': errors.PermissionDenied, // Currently not allowed to withdraw.
                    '-1182': errors.PermissionDenied, // Currently not allowed to deposit.
                    '-1193': errors.OperationRejected, // Create order count limit
                    '-1194': errors.OperationRejected, // Create market order forbidden
                    '-1195': errors.OperationRejected, // Create limit order price too small
                    '-1196': errors.OperationRejected, // Create limit order price too big
                    '-1197': errors.OperationRejected, // Create limit order buy price too big
                    '-1198': errors.OperationRejected, // Create limit order sell price too small
                    '-1199': errors.OperationRejected, // Create order buy quantity too small
                    '-1200': errors.OperationRejected, // Create order buy quantity too big
                    '-1201': errors.OperationRejected, // Create limit order sell price too big
                    '-1202': errors.OperationRejected, // Create order sell quantity too small
                    '-1203': errors.OperationRejected, // Create order sell quantity too big
                    '-1204': errors.PermissionDenied, // account not authorized
                    '-1205': errors.BadRequest, // same account not transfer
                    '-1206': errors.OperationRejected, // Orders over the maximum transaction amount
                    '-1207': errors.InvalidOrder, // planOrder count limit.
                    '-1208': errors.InvalidOrder, // stopProfitLoss order count limit.
                    '-1209': errors.InvalidOrder, // stopProfitLoss order position limit.
                    '-1210': errors.InvalidOrder, // dynamic stop profit long fallQuantity high.
                    '-1211': errors.InvalidOrder, // dynamic stop profit activePrice low.
                    '-1212': errors.InvalidOrder, // dynamic stop profit activePrice high.
                    '-1213': errors.BadSymbol, // Account symbol does not match
                    '-1214': errors.PermissionDenied, // No opening trades
                    '-1215': errors.PermissionDenied, // No closing trades
                    '-1216': errors.OperationRejected, // Trigger transfer limit failed
                    '-1217': errors.InvalidOrder, // Create stop order buy price too big
                    '-1300': errors.BadRequest, // Duplicate transferId
                    '-1400': errors.BadRequest, // API voucher type is not allowed.
                    '-1401': errors.PermissionDenied, // You are not eligible to use API trial voucher.
                    '-1402': errors.OperationFailed, // API voucher query failed.
                    '-1403': errors.OperationFailed, // API voucher receive failed.
                    '-1404': errors.ExchangeError, // API voucher agent config failed.
                    '-1405': errors.ExchangeError, // API voucher not found.
                    '-1406': errors.OperationRejected, // API voucher is already in use.
                    '-1407': errors.OperationRejected, // API voucher threshold is not met.
                    '-1408': errors.InsufficientFunds, // Contract asset is less than zero.
                    '-1409': errors.OperationRejected, // API voucher status is invalid.
                    '-1410': errors.InsufficientFunds, // API voucher system account balance is insufficient.
                    '-1411': errors.OperationRejected, // API voucher transfer is processing.
                    '-1412': errors.OperationRejected, // API voucher can not be merged.
                    '-1413': errors.BadRequest, // API voucher trade rate does not match.
                    '-1414': errors.BadRequest, // API voucher fee rule does not match.
                    '-1415': errors.BadRequest, // API voucher token does not match.
                    '-1416': errors.InsufficientFunds, // Some API vouchers can not be received due to insufficient system balance.
                    '-1417': errors.OperationRejected, // Some API vouchers do not meet the receiving threshold.
                    '-2010': errors.OperationFailed, // NEW_ORDER_REJECTED
                    '-2011': errors.OperationFailed, // CANCEL_REJECTED
                    '-2013': errors.OrderNotFound, // Order does not exist.
                    '-2014': errors.PermissionDenied, // API-key format invalid.
                    '-2015': errors.PermissionDenied, // Invalid API-key, IP, or permissions for action.
                    '-2016': errors.BadRequest, // No trading window could be found for the symbol. Try ticker/24hrs instead.
                    '-2017': errors.PermissionDenied, // The API key has expired. Please update your API key immediately.
                    '-2018': errors.PermissionDenied, // API triggered risk control restrictions have been suspended, if you have any questions, please contact support@toobit.com .
                    // errors above 3xxx are from swap API
                    '-3000': errors.BadRequest, // Option not exist.
                    '-3001': errors.OperationRejected, // The option has expired.
                    '-3002': errors.InvalidOrder, // Order failed: position exceeded limit
                    '-3050': errors.ExchangeError, // The ApiKey corresponding to the account already exists
                    '-3051': errors.OperationRejected, // The sub-user has assets are not allowed to be deleted
                    '-3052': errors.BadRequest, // sub-user id error
                    '-3101': errors.OperationRejected, // Open margin account error
                    '-3102': errors.OperationRejected, // Get margin safety error
                    '-3103': errors.BadRequest, // Risk config is not exit
                    '-3105': errors.OperationRejected, // Token can not borrow
                    '-3107': errors.OperationRejected, // Token can not withdraw
                    '-3108': errors.OperationRejected, // Get token avail withdraw error
                    '-3109': errors.OperationRejected, // Margin withdraw failed
                    '-3110': errors.InsufficientFunds, // Margin avail withdraw not enough failed
                    '-3116': errors.OperationRejected, // Repay fail
                    '-3117': errors.OperationRejected, // Get margin all position fail
                    '-3120': errors.OperationRejected, // Get repay order fail
                    '-3124': errors.OperationRejected, // Position and order data error
                    '-3125': errors.OperationRejected, // Position size cannot meet target leverage
                    '-3126': errors.OperationRejected, // Adjust leverage fail
                    '-3127': errors.OperationFailed, // Adjust leverage timeout
                    '-3128': errors.OperationRejected, // The margin mode cannot be changed while you have an open order/position
                    '-3129': errors.BadRequest, // Cone futures change position type error
                    '-3130': errors.OperationRejected, // Order margin insufficient
                    '-3131': errors.NotSupported, // Leverage reduction is not supported in Isolated Margin Mode with open positions.
                    '-3132': errors.InvalidOrder, // Maximum allowed leverage reached, please lower your leverage.
                    '-3133': errors.InvalidOrder, // The number of open orders exceeds the limit.
                    '-3136': errors.OperationRejected, // Quick symbol activity only limit/buy/ioc order is supported
                    '-3137': errors.OperationRejected, // Open countdown is not over
                    '-3138': errors.OperationRejected, // Open activity pre_hold is handling
                    '-3139': errors.OperationRejected, // Open activity max amount limit
                    '-3140': errors.OperationRejected, // Open activity min amount limit
                    '-3141': errors.InvalidOrder, // Invalid long stop profit price.
                    '-3142': errors.InvalidOrder, // Invalid long stop loss price.
                    '-3143': errors.InvalidOrder, // Invalid short stop profit price.
                    '-3144': errors.InvalidOrder, // Invalid short stop loss price.
                    '-3145': errors.InvalidOrder, // No position, Please confirm your position direction.
                    '-3147': errors.OperationRejected, // previous transfer is being processed. please try again later.
                    '-3148': errors.InvalidOrder, // create order exceeds max futures risk limit.
                    '-3149': errors.InvalidOrder, // The reduction in margin is unlawful.
                    '-3150': errors.NotSupported, // cross position margin adjustments are not supported.
                    '-3151': errors.NotSupported, // Separate position mode is not supported.
                    '-3152': errors.BadRequest, // Separate-position mismatch: position mode must be SEPARATE.
                    '-3153': errors.BadRequest, // Whole-position mismatch: position mode must be WHOLE.
                    '-32045': errors.ExchangeError, // Copy trading follower not found.
                    '-32090': errors.OperationRejected, // Trading pair change is not allowed.
                    '-32093': errors.OperationRejected, // Copy trading position type cannot be changed.
                    '-120041': errors.PermissionDenied, // Copy trading leader is not available.
                    '-120047': errors.ExchangeError, // Leader does not exist.
                    '-120055': errors.OperationRejected, // The follower currently has copy position, cannot be removed.
                    '-120067': errors.ExchangeError, // Copy trading level config not found.
                    '-120072': errors.BadRequest, // Copy trading leader config is invalid.
                    '-120073': errors.OperationRejected, // Unable to switch invite setting.
                    '-120078': errors.BadRequest, // unLeadStartTime or unLeadEndTime is invalid.
                    '-120510': errors.BadRequest, // Invite code already exists.
                    '-120511': errors.BadRequest, // Invite code contains sensitive content.
                    '-120512': errors.BadRequest, // Invite code is invalid.
                },
                'broad': {
                    'Unknown order sent': errors.OrderNotFound,
                    'Duplicate order sent': errors.InvalidOrder,
                    'Market is closed': errors.OperationRejected,
                    'Account has insufficient balance for requested action': errors.InsufficientFunds,
                    'Market orders are not supported for this symbol': errors.OperationRejected,
                    'Iceberg orders are not supported for this symbol': errors.OperationRejected,
                    'Stop loss orders are not supported for this symbol': errors.OperationRejected,
                    'Stop loss limit orders are not supported for this symbol': errors.OperationRejected,
                    'Take profit orders are not supported for this symbol': errors.OperationRejected,
                    'Take profit limit orders are not supported for this symbol': errors.OperationRejected,
                    'QTY is zero or less': errors.BadRequest,
                    'IcebergQty exceeds QTY': errors.OperationRejected,
                    'This action disabled is on this account': errors.PermissionDenied,
                    'Unsupported order combination': errors.BadRequest,
                    'Order would trigger immediately': errors.OperationRejected,
                    'Cancel order is invalid. Check origClOrdId and orderId': errors.OperationRejected,
                    'Order would immediately match and take': errors.OperationRejected,
                },
            },
            'commonCurrencies': {},
            'options': {
                'defaultType': 'spot',
                'accountsByType': {
                    'spot': 'MAIN',
                    'swap': 'FUTURES',
                },
                'networks': {
                    'BTC': 'BTC',
                    'ERC20': 'ETH',
                    'ETH': 'ETH',
                    'BEP20': 'BSC',
                    'TRC20': 'TRX',
                    'SOL': 'SOL',
                    'MATIC': 'MATIC',
                    'ARBONE': 'ARBITRUM',
                    'BASE': 'BASE',
                    'TON': 'TON',
                    'AVAXC': 'AVAXC',
                    'DOGE': 'DOGE',
                    'XRP': 'XRP',
                    'DOT': 'DOT',
                    'ADA': 'ADA',
                    'LTC': 'LTC',
                    'APT': 'APT',
                    'ATOM': 'ATOM',
                    'ALGO': 'ALGO',
                    'NEAR': 'NEAR',
                    'XLM': 'XLM',
                    'SUI': 'SUI',
                    'ETC': 'ETC',
                    'EOS': 'EOS',
                    'WAVES': 'WAVES',
                    'ICP': 'ICP',
                    'ONE': 'ONE',
                    // 'CHZ2': 'CHZ2',
                },
                'networksById': {
                    'ETH': 'ERC20',
                    'ERC20': 'ERC20',
                },
            },
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
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
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
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': undefined,
                },
                'forDerivatives': {
                    'createOrders': undefined,
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
        });
    }
    /**
     * @method
     * @name toobit#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#test-connectivity
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.commonGetApiV1Ping(params);
        return {
            'status': 'ok',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name toobit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api-docs.toobit.com/api/spot-market-data.html#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.commonGetApiV1Time(params);
        //
        //     {
        //         "serverTime": 1699827319559
        //     }
        //
        return this.safeInteger(response, 'serverTime');
    }
    /**
     * @method
     * @name toobit#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.toobit.com/api/spot-market-data.html#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.commonGetApiV1ExchangeInfo(params);
        this.options['exchangeInfo'] = response; // we store it in options for later use in fetchMarkets
        //
        //    {
        //        "timezone": "UTC",
        //        "serverTime": "1755583099926",
        //        "brokerFilters": [],
        //        "symbols": [
        //            {
        //                "filters": [
        //                    {
        //                        "minPrice": "0.01",
        //                        "maxPrice": "10000000.00000000",
        //                        "tickSize": "0.01",
        //                        "filterType": "PRICE_FILTER"
        //                    },
        //                    {
        //                        "minQty": "0.0001",
        //                        "maxQty": "4000",
        //                        "stepSize": "0.0001",
        //                        "filterType": "LOT_SIZE"
        //                    },
        //                    {
        //                        "minNotional": "5",
        //                        "filterType": "MIN_NOTIONAL"
        //                    },
        //                    {
        //                        "minAmount": "5",
        //                        "maxAmount": "6600000",
        //                        "minBuyPrice": "0.01",
        //                        "filterType": "TRADE_AMOUNT"
        //                    },
        //                    {
        //                        "maxSellPrice": "99999999",
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "LIMIT_TRADING"
        //                    },
        //                    {
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "MARKET_TRADING"
        //                    },
        //                    {
        //                        "noAllowMarketStartTime": "0",
        //                        "noAllowMarketEndTime": "0",
        //                        "limitOrderStartTime": "0",
        //                        "limitOrderEndTime": "0",
        //                        "limitMinPrice": "0",
        //                        "limitMaxPrice": "0",
        //                        "filterType": "OPEN_QUOTE"
        //                    }
        //                ],
        //                "exchangeId": "301",
        //                "symbol": "ETHUSDT",
        //                "symbolName": "ETHUSDT",
        //                "status": "TRADING",
        //                "baseAsset": "ETH",
        //                "baseAssetName": "ETH",
        //                "baseAssetPrecision": "0.0001",
        //                "quoteAsset": "USDT",
        //                "quoteAssetName": "USDT",
        //                "quotePrecision": "0.01",
        //                "icebergAllowed": false,
        //                "isAggregate": false,
        //                "allowMargin": true,
        //             }
        //        ],
        //        "options": [],
        //        "contracts": [
        //            {
        //                 "filters": [ ... ],
        //                 "exchangeId": "301",
        //                 "symbol": "BTC-SWAP-USDT",
        //                 "symbolName": "BTC-SWAP-USDTUSDT",
        //                 "status": "TRADING",
        //                 "baseAsset": "BTC-SWAP-USDT",
        //                 "baseAssetPrecision": "0.001",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetPrecision": "0.1",
        //                 "icebergAllowed": false,
        //                 "inverse": false,
        //                 "index": "BTC",
        //                 "indexToken": "BTCUSDT",
        //                 "marginToken": "USDT",
        //                 "marginPrecision": "0.0001",
        //                 "contractMultiplier": "0.001",
        //                 "underlying": "BTC",
        //                 "riskLimits": [
        //                     {
        //                         "riskLimitId": "200020911",
        //                         "quantity": "42000.0",
        //                         "initialMargin": "0.02",
        //                         "maintMargin": "0.01",
        //                         "isWhite": false
        //                     },
        //                     {
        //                         "riskLimitId": "200020912",
        //                         "quantity": "84000.0",
        //                         "initialMargin": "0.04",
        //                         "maintMargin": "0.02",
        //                         "isWhite": false
        //                     },
        //                     ...
        //                 ]
        //            },
        //        ],
        //        "coins": [
        //            {
        //                "orgId": "9001",
        //                "coinId": "TCOM",
        //                "coinName": "TCOM",
        //                "coinFullName": "TCOM",
        //                "allowWithdraw": true,
        //                "allowDeposit": true,
        //                "chainTypes": [
        //                    {
        //                        "chainType": "BSC",
        //                        "withdrawFee": "49.55478",
        //                        "minWithdrawQuantity": "77",
        //                        "maxWithdrawQuantity": "0",
        //                        "minDepositQuantity": "48",
        //                        "allowDeposit": true,
        //                        "allowWithdraw": false
        //                    }
        //                ],
        //                "isVirtual": false
        //            },
        //          ...
        //
        const coins = this.safeList(response, 'coins', []);
        const result = {};
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const parsed = this.parseCurrency(coin);
            if (parsed !== undefined) {
                const code = parsed['code'];
                result[code] = parsed;
            }
        }
        return result;
    }
    parseCurrency(rawCurrency) {
        const id = this.safeString(rawCurrency, 'coinId');
        const code = this.safeCurrencyCode(id);
        const networks = {};
        const rawNetworks = this.safeList(rawCurrency, 'chainTypes', []);
        for (let j = 0; j < rawNetworks.length; j++) {
            const rawNetwork = rawNetworks[j];
            const networkId = this.safeString(rawNetwork, 'chainType');
            const networkCode = this.networkIdToCode(networkId, code);
            networks[networkCode] = {
                'id': networkId,
                'network': networkCode,
                'margin': undefined,
                'deposit': this.safeBool(rawNetwork, 'allowDeposit'),
                'withdraw': this.safeBool(rawNetwork, 'allowWithdraw'),
                'active': undefined,
                'fee': this.safeNumber(rawNetwork, 'withdrawFee'),
                'precision': undefined,
                'limits': {
                    'deposit': {
                        'min': this.safeNumber(rawNetwork, 'minDepositQuantity'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber(rawNetwork, 'minWithdrawQuantity'),
                        'max': this.safeNumber(rawNetwork, 'maxWithdrawQuantity'),
                    },
                },
                'info': rawNetwork,
            };
        }
        return this.safeCurrencyStructure({
            'id': id,
            'code': code,
            'name': this.safeString(rawCurrency, 'coinFullName'),
            'type': undefined,
            'active': undefined,
            'deposit': this.safeBool(rawCurrency, 'allowDeposit'),
            'withdraw': this.safeBool(rawCurrency, 'allowWithdraw'),
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
            },
            'networks': networks,
            'info': rawCurrency,
        });
    }
    /**
     * @method
     * @name toobit#fetchMarkets
     * @description retrieves data on all markets for toobit
     * @see https://api-docs.toobit.com/api/spot-market-data.html#exchange-information
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        let response = this.safeDict(this.options, 'exchangeInfo');
        if (response !== undefined) {
            this.options['exchangeInfo'] = undefined; // reset it to avoid using old cached data
        }
        else {
            response = await this.commonGetApiV1ExchangeInfo(params);
        }
        //
        //    {
        //        "timezone": "UTC",
        //        "serverTime": "1755583099926",
        //        "brokerFilters": [],
        //        "symbols": [
        //            {
        //                "filters": [
        //                    {
        //                        "minPrice": "0.01",
        //                        "maxPrice": "10000000.00000000",
        //                        "tickSize": "0.01",
        //                        "filterType": "PRICE_FILTER"
        //                    },
        //                    {
        //                        "minQty": "0.0001",
        //                        "maxQty": "4000",
        //                        "stepSize": "0.0001",
        //                        "filterType": "LOT_SIZE"
        //                    },
        //                    {
        //                        "minNotional": "5",
        //                        "filterType": "MIN_NOTIONAL"
        //                    },
        //                    {
        //                        "minAmount": "5",
        //                        "maxAmount": "6600000",
        //                        "minBuyPrice": "0.01",
        //                        "filterType": "TRADE_AMOUNT"
        //                    },
        //                    {
        //                        "maxSellPrice": "99999999",
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "LIMIT_TRADING"
        //                    },
        //                    {
        //                        "buyPriceUpRate": "0.1",
        //                        "sellPriceDownRate": "0.1",
        //                        "filterType": "MARKET_TRADING"
        //                    },
        //                    {
        //                        "noAllowMarketStartTime": "0",
        //                        "noAllowMarketEndTime": "0",
        //                        "limitOrderStartTime": "0",
        //                        "limitOrderEndTime": "0",
        //                        "limitMinPrice": "0",
        //                        "limitMaxPrice": "0",
        //                        "filterType": "OPEN_QUOTE"
        //                    }
        //                ],
        //                "exchangeId": "301",
        //                "symbol": "ETHUSDT",
        //                "symbolName": "ETHUSDT",
        //                "status": "TRADING",
        //                "baseAsset": "ETH",
        //                "baseAssetName": "ETH",
        //                "baseAssetPrecision": "0.0001",
        //                "quoteAsset": "USDT",
        //                "quoteAssetName": "USDT",
        //                "quotePrecision": "0.01",
        //                "icebergAllowed": false,
        //                "isAggregate": false,
        //                "allowMargin": true,
        //             }
        //        ],
        //        "options": [],
        //        "contracts": [
        //            {
        //                 "filters": [ ... ],
        //                 "exchangeId": "301",
        //                 "symbol": "BTC-SWAP-USDT",
        //                 "symbolName": "BTC-SWAP-USDTUSDT",
        //                 "status": "TRADING",
        //                 "baseAsset": "BTC-SWAP-USDT",
        //                 "baseAssetPrecision": "0.001",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetPrecision": "0.1",
        //                 "icebergAllowed": false,
        //                 "inverse": false,
        //                 "index": "BTC",
        //                 "indexToken": "BTCUSDT",
        //                 "marginToken": "USDT",
        //                 "marginPrecision": "0.0001",
        //                 "contractMultiplier": "0.001",
        //                 "underlying": "BTC",
        //                 "riskLimits": [
        //                     {
        //                         "riskLimitId": "200020911",
        //                         "quantity": "42000.0",
        //                         "initialMargin": "0.02",
        //                         "maintMargin": "0.01",
        //                         "isWhite": false
        //                     },
        //                     {
        //                         "riskLimitId": "200020912",
        //                         "quantity": "84000.0",
        //                         "initialMargin": "0.04",
        //                         "maintMargin": "0.02",
        //                         "isWhite": false
        //                     },
        //                     ...
        //                 ]
        //            },
        //        ],
        //        "coins": [
        //            {
        //                "orgId": "9001",
        //                "coinId": "TCOM",
        //                "coinName": "TCOM",
        //                "coinFullName": "TCOM",
        //                "allowWithdraw": true,
        //                "allowDeposit": true,
        //                "chainTypes": [
        //                    {
        //                        "chainType": "BSC",
        //                        "withdrawFee": "49.55478",
        //                        "minWithdrawQuantity": "77",
        //                        "maxWithdrawQuantity": "0",
        //                        "minDepositQuantity": "48",
        //                        "allowDeposit": true,
        //                        "allowWithdraw": false
        //                    }
        //                ],
        //                "isVirtual": false
        //            },
        //          ...
        //
        const symbols = this.safeList(response, 'symbols', []);
        const contracts = this.safeList(response, 'contracts', []);
        const all = this.arrayConcat(symbols, contracts);
        const result = [];
        for (let i = 0; i < all.length; i++) {
            const market = all[i];
            const parsed = this.parseMarket(market);
            if (parsed !== undefined) {
                result.push(parsed);
            }
        }
        return result;
    }
    parseMarket(market) {
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString(market, 'baseAsset', '');
        const quoteId = this.safeString(market, 'quoteAsset');
        const baseParts = baseId.split('-');
        const baseIdClean = baseParts[0];
        const base = this.safeCurrencyCode(baseIdClean);
        const quote = this.safeCurrencyCode(quoteId);
        const settleId = this.safeString(market, 'marginToken');
        const settle = this.safeCurrencyCode(settleId);
        const status = this.safeString(market, 'status');
        const active = (status === 'TRADING');
        const filters = this.safeList(market, 'filters', []);
        const filtersByType = this.indexBy(filters, 'filterType');
        const priceFilter = this.safeDict(filtersByType, 'PRICE_FILTER', {});
        const lotSizeFilter = this.safeDict(filtersByType, 'LOT_SIZE', {});
        const minNotionalFilter = this.safeDict(filtersByType, 'MIN_NOTIONAL', {});
        let symbol = base + '/' + quote;
        const isContract = ('contractMultiplier' in market);
        const inverse = this.safeBool2(market, 'isInverse', 'inverse');
        if (isContract) {
            symbol += ':' + settle;
        }
        return this.safeMarketStructure({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': isContract ? 'swap' : 'spot',
            'spot': !isContract,
            'margin': false,
            'swap': isContract,
            'future': false,
            'option': false,
            'active': active,
            'contract': isContract,
            'linear': isContract ? !inverse : undefined,
            'inverse': isContract ? inverse : undefined,
            'contractSize': this.safeNumber(market, 'contractMultiplier'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(lotSizeFilter, 'stepSize'),
                'price': this.safeNumber(priceFilter, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(lotSizeFilter, 'minQty'),
                    'max': this.safeNumber(lotSizeFilter, 'maxQty'),
                },
                'price': {
                    'min': this.safeNumber(priceFilter, 'minPrice'),
                    'max': this.safeNumber(priceFilter, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber(minNotionalFilter, 'minNotional'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }
    /**
     * @method
     * @name toobit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.toobit.com/api/spot-market-data.html#order-book
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.commonGetQuoteV1Depth(this.extend(request, params));
        //
        //    {
        //        "t": "1755593995237",
        //        "b": [
        //            [
        //                "115186.47",
        //                "4.184864"
        //            ],
        //            [
        //                "115186.46",
        //                "0.002756"
        //            ],
        //            ...
        //        ],
        //        "a": [
        //            [
        //                "115186.48",
        //                "6.137369"
        //            ],
        //            [
        //                "115186.49",
        //                "0.002914"
        //            ],
        //            ...
        //        ]
        //    }
        //
        const timestamp = this.safeInteger(response, 't');
        return this.parseOrderBook(response, market['symbol'], timestamp, 'b', 'a');
    }
    /**
     * @method
     * @name toobit#fetchTrades
     * @description get a list of the most recent trades for a particular symbol
     * @see https://api-docs.toobit.com/api/spot-market-data.html#recent-trades-list
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#recent-trades-list
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.commonGetQuoteV1Trades(this.extend(request, params));
        //
        //    [
        //        {
        //            "t": "1755594277287",
        //            "p": "115276.99",
        //            "q": "0.001508",
        //            "ibm": true
        //        },
        //    ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //
        //        {
        //            "t": "1755594277287",
        //            "p": "115276.99",
        //            "q": "0.001508",
        //            "ibm": true
        //        },
        //        // watchTrades have also an additional fields:
        //             "v": "4864732022868004630",   // trade id
        //             "m": true,                    // is the buyer taker
        //
        // fetchMyTrades
        //
        //        {
        //            "id": "2024934575206059008",
        //            "symbol": "ETHUSDT",
        //            "orderId": "2024934575097029888",
        //            "ticketId": "4864450547563401875",
        //            "price": "4641.21",
        //            "qty": "0.001",
        //            "time": "1756127012094",
        //            "isMaker": false,
        //            "commission": "0.00464121",
        //            "commissionAsset": "USDT",
        //            "makerRebate": "0",
        //            "symbolName": "ETHUSDT",                 // only in SPOT
        //            "isBuyer": false,                        // only in SPOT
        //            "feeAmount": "0.00464121",               // only in SPOT
        //            "feeCoinId": "USDT",                     // only in SPOT
        //            "fee": {                                 // only in SPOT
        //                "feeCoinId": "USDT",
        //                "feeCoinName": "USDT",
        //                "fee": "0.00464121"
        //            },
        //            "type": "LIMIT",                         // only in CONTRACT
        //            "side": "BUY_OPEN",                      // only in CONTRACT
        //            "realizedPnl": "0",                      // only in CONTRACT
        //        },
        //
        const timestamp = this.safeInteger2(trade, 't', 'time');
        const priceString = this.safeString2(trade, 'p', 'price');
        const amountString = this.safeString2(trade, 'q', 'qty');
        const isBuyer = this.safeBool(trade, 'isBuyer');
        let side = undefined;
        let isBuyerMaker = this.safeBool(trade, 'ibm');
        if (isBuyerMaker === undefined) {
            const isBuyerTaker = this.safeBool(trade, 'm');
            if (isBuyerTaker !== undefined) {
                isBuyerMaker = !isBuyerTaker;
            }
        }
        if (isBuyerMaker !== undefined) {
            if (isBuyerMaker) {
                side = 'sell';
            }
            else {
                side = 'buy';
            }
        }
        else {
            if (isBuyer) {
                side = 'buy';
            }
            else {
                side = 'sell';
            }
        }
        const feeCurrencyId = this.safeString(trade, 'feeCoinId');
        const feeAmount = this.safeString(trade, 'feeAmount');
        let fee = undefined;
        if (feeAmount !== undefined) {
            fee = {
                'currency': this.safeCurrencyCode(feeCurrencyId),
                'cost': feeAmount,
            };
        }
        const isMaker = this.safeBool(trade, 'isMaker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        market = this.safeMarket(undefined, market);
        const symbol = market['symbol'];
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': this.safeString2(trade, 'id', 'v'),
            'order': this.safeString(trade, 'orderId'),
            'type': undefined,
            'side': side,
            'amount': amountString,
            'price': priceString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name toobit#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.toobit.com/api/spot-market-data.html#kline-candlestick-data
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#kline-candlestick-data
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#index-price-kline-candlestick-data
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#mark-price-kline-candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = [];
        let endpoint = undefined;
        [endpoint, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'price');
        if (endpoint === 'index') {
            response = await this.commonGetQuoteV1IndexKlines(this.extend(request, params));
            //
            //     {
            //         "code": 200,
            //         "data": [
            //             {
            //                 "t": 1669155300000,//time
            //                 "s": "ETHUSDT",// symbol
            //                 "sn": "ETHUSDT",//symbol name
            //                 "c": "1127.1",//Close price
            //                 "h": "1130.81",//High price
            //                 "l": "1126.17",//Low price
            //                 "o": "1130.8",//Open price
            //                 "v": "0"//Volume
            //             },
            //             {
            //                 "t": 1669156200000,
            //                 "s": "ETHUSDT",
            //                 "sn": "ETHUSDT",
            //                 "c": "1129.44",
            //                 "h": "1129.54",
            //                 "l": "1127.1",
            //                 "o": "1127.1",
            //                 "v": "0"
            //             }
            //         ]
            //     }
            //
        }
        else if (endpoint === 'mark') {
            response = await this.commonGetQuoteV1MarkPriceKlines(this.extend(request, params));
            //
            //     {
            //         "code": 200,
            //         "data": [
            //             {
            //                 "symbol": "BTCUSDT",// Symbol
            //                 "time": 1670157900000,// time
            //                 "low": "16991.14096",//Low price
            //                 "open": "16991.78288",//Open price
            //                 "high": "16996.30641",// High prce
            //                 "close": "16996.30641",// Close price
            //                 "volume": "0",// Volume
            //                 "curId": 1670157900000
            //             }
            //         ]
            //     }
            //
        }
        else {
            response = await this.commonGetQuoteV1Klines(this.extend(request, params));
            //
            //    [
            //        [
            //            1755540660000,
            //            "116399.99",
            //            "116399.99",
            //            "116360.09",
            //            "116360.1",
            //            "2.236869",
            //            0,
            //            "260303.79722607",
            //            22,
            //            "2.221061",
            //            "258464.10338267"
            //        ],
            //        ...
            //
        }
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        return [
            this.safeIntegerN(ohlcv, [0, 'time', 't']),
            this.safeNumberN(ohlcv, [1, 'open', 'o']),
            this.safeNumberN(ohlcv, [2, 'high', 'h']),
            this.safeNumberN(ohlcv, [3, 'low', 'l']),
            this.safeNumberN(ohlcv, [4, 'close', 'c']),
            this.safeNumberN(ohlcv, [5, 'volume', 'v']),
        ];
    }
    /**
     * @method
     * @name toobit#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api-docs.toobit.com/api/spot-market-data.html#_24hr-ticker-price-change-statistics
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#_24hr-ticker-price-change-statistics
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols);
        let type = undefined;
        let market = undefined;
        const request = {};
        if (symbols !== undefined) {
            const symbol = this.safeString(symbols, 0);
            if (symbol !== undefined) {
                market = this.market(symbol);
            }
            const length = symbols.length;
            if ((length === 1) && (market !== undefined)) {
                request['symbol'] = market['id'];
            }
        }
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.commonGetQuoteV1Ticker24hr(this.extend(request, params));
        }
        else {
            response = await this.commonGetQuoteV1ContractTicker24hr(this.extend(request, params));
        }
        //
        //    [
        //        {
        //            "t": "1755601440162",
        //            "s": "GRDRUSDT",
        //            "o": "0.38",
        //            "h": "0.38",
        //            "l": "0.38",
        //            "c": "0.38",
        //            "v": "0",
        //            "qv": "0",
        //            "pc": "0",
        //            "pcp": "0"
        //        },
        //        ...
        //
        return this.parseTickers(response, symbols, params);
    }
    parseTicker(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 's');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(ticker, 't');
        const last = this.safeString(ticker, 'c');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'h'),
            'low': this.safeString(ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString(ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString(ticker, 'pc'),
            'percentage': this.safeString(ticker, 'pcp'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'v'),
            'quoteVolume': this.safeString(ticker, 'qv'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name toobit#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://api-docs.toobit.com/api/spot-market-data.html#symbol-price-ticker
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#symbol-price-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the last prices
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of lastprices structures
     */
    async fetchLastPrices(symbols = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const market = this.market(symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.commonGetQuoteV1TickerPrice(this.extend(request, params));
        //
        //    [
        //        {
        //            "s": "BNTUSDT",
        //            "si": "BNTUSDT",
        //            "p": "0.823"
        //        },
        //
        return this.parseLastPrices(response, symbols);
    }
    parseLastPrice(entry, market = undefined) {
        const marketId = this.safeString(entry, 's');
        market = this.safeMarket(marketId, market);
        return {
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'price': this.safeNumberOmitZero(entry, 'price'),
            'side': undefined,
            'info': entry,
        };
    }
    /**
     * @method
     * @name toobit#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://api-docs.toobit.com/api/spot-market-data.html#symbol-order-book-ticker
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#symbol-order-book-ticker
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const market = this.market(symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.commonGetQuoteV1TickerBookTicker(this.extend(request, params));
        //
        //    [
        //        {
        //            "s": "GRDRUSDT",
        //            "b": "0",
        //            "bq": "0",
        //            "a": "0",
        //            "aq": "0",
        //            "t": "1755936610506"
        //        }, ...
        //
        return this.parseBidsAsksCustom(response, symbols);
    }
    parseBidsAsksCustom(tickers, symbols = undefined, params = {}) {
        const results = [];
        for (let i = 0; i < tickers.length; i++) {
            const parsedTicker = this.parseBidAskCustom(tickers[i]);
            const ticker = this.extend(parsedTicker, params);
            results.push(ticker);
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArray(results, 'symbol', symbols);
    }
    parseBidAskCustom(ticker) {
        return {
            'timestamp': this.safeString(ticker, 't'),
            'symbol': this.safeString(ticker, 's'),
            'bid': this.safeNumber(ticker, 'b'),
            'bidVolume': this.safeNumber(ticker, 'bq'),
            'ask': this.safeNumber(ticker, 'a'),
            'askVolume': this.safeNumber(ticker, 'aq'),
            'info': ticker,
        };
    }
    /**
     * @method
     * @name toobit#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#funding-rate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexe by market symbols
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const market = this.market(symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.commonGetApiV1FuturesFundingRate(this.extend(request, params));
        //
        //    [
        //        {
        //            "symbol": "BTC-SWAP-USDT",
        //            "rate": "0.0001071148112848",
        //            "nextFundingTime": "1755964800000"
        //        },...
        //
        return this.parseFundingRates(response, symbols);
    }
    parseFundingRate(contract, market = undefined) {
        const marketId = this.safeString(contract, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const nextFundingRate = this.safeNumber(contract, 'rate');
        const nextFundingRateTimestamp = this.safeInteger(contract, 'nextFundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'previousFundingRate': undefined,
            'nextFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'nextFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'nextFundingDatetime': undefined,
            'fundingRate': nextFundingRate,
            'fundingTimestamp': nextFundingRateTimestamp,
            'fundingDatetime': this.iso8601(nextFundingRateTimestamp),
            'interval': undefined,
        };
    }
    /**
     * @method
     * @name toobit#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-docs.toobit.com/api/usdt-m-market-data.html#get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, '8h', params);
        }
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.commonGetApiV1FuturesHistoryFundingRate(this.extend(request, params));
        //
        //    [
        //        {
        //            "id": "869931",
        //            "symbol": "BTC-SWAP-USDT",
        //            "settleTime": "1755936000000",
        //            "settleRate": "0.0001"
        //        }, ...
        //
        return this.parseFundingRateHistories(response, market, since, limit);
    }
    parseFundingRateHistory(contract, market = undefined) {
        const timestamp = this.safeInteger(contract, 'settleTime');
        const marketId = this.safeString(contract, 'symbol');
        return {
            'info': contract,
            'symbol': this.safeSymbol(marketId, market),
            'fundingRate': this.safeNumber(contract, 'settleRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name toobit#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#account-information-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#futures-account-balance-user-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let response = undefined;
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        if (this.inArray(marketType, ['swap', 'future'])) {
            response = await this.privateGetApiV1FuturesBalance();
            //
            //     [
            //         {
            //             "asset": "USDT", // asset
            //             "balance": "999999999999.982", // total
            //             "availableBalance": "1899999999978.4995", // available balance Include unrealized pnl
            //             "positionMargin": "11.9825", //position Margin
            //             "orderMargin": "9.5", //order Margin
            //             "crossUnRealizedPnl": "10.01" //The unrealized profit and loss of cross position
            //         }
            //     ]
            //
        }
        else {
            response = await this.privateGetApiV1Account();
            //
            //    {
            //        "userId": "912902020",
            //        "balances": [
            //            {
            //                "asset": "ETH",
            //                "assetId": "ETH",
            //                "assetName": "ETH",
            //                "total": "0.025",
            //                "free": "0.025",
            //                "locked": "0"
            //            }
            //        ]
            //    }
            //
        }
        return this.parseBalance(response);
    }
    parseBalance(response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeList(response, 'balances', response);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode(this.safeString(balance, 'asset'));
            const account = this.account();
            account['free'] = this.safeString2(balance, 'free', 'availableBalance');
            account['total'] = this.safeString2(balance, 'total', 'balance');
            account['used'] = this.safeString(balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name toobit#createOrder
     * @description create a trade order
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#new-order-trade
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        let request = {};
        let response = {};
        if (market['spot']) {
            [request, params] = this.createOrderRequest(symbol, type, side, amount, price, params);
            response = await this.privatePostApiV1SpotOrder(this.extend(request, params));
        }
        else {
            [request, params] = this.createContractOrderRequest(symbol, type, side, amount, price, params);
            response = await this.privatePostApiV1FuturesOrder(this.extend(request, params));
        }
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "price": "0",
        //         "origQty": "0.001",
        //         "orderId": "2024837825254460160",
        //         "clientOrderId": "1756115478113679",
        //         "executedQty": "0",
        //         "status": "PENDING_NEW",
        //         "timeInForce": "GTC",
        //         "type": "MARKET",
        //         "side": "SELL"
        //         "accountId": "1783404067076253952",    // only in spot
        //         "symbolName": "ETHUSDT",               // only in spot
        //         "transactTime": "1756115478604",       // only in spot
        //         "time": "1668418485058",               // only in contract
        //         "updateTime": "1668418485058",         // only in contract
        //         "leverage": "2",                       // only in contract
        //         "avgPrice": "0",                       // only in contract
        //         "marginLocked": "9.5",                 // only in contract
        //         "priceType": "INPUT"                   // only in contract
        //     }
        //
        return this.parseOrder(response, market);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        if (side === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a side argument');
        }
        const id = market['id'];
        const request = {
            'symbol': id,
            'side': side.toUpperCase(),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        let cost = undefined;
        [cost, params] = this.handleParamString(params, 'cost');
        if (type === 'market') {
            if (cost === undefined && side === 'buy') {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires params["cost"] for market buy order');
            }
            else {
                request['quantity'] = this.costToPrecision(symbol, cost);
            }
        }
        else {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        let isPostOnly = undefined;
        [isPostOnly, params] = this.handlePostOnly(type === 'market', false, params);
        if (isPostOnly) {
            request['type'] = 'LIMIT_MAKER';
        }
        else {
            request['type'] = type.toUpperCase();
        }
        return [request, params];
    }
    createContractOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision(symbol, amount),
        };
        let reduceOnly = undefined;
        [reduceOnly, params] = this.handleParamBool(params, 'reduceOnly');
        if (side === 'buy') {
            side = reduceOnly ? 'SELL_CLOSE' : 'BUY_OPEN';
        }
        else if (side === 'sell') {
            side = reduceOnly ? 'BUY_CLOSE' : 'SELL_OPEN';
        }
        request['side'] = side;
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (this.inArray(type, ['limit', 'LIMIT'])) {
            request['type'] = type.toUpperCase();
            request['price'] = this.priceToPrecision(symbol, price);
        }
        else if (type === 'market') {
            request['type'] = 'LIMIT'; // weird, but exchange works this way
            request['priceType'] = 'MARKET';
        }
        let isPostOnly = undefined;
        [isPostOnly, params] = this.handlePostOnly(type === 'market', false, params);
        if (isPostOnly) {
            request['timeInForce'] = 'LIMIT_MAKER';
        }
        const values = this.handleTriggerPricesAndParams(symbol, params);
        const triggerPrice = values[0];
        params = values[3];
        if (triggerPrice !== undefined) {
            request['stopPrice'] = triggerPrice;
        }
        const stopLoss = this.safeDict(params, 'stopLoss');
        const takeProfit = this.safeDict(params, 'takeProfit');
        const hasStopLoss = (stopLoss !== undefined);
        const hasTakeProfit = (takeProfit !== undefined);
        const triggerPriceTypes = {
            'mark': 'MARK_PRICE',
            'last': 'CONTRACT_PRICE',
        };
        if (hasStopLoss) {
            request['stopLoss'] = this.safeValue(stopLoss, 'triggerPrice');
            const limitPrice = this.safeValue(stopLoss, 'price');
            if (limitPrice !== undefined) {
                request['slOrderType'] = 'LIMIT';
                request['slLimitPrice'] = this.priceToPrecision(symbol, limitPrice);
            }
            const triggerPriceType = this.safeString(stopLoss, 'triggerPriceType');
            if (triggerPriceType !== undefined) {
                request['slTriggerBy'] = this.safeString(triggerPriceTypes, triggerPriceType, triggerPriceType);
            }
            params = this.omit(params, 'stopLoss');
        }
        if (hasTakeProfit) {
            request['takeProfit'] = this.safeValue(takeProfit, 'triggerPrice');
            const limitPrice = this.safeValue(takeProfit, 'price');
            if (limitPrice !== undefined) {
                request['tpOrderType'] = 'LIMIT';
                request['tpLimitPrice'] = this.priceToPrecision(symbol, limitPrice);
            }
            const triggerPriceType = this.safeString(takeProfit, 'triggerPriceType');
            if (triggerPriceType !== undefined) {
                request['tpTriggerBy'] = this.safeString(triggerPriceTypes, triggerPriceType, triggerPriceType);
            }
            params = this.omit(params, 'takeProfit');
        }
        if (!('newClientOrderId' in params)) {
            request['newClientOrderId'] = this.uuid();
        }
        return [request, params];
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder, cancelOrder
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "price": "0",
        //         "origQty": "0.001",
        //         "orderId": "2024837825254460160",
        //         "clientOrderId": "1756115478113679",
        //         "executedQty": "0",
        //         "status": "PENDING_NEW",
        //         "timeInForce": "GTC",
        //         "type": "MARKET",
        //         "side": "SELL"
        //         "accountId": "1783404067076253952",    // only in spot
        //         "symbolName": "ETHUSDT",               // only in spot
        //         "transactTime": "1756115478604",       // only in spot
        //         "time": "1668418485058",               // only in contract
        //         "updateTime": "1668418485058",         // only in contract
        //         "leverage": "2",                       // only in contract
        //         "avgPrice": "0",                       // only in contract
        //         "marginLocked": "9.5",                 // only in contract
        //         "priceType": "INPUT"                   // only in contract
        //     }
        //
        //
        // fetchOrder, fetchOrders, fetchOpenOrders
        //
        //    {
        //        "time": "1756140208069",
        //        "updateTime": "1756140208078",
        //        "orderId": "2025045271033977089",
        //        "clientOrderId": "17561402075722006",
        //        "symbol": "ETHUSDT",
        //        "price": "3000",
        //        "origQty": "0.002",
        //        "executedQty": "0",
        //        "avgPrice": "0",
        //        "type": "LIMIT",
        //        "side": "BUY",
        //        "timeInForce": "GTC",
        //        "status": "NEW",
        //        "accountId": "1783404067076253952",  // only in SPOT
        //        "exchangeId": "301",                 // only in SPOT
        //        "symbolName": "ETHUSDT",             // only in SPOT
        //        "cummulativeQuoteQty": "0",          // only in SPOT
        //        "cumulativeQuoteQty": "0",           // only in SPOT
        //        "stopPrice": "0.0",                  // only in SPOT
        //        "icebergQty": "0.0",                 // only in SPOT
        //        "isWorking": true                    // only in SPOT
        //        "leverage": "2",                     // only in CONTRACT
        //        "marginLocked": "9.5",               // only in CONTRACT
        //        "priceType": "INPUT"                 // only in CONTRACT
        //        "triggerType": "0",                  // only in CONTRACT fetchClosedOrders
        //        "fallType": "0",                     // only in CONTRACT fetchClosedOrders
        //        "activeStatus": "0"                  // only in CONTRACT fetchClosedOrders
        //    }
        //
        const timestamp = this.safeInteger2(order, 'transactTime', 'time');
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const rawType = this.safeString(order, 'type');
        const rawSideLower = this.safeStringLower(order, 'side');
        let triggerPrice = this.omitZero(this.safeString(order, 'stopPrice'));
        if (triggerPrice === '0.0') {
            triggerPrice = undefined;
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'orderId'),
            'clientOrderId': this.safeString(order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger(order, 'updateTime'),
            'status': this.parseOrderStatus(this.safeString(order, 'status')),
            'symbol': market['symbol'],
            'type': this.parseOrderType(rawType),
            'timeInForce': this.safeString(order, 'timeInForce'),
            'postOnly': (rawType === 'LIMIT_MAKER'),
            'side': rawSideLower,
            'price': this.omitZero(this.safeString(order, 'price')),
            'triggerPrice': triggerPrice,
            'cost': this.omitZero(this.safeString(order, 'cumulativeQuoteQty')),
            'average': this.safeString(order, 'avgPrice'),
            'amount': this.safeString(order, 'origQty'),
            'filled': this.safeString(order, 'executedQty'),
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'marginMode': undefined,
            'reduceOnly': undefined,
            'leverage': undefined,
            'hedged': undefined,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'PENDING_NEW': 'open',
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'PENDING_CANCEL': 'canceled',
            'CANCELED': 'canceled',
            'REJECTED': 'canceled',
        };
        if (status === undefined) {
            return undefined;
        }
        return this.safeString(statuses, status, status);
    }
    parseOrderType(status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
        };
        if (status === undefined) {
            return undefined;
        }
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name toobit#cancelOrder
     * @description cancels an open order
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#cancel-order-trade
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#cancel-order-trade
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        const request = {};
        if (this.safeString(params, 'clientOrderId') === undefined) {
            request['orderId'] = id;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelOrder', market, params, 'none');
        if (marketType === 'none') {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument or the "defaultType" parameter to be set to "spot" or "swap"');
        }
        let response = {};
        if (marketType === 'spot') {
            response = await this.privateDeleteApiV1SpotOrder(this.extend(request, params));
        }
        else {
            response = await this.privateDeleteApiV1FuturesOrder(this.extend(request, params));
        }
        // response same as in `createOrder`
        const status = this.parseOrderStatus(this.safeString(response, 'status'));
        if (status !== 'open') {
            throw new errors.OrderNotFound(this.id + ' order ' + id + ' can not be canceled, ' + this.json(response));
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name toobit#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#cancel-all-open-orders-trade
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#cancel-orders-trade
     * @param {string} symbol unified symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelAllOrders', market, params, 'none');
        if (marketType === 'none') {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument or the "defaultType" parameter to be set to "spot" or "swap"');
        }
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateDeleteApiV1SpotOpenOrders(this.extend(request, params));
            //
            // {"success":true}  // always same response
            //
        }
        else {
            response = await this.privateDeleteApiV1FuturesBatchOrders(this.extend(request, params));
            //
            // { "code": 200, "message":"success", "timestamp":1541161088303 }
            //
        }
        return [
            this.safeOrder({
                'info': response,
            }),
        ];
    }
    /**
     * @method
     * @name toobit#cancelOrders
     * @description cancel multiple orders
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#cancel-multiple-orders-trade
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#cancel-multiple-orders-trade
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const idsString = ids.join(',');
        const request = {
            'ids': idsString,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelOrders', market, params, 'none');
        if (marketType === 'none') {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument or the "defaultType" parameter to be set to "spot" or "swap"');
        }
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateDeleteApiV1SpotCancelOrderByIds(this.extend(request, params));
            //
            // {"success":true}  // always same response
            //
        }
        else {
            response = await this.privateDeleteApiV1FuturesCancelOrderByIds(this.extend(request, params));
            //
            // {
            //     "code":200,
            //     "result":[
            //         {
            //             "orderId":"1327047813809448704",
            //             "code":-2013
            //         },
            //         {
            //             "orderId":"1327047814212101888",
            //             "code":-2013
            //         }
            //     ]
            // }
            //
            // or empty array if no orders were canceled
        }
        const result = this.safeList(response, 'result', []);
        return this.parseOrders(result, market);
    }
    /**
     * @method
     * @name toobit#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#query-order-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#query-order-user-data
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const request = {
            'orderId': id,
        };
        const market = this.market(symbol);
        let response = {};
        if (market['spot']) {
            response = await this.privateGetApiV1SpotOrder(this.extend(request, params));
        }
        else {
            response = await this.privateGetApiV1FuturesOrder(this.extend(request, params));
        }
        //
        //    {
        //        "time": "1756140208069",
        //        "updateTime": "1756140208078",
        //        "orderId": "2025045271033977089",
        //        "clientOrderId": "17561402075722006",
        //        "symbol": "ETHUSDT",
        //        "price": "3000",
        //        "origQty": "0.002",
        //        "executedQty": "0",
        //        "avgPrice": "0",
        //        "type": "LIMIT",
        //        "side": "BUY",
        //        "timeInForce": "GTC",
        //        "status": "NEW",
        //        "accountId": "1783404067076253952",  // only in SPOT
        //        "exchangeId": "301",                 // only in SPOT
        //        "symbolName": "ETHUSDT",             // only in SPOT
        //        "cummulativeQuoteQty": "0",          // only in SPOT
        //        "cumulativeQuoteQty": "0",           // only in SPOT
        //        "stopPrice": "0.0",                  // only in SPOT
        //        "icebergQty": "0.0",                 // only in SPOT
        //        "isWorking": true                    // only in SPOT
        //        "leverage": "2",                     // only in CONTRACT
        //        "marginLocked": "9.5",               // only in CONTRACT
        //        "priceType": "INPUT"                 // only in CONTRACT
        //    }
        //
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name toobit#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#current-open-orders-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#query-current-open-order-user-data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOrders', market, params);
        let response = [];
        if (marketType === 'spot') {
            response = await this.privateGetApiV1SpotOpenOrders(this.extend(request, params));
            //
            //    [
            //        {
            //            "accountId": "1783404067076253952",
            //            "exchangeId": "301",
            //            "symbol": "ETHUSDT",
            //            "symbolName": "ETHUSDT",
            //            "clientOrderId": "17561415157172008",
            //            "orderId": "2025056244339984384",
            //            "price": "3000",
            //            "origQty": "0.002",
            //            "executedQty": "0",
            //            "cummulativeQuoteQty": "0",
            //            "cumulativeQuoteQty": "0",
            //            "avgPrice": "0",
            //            "status": "NEW",
            //            "timeInForce": "GTC",
            //            "type": "LIMIT",
            //            "side": "BUY",
            //            "stopPrice": "0.0",
            //            "icebergQty": "0.0",
            //            "time": "1756141516189",
            //            "updateTime": "1756141516198",
            //            "isWorking": true
            //        }, ...
            //    ]
            //
        }
        else {
            response = await this.privateGetApiV1FuturesOpenOrders(this.extend(request, params));
        }
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name toobit#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#all-orders-user-data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOrders', market, params);
        let response = [];
        if (marketType === 'spot') {
            response = await this.privateGetApiV1SpotTradeOrders(request);
            //
            //    [
            //        {
            //            "accountId": "1783404067076253952",
            //            "exchangeId": "301",
            //            "symbol": "ETHUSDT",
            //            "symbolName": "ETHUSDT",
            //            "clientOrderId": "17561415157172008",
            //            "orderId": "2025056244339984384",
            //            "price": "3000",
            //            "origQty": "0.002",
            //            "executedQty": "0",
            //            "cummulativeQuoteQty": "0",
            //            "cumulativeQuoteQty": "0",
            //            "avgPrice": "0",
            //            "status": "NEW",
            //            "timeInForce": "GTC",
            //            "type": "LIMIT",
            //            "side": "BUY",
            //            "stopPrice": "0.0",
            //            "icebergQty": "0.0",
            //            "time": "1756141516189",
            //            "updateTime": "1756141516198",
            //            "isWorking": true
            //        }, ...
            //    ]
            //
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchOrders() is not supported for ' + marketType + ' markets');
        }
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name toobit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#query-history-orders-user-data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // returns the most recent closed or canceled orders up to circa two weeks ago
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchClosedOrders', market, params);
        let response = [];
        if (marketType === 'spot') {
            throw new errors.NotSupported(this.id + ' fetchOrders() is not supported for ' + marketType + ' markets');
        }
        else {
            response = await this.privateGetApiV1FuturesHistoryOrders(request);
            //
            //    [
            //        {
            //            "time": "1756756879360",
            //            "updateTime": "1756757165956",
            //            "orderId": "2030218284767504128",
            //            "clientOrderId": "1756756876002",
            //            "symbol": "SOL-SWAP-USDT",
            //            "price": "144",
            //            "leverage": "50",
            //            "origQty": "1",
            //            "executedQty": "0",
            //            "executeQty": "0",
            //            "avgPrice": "0",
            //            "marginLocked": "0",
            //            "type": "LIMIT",
            //            "side": "BUY_OPEN",
            //            "timeInForce": "GTC",
            //            "status": "CANCELED",
            //            "priceType": "INPUT",
            //            "triggerType": "0",
            //            "fallType": "0",
            //            "activeStatus": "0"
            //        }
            //    ]
            //
        }
        const ordersList = [];
        for (let i = 0; i < response.length; i++) {
            ordersList.push({ 'result': response[i] });
        }
        return this.parseOrders(ordersList, market, since, limit);
    }
    /**
     * @method
     * @name toobit#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#account-trade-list-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#account-trade-list-user-data
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let request = {};
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const market = this.market(symbol);
        request['symbol'] = market['id'];
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        [request, params] = this.handleUntilOption('endTime', request, params);
        let response = [];
        if (marketType === 'spot') {
            response = await this.privateGetApiV1AccountTrades(this.extend(request, params));
            //
            //    [
            //        {
            //            "id": "2024934575206059008",
            //            "symbol": "ETHUSDT",
            //            "symbolName": "ETHUSDT",
            //            "orderId": "2024934575097029888",
            //            "price": "4641.21",
            //            "qty": "0.001",
            //            "commission": "0.00464121",
            //            "commissionAsset": "USDT",
            //            "time": "1756127012094",
            //            "isBuyer": false,
            //            "isMaker": false,
            //            "fee": {
            //                "feeCoinId": "USDT",
            //                "feeCoinName": "USDT",
            //                "fee": "0.00464121"
            //            },
            //            "feeCoinId": "USDT",
            //            "feeAmount": "0.00464121",
            //            "makerRebate": "0",
            //            "ticketId": "4864450547563401875"
            //        }, ...
            //
        }
        else {
            response = await this.privateGetApiV1FuturesUserTrades(request);
            //
            //    [
            //        {
            //            "time": "1756758426899",
            //            "id": "2030231266499116032",
            //            "orderId": "2030231266373265152",
            //            "symbol": "DOGE-SWAP-USDT",
            //            "price": "0.21191",
            //            "qty": "63",
            //            "commissionAsset": "USDT",
            //            "commission": "0.00801019",
            //            "makerRebate": "0",
            //            "type": "LIMIT",
            //            "side": "BUY_OPEN",
            //            "realizedPnl": "0",
            //            "ticketId": "4900760819871364854",
            //            "isMaker": false
            //        }
            //    ]
            //
        }
        return this.parseTrades(response, market, since, limit);
    }
    /**
     * @method
     * @name toobit#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#account-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'spot', 'swap'
     * @param {string} toAccount 'spot', 'swap'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const currency = this.currency(code);
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        const fromId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toId = this.safeString(accountsByType, toAccount, toAccount);
        const request = {
            'asset': currency['id'],
            'quantity': this.currencyToPrecision(code, amount),
            'fromAccountType': fromId,
            'toAccountType': toId,
        };
        const response = await this.privatePostApiV1SubAccountTransfer(this.extend(request, params));
        //
        //    {
        //     "code": 200, // 200 = success
        //     "msg": "success" // response message
        //    }
        //
        return this.parseTransfer(response, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        //    {
        //     "code": 200, // 200 = success
        //     "msg": "success" // response message
        //    }
        //
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': undefined,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }
    /**
     * @method
     * @name toobit#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://api-docs.toobit.com/api/spot-account-and-trading.html#get-account-transaction-history-list-user-data
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#get-futures-account-transaction-history-list-user-data
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let currency = undefined;
        let request = {};
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelAllOrders', undefined, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetApiV1AccountBalanceFlow(this.extend(request, params));
        }
        else {
            response = await this.privateGetApiV1FuturesBalanceFlow(this.extend(request, params));
        }
        //
        // both answers are same format
        //
        // [
        //     {
        //         "id": "539870570957903104",
        //         "accountId": "122216245228131",
        //         "coin": "BTC",
        //         "coinId": "BTC",
        //         "coinName": "BTC",
        //         "flowTypeValue": 51,
        //         "flowType": "USER_ACCOUNT_TRANSFER",
        //         "flowName": "Transfer",
        //         "change": "-12.5",
        //         "total": "379.624059937852365",
        //         "created": "1579093587214"
        //     },
        //
        return this.parseLedger(response, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        const currencyId = this.safeString(item, 'coinId');
        currency = this.safeCurrency(currencyId, currency);
        const timestamp = this.safeInteger(item, 'created');
        const after = this.safeNumber(item, 'total');
        const amountRaw = this.safeString(item, 'change', '');
        const amount = this.parseNumber(Precise["default"].stringAbs(amountRaw));
        let direction = 'in';
        if (amountRaw.startsWith('-')) {
            direction = 'out';
        }
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString(item, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': this.parseLedgerType(this.safeString(item, 'flowType')),
            'currency': currency['code'],
            'amount': amount,
            'before': undefined,
            'after': after,
            'status': undefined,
            'fee': undefined,
        }, currency);
    }
    parseLedgerType(type) {
        const types = {
            'USER_ACCOUNT_TRANSFER': 'transfer',
            'AIRDROP': 'rebate',
        };
        return this.safeString(types, type, type);
    }
    /**
     * @method
     * @name toobit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#user-trade-fee-rate-user-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let response = undefined;
        let marketType = undefined;
        let market = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchTradingFees', undefined, params);
        if (marketType === 'spot') {
            throw new errors.NotSupported(this.id + ' fetchTradingFees(): does not support ' + marketType + ' markets');
        }
        else if (this.inArray(marketType, ['swap', 'future'])) {
            let symbol = undefined;
            [symbol, params] = this.handleParamString(params, 'symbol');
            if (symbol === undefined) {
                throw new errors.BadRequest(this.id + ' fetchTradingFees requires a params["symbol"]');
            }
            market = this.market(symbol);
            const request = {
                'symbol': market['id'],
            };
            response = await this.privateGetApiV1FuturesCommissionRate(this.extend(request, params));
        }
        //
        // {
        //     "openMakerFee": "0.000006", // The trade fee rate for opening pending orders
        //     "openTakerFee": "0.0001", // The trade fee rate for open position taker
        //     "closeMakerFee": "0.0002", // The trade fee rate for closing pending orders
        //     "closeTakerFee": "0.0004" // The trade fee rate for closing a taker order
        // }
        //
        const result = {};
        const entry = response;
        const marketId = this.safeString(entry, 'symbol');
        market = this.safeMarket(marketId, market);
        const fee = this.parseTradingFee(entry, market);
        result[market['symbol']] = fee;
        return result;
    }
    parseTradingFee(data, market = undefined) {
        const marketId = this.safeString(data, 'symbol');
        return {
            'info': data,
            'symbol': this.safeSymbol(marketId, market),
            'maker': this.safeNumber(data, 'closeMakerFee'),
            'taker': this.safeNumber(data, 'closeTakerFee'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    /**
     * @method
     * @name toobit#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api-docs.toobit.com/api/spot-wallet.html#deposit-history-user-data
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchDepositsOrWithdrawalsHelper('deposits', code, since, limit, params);
    }
    /**
     * @method
     * @name toobit#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://api-docs.toobit.com/api/spot-wallet.html#withdrawal-records-user-data
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchDepositsOrWithdrawalsHelper('withdrawals', code, since, limit, params);
    }
    async fetchDepositsOrWithdrawalsHelper(type, code, since, limit, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        let currency = undefined;
        let request = {};
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = [];
        if (type === 'deposits') {
            response = await this.privateGetApiV1AccountDepositOrders(this.extend(request, params));
            //
            // [
            //     {
            //         "time": 1499865549590,
            //         "id": 100234,
            //         "coinName": "EOS",
            //         "statusCode": "DEPOSIT_CAN_WITHDRAW",
            //         "status": "2", // 2=SUCCESS, 11=REJECT, 12=AUDIT
            //         "address": "deposit2bb",
            //         "txId": "98A3EA560C6B3336D348B6C83F0F95ECE4F1F5919E94BD006E5BF3BF264FACFC",
            //         "txIdUrl": "",
            //         "requiredConfirmTimes": "5",
            //         "confirmTimes": "5",
            //         "quantity": "1.01",
            //         "coin": "EOS",
            //         "fromAddress": "clarkkent",
            //         "fromAddressTag": "19029901"
            //         "addressTag": "19012584",
            //     }
            // ]
            //
        }
        else if (type === 'withdrawals') {
            response = await this.privateGetApiV1AccountWithdrawOrders(this.extend(request, params));
            //
            // [
            //     {
            //         "time":"1536232111669",
            //         "id ":"90161227158286336",
            //         "accountId":"517256161325920",
            //         "coinName":"BHC",
            //         "statusCode":"PROCESSING_STATUS",
            //         "status":3,
            //         "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
            //         "txId ":"",
            //         "txIdUrl ":"",
            //         "requiredConfirmTimes ":0, // Number of confirmation requests
            //         "confirmTimes ":0, // number of confirmations
            //         "quantity":"14", // Withdrawal amount
            //         "coinId ":"BHC",
            //         "addressExt":"address tag",
            //         "arriveQuantity":"14",
            //         "walletHandleTime":"1536232111669",
            //         "feeCoinId ":"BHC",
            //         "feeCoinName ":"BHC",
            //         "fee":"0.1",
            //         "kernelId":"", // Exclusive to BEAM and GRIN
            //         "isInternalTransfer": false // Whether internal transfer
            //     }
            // ]
            //
        }
        return this.parseTransactions(response, currency, since, limit, params);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits & fetchWithdrawals
        //
        //     {
        //         "time": 1499865549590,
        //         "id": 100234,
        //         "coinName": "EOS",
        //         "statusCode": "DEPOSIT_CAN_WITHDRAW",
        //         "status": "2", // 2=SUCCESS, 11=REJECT, 12=AUDIT
        //         "address": "deposit2bb",
        //         "txId": "98A3EA560C6B3336D348B6C83F0F95ECE4F1F5919E94BD006E5BF3BF264FACFC",
        //         "txIdUrl": "",
        //         "requiredConfirmTimes": "5",
        //         "confirmTimes": "5",
        //         "quantity": "1.01",
        //         "coin": "EOS",                     // present in "fetchDeposits"
        //         "coinId ":"BHC",                   // present in "fetchWithdrawals"
        //         "addressTag": "19012584",          // present in "fetchDeposits"
        //         "addressExt":"address tag",        // present in "fetchWithdrawals"
        //         "fromAddress": "clarkkent",        // present in "fetchDeposits"
        //         "fromAddressTag": "19029901"       // present in "fetchDeposits"
        //         "arriveQuantity":"14",             // present in "fetchWithdrawals"
        //         "walletHandleTime":"1536232111669",// present in "fetchWithdrawals"
        //         "feeCoinId ":"BHC",                // present in "fetchWithdrawals"
        //         "feeCoinName ":"BHC",              // present in "fetchWithdrawals"
        //         "fee":"0.1",                       // present in "fetchWithdrawals"
        //         "kernelId":"",                     // present in "fetchWithdrawals"
        //         "isInternalTransfer": false        // present in "fetchWithdrawals"
        //     }
        //
        // withdraw
        //
        //     {
        //         "status": 0,
        //         "success": true,
        //         "needBrokerAudit": false, // Do you need a brokerage review?
        //         "id": "423885103582776064",
        //         "refuseReason":"" // failure rejection reason
        //     }
        //
        const timestamp = this.safeInteger(transaction, 'time');
        const currencyId = this.safeString2(transaction, 'coin', 'coinId');
        const code = this.safeCurrencyCode(currencyId, currency);
        const feeString = this.safeString(transaction, 'fee');
        const feeCoin = this.safeString(transaction, 'feeCoinName');
        let fee = undefined;
        if (feeString !== undefined) {
            fee = {
                'cost': this.parseNumber(feeString),
                'currency': this.safeCurrencyCode(feeCoin),
            };
        }
        const tagTo = this.safeString2(transaction, 'addressTag', 'addressExt');
        const tagFrom = this.safeString(transaction, 'fromAddressTag');
        const addressTo = this.safeString(transaction, 'address');
        const addressFrom = this.safeString(transaction, 'fromAddress');
        const isWithdraw = ('arriveQuantity' in transaction);
        const type = isWithdraw ? 'withdrawal' : 'deposit';
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'id'),
            'txid': this.safeString(transaction, 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': tagTo,
            'tagFrom': tagFrom,
            'type': type,
            'amount': this.safeNumber(transaction, 'quantity'),
            'currency': code,
            'status': this.parseTransactionStatus(this.safeString(transaction, 'status')),
            'updated': undefined,
            'fee': fee,
            'comment': undefined,
            'internal': undefined,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            '2': 'pending',
            '12': 'pending',
            '11': 'failed',
            '3': 'ok',
        };
        if (status === undefined) {
            return undefined;
        }
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name toobit#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://api-docs.toobit.com/api/spot-wallet.html#deposit-address-user-data
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
        };
        const [networkCode, paramsOmitted] = this.handleNetworkCodeAndParams(this.extend(request, params));
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress() : param["network"] is required');
        }
        request['chainType'] = this.networkCodeToId(networkCode, code);
        const response = await this.privateGetApiV1AccountDepositAddress(this.extend(request, paramsOmitted));
        //
        //     {
        //         "canDeposit":false,//Is it possible to recharge
        //         "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
        //         "addressExt":"address tag",
        //         "minQuantity":"100",//minimum amount
        //         "requiredConfirmTimes ":1,//Arrival confirmation number
        //         "canWithdrawConfirmNum ":12,//Withdrawal confirmation number
        //         "coinType":"ERC20_TOKEN"
        //     }
        //
        return this.parseDepositAddress(response, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        const address = this.safeString(depositAddress, 'address');
        this.checkAddress(address);
        return {
            'info': depositAddress,
            'currency': this.safeString(currency, 'code'),
            'network': undefined,
            'address': address,
            'tag': this.safeString(depositAddress, 'addressExt'),
        };
    }
    /**
     * @method
     * @name toobit#withdraw
     * @description make a withdrawal
     * @see https://api-docs.toobit.com/api/spot-wallet.html#withdraw-user-data
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag a memo for the transaction
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.addressType] recipient identifier type, one of BLOCK_CHAIN, PHONE_NUMBER, EMAIL, or UID
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        this.checkAddress(address);
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' withdraw() : param["network"] is required');
        }
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
            'address': address,
            'quantity': this.currencyToPrecision(currency['code'], amount),
            'chainType': networkCode,
            'clientOrderId': this.milliseconds(),
        };
        if (tag !== undefined) {
            request['addressExt'] = tag;
        }
        const response = await this.privatePostApiV1AccountWithdraw(this.extend(request, params));
        //
        // {
        //     "status": 0,
        //     "success": true,
        //     "needBrokerAudit": false, // Do you need a brokerage review?
        //     "id": "423885103582776064", // Withdrawal successful order id
        //     "refuseReason":"" // failure rejection reason
        // }
        //
        return this.parseTransaction(response, currency);
    }
    /**
     * @method
     * @name toobit#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#change-margin-type-trade
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        if (market['type'] !== 'swap') {
            throw new errors.BadSymbol(this.id + ' setMarginMode() supports swap contracts only');
        }
        marginMode = marginMode.toUpperCase();
        const request = {
            'symbol': market['id'],
            'marginType': marginMode,
        };
        const response = await this.privatePostApiV1FuturesMarginType(this.extend(request, params));
        //
        // {"code":200,"symbolId":"BTC-SWAP-USDT","marginType":"ISOLATED"}
        //
        return response;
    }
    /**
     * @method
     * @name toobit#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#change-initial-leverage-trade
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        const response = await this.privatePostApiV1FuturesLeverage(this.extend(request, params));
        //
        // {"code":200,"symbolId":"BTC-SWAP-USDT","leverage":"19"}
        //
        return response;
    }
    /**
     * @method
     * @name toobit#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#get-the-leverage-multiple-and-position-mode-user-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetApiV1FuturesAccountLeverage(this.extend(request, params));
        //
        // [
        //     {
        //         "symbol":"BTC-SWAP-USDT", //symbol
        //         "leverage":"20",  // leverage
        //         "marginType":"CROSS" // CROSS;ISOLATED
        //     }
        // ]
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        const marketId = this.safeString(leverage, 'symbol');
        const leverageValue = this.safeInteger(leverage, 'leverage');
        const marginType = this.safeString(leverage, 'marginType');
        const marginMode = (marginType === 'crossed') ? 'cross' : 'isolated';
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': marginMode,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    /**
     * @method
     * @name toobit#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.toobit.com/api/usdt-m-account-and-trading.html#query-position-user-data
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets();
        }
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length > 1) {
                throw new errors.BadRequest(this.id + ' fetchPositions() only accepts an array with a single symbol or without symbols argument');
            }
            const firstSymbol = this.safeString(symbols, 0);
            if (firstSymbol !== undefined) {
                market = this.market(firstSymbol);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.privateGetApiV1FuturesPositions(this.extend(request, params));
        //
        //    [
        //        {
        //            "symbol": "DOGE-SWAP-USDT",
        //            "side": "LONG",
        //            "avgPrice": "0.21191",
        //            "position": "63",
        //            "available": "63",
        //            "leverage": "25",
        //            "lastPrice": "0.20932",
        //            "positionValue": "13.3503",
        //            "flp": "0.05471",
        //            "margin": "0.5262",
        //            "marginRate": "",
        //            "unrealizedPnL": "-0.1701",
        //            "profitRate": "-0.3185",
        //            "realizedPnL": "-0.008",
        //            "minMargin": "0",
        //            "maxNotionalValue": "10000000",
        //            "markPrice": "0.20921"
        //        }
        //    ]
        //
        return this.parsePositions(response, symbols);
    }
    parsePosition(position, market = undefined) {
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const side = this.safeStringLower(position, 'side');
        const quantity = this.safeString(position, 'position');
        const leverage = this.safeInteger(position, 'leverage');
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'id'),
            'symbol': market['symbol'],
            'entryPrice': this.safeString(position, 'avgPrice'),
            'markPrice': this.safeString(position, 'markPrice'),
            'lastPrice': this.safeString(position, 'lastPrice'),
            'notional': this.safeString(position, 'positionValue'),
            'collateral': undefined,
            'unrealizedPnl': this.safeString(position, 'unrealizedPnL'),
            'side': side,
            'contracts': this.parseNumber(quantity),
            'contractSize': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeString(position, 'margin'),
            'initialMarginPercentage': undefined,
            'leverage': leverage,
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams(path, params);
        const isPost = method === 'POST';
        const isDelete = method === 'DELETE';
        const extraQuery = {};
        const query = this.omit(params, this.extractParams(path));
        if (api !== 'private') {
            // Public endpoints
            if (!isPost) {
                if (Object.keys(query).length) {
                    url += '?' + this.urlencode(query);
                }
            }
        }
        else {
            this.checkRequiredCredentials();
            const timestamp = this.milliseconds();
            // Add timestamp to parameters for signed endpoints
            extraQuery['recvWindow'] = this.safeString(this.options, 'recvWindow', '5000');
            extraQuery['timestamp'] = timestamp.toString();
            const queryExtended = this.extend(query, extraQuery);
            let queryString = '';
            if (isPost || isDelete) {
                // everything else except Batch-Orders
                if (!Array.isArray(params)) {
                    body = this.urlencode(queryExtended);
                }
                else {
                    queryString = this.urlencode(extraQuery);
                    body = this.json(query);
                }
            }
            else {
                queryString = this.urlencode(queryExtended);
            }
            let payload = queryString;
            if (body !== undefined) {
                payload = body + payload;
            }
            const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha2_js.sha256, 'hex');
            if (queryString !== '') {
                queryString += '&signature=' + signature;
                url += '?' + queryString;
            }
            else {
                body += '&signature=' + signature;
            }
            headers = {
                'Referrer': 'CCXT',
                'X-BB-APIKEY': this.apiKey,
                'X-BB-API-PLATFORM': this.safeString(this.options, 'brokerId', '177321641268789'),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeString(response, 'code');
        const message = this.safeString(response, 'msg');
        if (errorCode && errorCode !== '200' && errorCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
}

exports["default"] = toobit;
