'use strict';

var bitget$1 = require('./abstract/bitget.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bitget extends bitget$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitget',
            'name': 'Bitget',
            'countries': ['SG'],
            'version': 'v1',
            'rateLimit': 50,
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1h',
                '4h': '4h',
                '6h': '6Hutc',
                '12h': '12Hutc',
                '1d': '1Dutc',
                '3d': '3Dutc',
                '1w': '1Wutc',
                '1M': '1Mutc',
            },
            'hostname': 'bitget.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/195989417-4253ddb0-afbe-4a1c-9dea-9dbcd121fa5d.jpg',
                'api': {
                    'spot': 'https://api.{hostname}',
                    'mix': 'https://api.{hostname}',
                    'user': 'https://api.{hostname}',
                    'p2p': 'https://api.{hostname}',
                    'broker': 'https://api.{hostname}',
                    'margin': 'https://api.{hostname}',
                },
                'www': 'https://www.bitget.com',
                'doc': [
                    'https://bitgetlimited.github.io/apidoc/en/mix',
                    'https://bitgetlimited.github.io/apidoc/en/spot',
                    'https://bitgetlimited.github.io/apidoc/en/broker',
                    'https://bitgetlimited.github.io/apidoc/en/margin',
                ],
                'fees': 'https://www.bitget.cc/zh-CN/rate?tab=1',
                'referral': 'https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j',
            },
            'api': {
                'public': {
                    'spot': {
                        'get': {
                            'public/time': 1,
                            'public/currencies': 6.6667,
                            'public/products': 1,
                            'public/product': 1,
                            'market/ticker': 1,
                            'market/tickers': 1,
                            'market/fills': 2,
                            'market/fills-history': 2,
                            'market/candles': 1,
                            'market/depth': 1,
                            'market/spot-vip-level': 2,
                        },
                    },
                    'mix': {
                        'get': {
                            'market/contracts': 1,
                            'market/depth': 1,
                            'market/ticker': 1,
                            'market/tickers': 1,
                            'market/contract-vip-level': 2,
                            'market/fills': 1,
                            'market/fills-history': 2,
                            'market/candles': 1,
                            'market/index': 1,
                            'market/funding-time': 1,
                            'market/history-fundRate': 1,
                            'market/current-fundRate': 1,
                            'market/open-interest': 1,
                            'market/mark-price': 1,
                            'market/symbol-leverage': 1,
                            'market/queryPositionLever': 1,
                        },
                    },
                    'margin': {
                        'get': {
                            'cross/public/interestRateAndLimit': 2,
                            'isolated/public/interestRateAndLimit': 2,
                            'cross/public/tierData': 2,
                            'isolated/public/tierData': 2,
                            'public/currencies': 1,
                            'cross/account/assets': 2,
                            'isolated/account/assets': 2, // 10 times/1s (IP) => 20/10 = 2
                        },
                    },
                },
                'private': {
                    'spot': {
                        'get': {
                            'wallet/deposit-address': 4,
                            'wallet/withdrawal-list': 1,
                            'wallet/deposit-list': 1,
                            'account/getInfo': 20,
                            'account/assets': 2,
                            'account/transferRecords': 1, // 20 times/1s (UID) => 20/20 = 1
                        },
                        'post': {
                            'wallet/transfer': 4,
                            'wallet/transfer-v2': 4,
                            'wallet/subTransfer': 10,
                            'wallet/withdrawal': 4,
                            'wallet/withdrawal-v2': 4,
                            'wallet/withdrawal-inner': 4,
                            'wallet/withdrawal-inner-v2': 4,
                            'account/sub-account-spot-assets': 200,
                            'account/bills': 2,
                            'trade/orders': 2,
                            'trade/batch-orders': 4,
                            'trade/cancel-order': 2,
                            'trade/cancel-order-v2': 2,
                            'trade/cancel-symbol-order': 2,
                            'trade/cancel-batch-orders': 4,
                            'trade/cancel-batch-orders-v2': 4,
                            'trade/orderInfo': 1,
                            'trade/open-orders': 1,
                            'trade/history': 1,
                            'trade/fills': 1,
                            'plan/placePlan': 1,
                            'plan/modifyPlan': 1,
                            'plan/cancelPlan': 1,
                            'plan/currentPlan': 1,
                            'plan/historyPlan': 1,
                            'plan/batchCancelPlan': 2,
                            'trace/order/orderCurrentList': 2,
                            'trace/order/orderHistoryList': 2,
                            'trace/order/closeTrackingOrder': 2,
                            'trace/order/updateTpsl': 2,
                            'trace/order/followerEndOrder': 2,
                            'trace/order/spotInfoList': 2,
                            'trace/config/getTraderSettings': 2,
                            'trace/config/getFollowerSettings': 2,
                            'trace/user/myTraders': 2,
                            'trace/config/setFollowerConfig': 2,
                            'trace/user/myFollowers': 2,
                            'trace/config/setProductCode': 2,
                            'trace/user/removeTrader': 2,
                            'trace/profit/totalProfitInfo': 2,
                            'trace/profit/totalProfitList': 2,
                            'trace/profit/profitHisList': 2,
                            'trace/profit/profitHisDetailList': 2,
                            'trace/profit/waitProfitDetailList': 2,
                            'trace/user/getTraderInfo': 2, // 10 times/1s (UID) => 20/10 = 2
                        },
                    },
                    'mix': {
                        'get': {
                            'account/account': 2,
                            'account/accounts': 2,
                            'position/singlePosition': 2,
                            'position/singlePosition-v2': 2,
                            'position/allPosition': 4,
                            'position/allPosition-v2': 4,
                            'account/accountBill': 2,
                            'account/accountBusinessBill': 4,
                            'order/current': 1,
                            'order/marginCoinCurrent': 1,
                            'order/history': 2,
                            'order/historyProductType': 4,
                            'order/detail': 2,
                            'order/fills': 2,
                            'order/allFills': 2,
                            'plan/currentPlan': 1,
                            'plan/historyPlan': 2,
                            'trace/currentTrack': 2,
                            'trace/followerOrder': 2,
                            'trace/followerHistoryOrders': 2,
                            'trace/historyTrack': 2,
                            'trace/summary': 1,
                            'trace/profitSettleTokenIdGroup': 1,
                            'trace/profitDateGroupList': 1,
                            'trade/profitDateList': 2,
                            'trace/waitProfitDateList': 1,
                            'trace/traderSymbols': 1,
                            'trace/traderList': 2,
                            'trace/traderDetail': 2,
                            'trace/queryTraceConfig': 2,
                        },
                        'post': {
                            'account/sub-account-contract-assets': 200,
                            'account/open-count': 1,
                            'account/setLeverage': 4,
                            'account/setMargin': 4,
                            'account/setMarginMode': 4,
                            'account/setPositionMode': 4,
                            'order/placeOrder': 2,
                            'order/batch-orders': 2,
                            'order/cancel-order': 2,
                            'order/cancel-batch-orders': 2,
                            'order/cancel-symbol-orders': 2,
                            'order/cancel-all-orders': 2,
                            'plan/placePlan': 2,
                            'plan/modifyPlan': 2,
                            'plan/modifyPlanPreset': 2,
                            'plan/placeTPSL': 2,
                            'plan/placeTrailStop': 2,
                            'plan/placePositionsTPSL': 2,
                            'plan/modifyTPSLPlan': 2,
                            'plan/cancelPlan': 2,
                            'plan/cancelSymbolPlan': 2,
                            'plan/cancelAllPlan': 2,
                            'trace/closeTrackOrder': 2,
                            'trace/modifyTPSL': 2,
                            'trace/setUpCopySymbols': 2,
                            'trace/followerSetBatchTraceConfig': 2,
                            'trace/followerCloseByTrackingNo': 2,
                            'trace/followerCloseByAll': 2,
                            'trace/followerSetTpsl': 2,
                            'trace/cancelCopyTrader': 4, // 5 times/1s (UID) => 20/5 = 4
                        },
                    },
                    'user': {
                        'get': {
                            'fee/query': 2,
                            'sub/virtual-list': 2,
                            'sub/virtual-api-list': 2,
                        },
                        'post': {
                            'sub/virtual-create': 4,
                            'sub/virtual-modify': 4,
                            'sub/virtual-api-batch-create': 20,
                            'sub/virtual-api-create': 4,
                            'sub/virtual-api-modify': 4,
                        },
                    },
                    'p2p': {
                        'get': {
                            'merchant/merchantList': 2,
                            'merchant/merchantInfo': 2,
                            'merchant/advList': 2,
                            'merchant/orderList': 2, // 10 times/1s (UID) => 20/10 = 2
                        },
                    },
                    'broker': {
                        'get': {
                            'account/info': 2,
                            'account/sub-list': 20,
                            'account/sub-email': 20,
                            'account/sub-spot-assets': 2,
                            'account/sub-future-assets': 2,
                            'account/sub-api-list': 2, // 10 times/1s (UID) => 20/10 = 2
                        },
                        'post': {
                            'account/sub-create': 20,
                            'account/sub-modify': 20,
                            'account/sub-modify-email': 20,
                            'account/sub-address': 2,
                            'account/sub-withdrawal': 2,
                            'account/sub-auto-transfer': 4,
                            'account/sub-api-create': 2,
                            'account/sub-api-modify': 2, // 10 times/1s (UID) => 20/10 = 2
                        },
                    },
                    'margin': {
                        'get': {
                            'cross/account/riskRate': 2,
                            'cross/account/maxTransferOutAmount': 2,
                            'isolated/account/maxTransferOutAmount': 2,
                            'isolated/order/openOrders': 2,
                            'isolated/order/history': 2,
                            'isolated/order/fills': 2,
                            'isolated/loan/list': 2,
                            'isolated/repay/list': 2,
                            'isolated/interest/list': 2,
                            'isolated/liquidation/list': 2,
                            'isolated/fin/list': 2,
                            'cross/order/openOrders': 2,
                            'cross/order/history': 2,
                            'cross/order/fills': 2,
                            'cross/loan/list': 2,
                            'cross/repay/list': 2,
                            'cross/interest/list': 2,
                            'cross/liquidation/list': 2,
                            'cross/fin/list': 2, // 10 times/1s (UID) => 20/10 = 2
                        },
                        'post': {
                            'cross/account/borrow': 2,
                            'isolated/account/borrow': 2,
                            'cross/account/repay': 2,
                            'isolated/account/repay': 2,
                            'isolated/account/riskRate': 2,
                            'cross/account/maxBorrowableAmount': 2,
                            'isolated/account/maxBorrowableAmount': 2,
                            'isolated/order/placeOrder': 4,
                            'isolated/order/batchPlaceOrder': 4,
                            'isolated/order/cancelOrder': 2,
                            'isolated/order/batchCancelOrder': 2,
                            'cross/order/placeOrder': 2,
                            'cross/order/batchPlaceOrder': 2,
                            'cross/order/cancelOrder': 2,
                            'cross/order/batchCancelOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                        },
                    },
                },
            },
            'fees': {
                'spot': {
                    'taker': this.parseNumber('0.002'),
                    'maker': this.parseNumber('0.002'),
                },
                'swap': {
                    'taker': this.parseNumber('0.0006'),
                    'maker': this.parseNumber('0.0004'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'exceptions': {
                // http error codes
                // 400 Bad Request — Invalid request format
                // 401 Unauthorized — Invalid API Key
                // 403 Forbidden — You do not have access to the requested resource
                // 404 Not Found
                // 500 Internal Server Error — We had a problem with our server
                'exact': {
                    '1': errors.ExchangeError,
                    // undocumented
                    'failure to get a peer from the ring-balancer': errors.ExchangeNotAvailable,
                    '4010': errors.PermissionDenied,
                    // common
                    // '0': ExchangeError, // 200 successful,when the order placement / cancellation / operation is successful
                    '4001': errors.ExchangeError,
                    '4002': errors.ExchangeError,
                    // --------------------------------------------------------
                    '30001': errors.AuthenticationError,
                    '30002': errors.AuthenticationError,
                    '30003': errors.AuthenticationError,
                    '30004': errors.AuthenticationError,
                    '30005': errors.InvalidNonce,
                    '30006': errors.AuthenticationError,
                    '30007': errors.BadRequest,
                    '30008': errors.RequestTimeout,
                    '30009': errors.ExchangeError,
                    '30010': errors.AuthenticationError,
                    '30011': errors.PermissionDenied,
                    '30012': errors.AuthenticationError,
                    '30013': errors.AuthenticationError,
                    '30014': errors.DDoSProtection,
                    '30015': errors.AuthenticationError,
                    '30016': errors.ExchangeError,
                    '30017': errors.ExchangeError,
                    '30018': errors.ExchangeError,
                    '30019': errors.ExchangeNotAvailable,
                    '30020': errors.BadRequest,
                    '30021': errors.BadRequest,
                    '30022': errors.PermissionDenied,
                    '30023': errors.BadRequest,
                    '30024': errors.BadSymbol,
                    '30025': errors.BadRequest,
                    '30026': errors.DDoSProtection,
                    '30027': errors.AuthenticationError,
                    '30028': errors.PermissionDenied,
                    '30029': errors.AccountSuspended,
                    '30030': errors.ExchangeError,
                    '30031': errors.BadRequest,
                    '30032': errors.BadSymbol,
                    '30033': errors.BadRequest,
                    '30034': errors.ExchangeError,
                    '30035': errors.ExchangeError,
                    '30036': errors.ExchangeError,
                    '30037': errors.ExchangeNotAvailable,
                    // '30038': AuthenticationError, // { "code": 30038, "message": "user does not exist" }
                    '30038': errors.OnMaintenance,
                    // futures
                    '32001': errors.AccountSuspended,
                    '32002': errors.PermissionDenied,
                    '32003': errors.CancelPending,
                    '32004': errors.ExchangeError,
                    '32005': errors.InvalidOrder,
                    '32006': errors.InvalidOrder,
                    '32007': errors.InvalidOrder,
                    '32008': errors.InvalidOrder,
                    '32009': errors.InvalidOrder,
                    '32010': errors.ExchangeError,
                    '32011': errors.ExchangeError,
                    '32012': errors.ExchangeError,
                    '32013': errors.ExchangeError,
                    '32014': errors.ExchangeError,
                    '32015': errors.ExchangeError,
                    '32016': errors.ExchangeError,
                    '32017': errors.ExchangeError,
                    '32018': errors.ExchangeError,
                    '32019': errors.ExchangeError,
                    '32020': errors.ExchangeError,
                    '32021': errors.ExchangeError,
                    '32022': errors.ExchangeError,
                    '32023': errors.ExchangeError,
                    '32024': errors.ExchangeError,
                    '32025': errors.ExchangeError,
                    '32026': errors.ExchangeError,
                    '32027': errors.ExchangeError,
                    '32028': errors.AccountSuspended,
                    '32029': errors.ExchangeError,
                    '32030': errors.InvalidOrder,
                    '32031': errors.ArgumentsRequired,
                    '32038': errors.AuthenticationError,
                    '32040': errors.ExchangeError,
                    '32044': errors.ExchangeError,
                    '32045': errors.ExchangeError,
                    '32046': errors.ExchangeError,
                    '32047': errors.ExchangeError,
                    '32048': errors.InvalidOrder,
                    '32049': errors.ExchangeError,
                    '32050': errors.InvalidOrder,
                    '32051': errors.InvalidOrder,
                    '32052': errors.ExchangeError,
                    '32053': errors.ExchangeError,
                    '32057': errors.ExchangeError,
                    '32054': errors.ExchangeError,
                    '32055': errors.InvalidOrder,
                    '32056': errors.ExchangeError,
                    '32058': errors.ExchangeError,
                    '32059': errors.InvalidOrder,
                    '32060': errors.InvalidOrder,
                    '32061': errors.InvalidOrder,
                    '32062': errors.InvalidOrder,
                    '32063': errors.InvalidOrder,
                    '32064': errors.ExchangeError,
                    '32065': errors.ExchangeError,
                    '32066': errors.ExchangeError,
                    '32067': errors.ExchangeError,
                    '32068': errors.ExchangeError,
                    '32069': errors.ExchangeError,
                    '32070': errors.ExchangeError,
                    '32071': errors.ExchangeError,
                    '32072': errors.ExchangeError,
                    '32073': errors.ExchangeError,
                    '32074': errors.ExchangeError,
                    '32075': errors.ExchangeError,
                    '32076': errors.ExchangeError,
                    '32077': errors.ExchangeError,
                    '32078': errors.ExchangeError,
                    '32079': errors.ExchangeError,
                    '32080': errors.ExchangeError,
                    '32083': errors.ExchangeError,
                    // token and margin trading
                    '33001': errors.PermissionDenied,
                    '33002': errors.AccountSuspended,
                    '33003': errors.InsufficientFunds,
                    '33004': errors.ExchangeError,
                    '33005': errors.ExchangeError,
                    '33006': errors.ExchangeError,
                    '33007': errors.ExchangeError,
                    '33008': errors.InsufficientFunds,
                    '33009': errors.ExchangeError,
                    '33010': errors.ExchangeError,
                    '33011': errors.ExchangeError,
                    '33012': errors.ExchangeError,
                    '33013': errors.InvalidOrder,
                    '33014': errors.OrderNotFound,
                    '33015': errors.InvalidOrder,
                    '33016': errors.ExchangeError,
                    '33017': errors.InsufficientFunds,
                    '33018': errors.ExchangeError,
                    '33020': errors.ExchangeError,
                    '33021': errors.BadRequest,
                    '33022': errors.InvalidOrder,
                    '33023': errors.ExchangeError,
                    '33024': errors.InvalidOrder,
                    '33025': errors.InvalidOrder,
                    '33026': errors.ExchangeError,
                    '33027': errors.InvalidOrder,
                    '33028': errors.InvalidOrder,
                    '33029': errors.InvalidOrder,
                    '33034': errors.ExchangeError,
                    '33035': errors.ExchangeError,
                    '33036': errors.ExchangeError,
                    '33037': errors.ExchangeError,
                    '33038': errors.ExchangeError,
                    '33039': errors.ExchangeError,
                    '33040': errors.ExchangeError,
                    '33041': errors.ExchangeError,
                    '33042': errors.ExchangeError,
                    '33043': errors.ExchangeError,
                    '33044': errors.ExchangeError,
                    '33045': errors.ExchangeError,
                    '33046': errors.ExchangeError,
                    '33047': errors.ExchangeError,
                    '33048': errors.ExchangeError,
                    '33049': errors.ExchangeError,
                    '33050': errors.ExchangeError,
                    '33051': errors.ExchangeError,
                    '33059': errors.BadRequest,
                    '33060': errors.BadRequest,
                    '33061': errors.ExchangeError,
                    '33062': errors.ExchangeError,
                    '33063': errors.ExchangeError,
                    '33064': errors.ExchangeError,
                    '33065': errors.ExchangeError,
                    // account
                    '21009': errors.ExchangeError,
                    '34001': errors.PermissionDenied,
                    '34002': errors.InvalidAddress,
                    '34003': errors.ExchangeError,
                    '34004': errors.ExchangeError,
                    '34005': errors.ExchangeError,
                    '34006': errors.ExchangeError,
                    '34007': errors.ExchangeError,
                    '34008': errors.InsufficientFunds,
                    '34009': errors.ExchangeError,
                    '34010': errors.ExchangeError,
                    '34011': errors.ExchangeError,
                    '34012': errors.ExchangeError,
                    '34013': errors.ExchangeError,
                    '34014': errors.ExchangeError,
                    '34015': errors.ExchangeError,
                    '34016': errors.PermissionDenied,
                    '34017': errors.AccountSuspended,
                    '34018': errors.AuthenticationError,
                    '34019': errors.PermissionDenied,
                    '34020': errors.PermissionDenied,
                    '34021': errors.InvalidAddress,
                    '34022': errors.ExchangeError,
                    '34023': errors.PermissionDenied,
                    '34026': errors.ExchangeError,
                    '34036': errors.ExchangeError,
                    '34037': errors.ExchangeError,
                    '34038': errors.ExchangeError,
                    '34039': errors.ExchangeError,
                    // swap
                    '35001': errors.ExchangeError,
                    '35002': errors.ExchangeError,
                    '35003': errors.ExchangeError,
                    '35004': errors.ExchangeError,
                    '35005': errors.AuthenticationError,
                    '35008': errors.InvalidOrder,
                    '35010': errors.InvalidOrder,
                    '35012': errors.InvalidOrder,
                    '35014': errors.InvalidOrder,
                    '35015': errors.InvalidOrder,
                    '35017': errors.ExchangeError,
                    '35019': errors.InvalidOrder,
                    '35020': errors.InvalidOrder,
                    '35021': errors.InvalidOrder,
                    '35022': errors.ExchangeError,
                    '35024': errors.ExchangeError,
                    '35025': errors.InsufficientFunds,
                    '35026': errors.ExchangeError,
                    '35029': errors.OrderNotFound,
                    '35030': errors.InvalidOrder,
                    '35031': errors.InvalidOrder,
                    '35032': errors.ExchangeError,
                    '35037': errors.ExchangeError,
                    '35039': errors.ExchangeError,
                    '35040': errors.InvalidOrder,
                    '35044': errors.ExchangeError,
                    '35046': errors.InsufficientFunds,
                    '35047': errors.InsufficientFunds,
                    '35048': errors.ExchangeError,
                    '35049': errors.InvalidOrder,
                    '35050': errors.InvalidOrder,
                    '35052': errors.InsufficientFunds,
                    '35053': errors.ExchangeError,
                    '35055': errors.InsufficientFunds,
                    '35057': errors.ExchangeError,
                    '35058': errors.ExchangeError,
                    '35059': errors.BadRequest,
                    '35060': errors.BadRequest,
                    '35061': errors.BadRequest,
                    '35062': errors.InvalidOrder,
                    '35063': errors.InvalidOrder,
                    '35064': errors.InvalidOrder,
                    '35066': errors.InvalidOrder,
                    '35067': errors.InvalidOrder,
                    '35068': errors.InvalidOrder,
                    '35069': errors.InvalidOrder,
                    '35070': errors.InvalidOrder,
                    '35071': errors.InvalidOrder,
                    '35072': errors.InvalidOrder,
                    '35073': errors.InvalidOrder,
                    '35074': errors.InvalidOrder,
                    '35075': errors.InvalidOrder,
                    '35076': errors.InvalidOrder,
                    '35077': errors.InvalidOrder,
                    '35078': errors.InvalidOrder,
                    '35079': errors.InvalidOrder,
                    '35080': errors.InvalidOrder,
                    '35081': errors.InvalidOrder,
                    '35082': errors.InvalidOrder,
                    '35083': errors.InvalidOrder,
                    '35084': errors.InvalidOrder,
                    '35085': errors.InvalidOrder,
                    '35086': errors.InvalidOrder,
                    '35087': errors.InvalidOrder,
                    '35088': errors.InvalidOrder,
                    '35089': errors.InvalidOrder,
                    '35090': errors.ExchangeError,
                    '35091': errors.ExchangeError,
                    '35092': errors.ExchangeError,
                    '35093': errors.ExchangeError,
                    '35094': errors.ExchangeError,
                    '35095': errors.BadRequest,
                    '35096': errors.ExchangeError,
                    '35097': errors.ExchangeError,
                    '35098': errors.ExchangeError,
                    '35099': errors.ExchangeError,
                    // option
                    '36001': errors.BadRequest,
                    '36002': errors.BadRequest,
                    '36005': errors.ExchangeError,
                    '36101': errors.AuthenticationError,
                    '36102': errors.PermissionDenied,
                    '36103': errors.AccountSuspended,
                    '36104': errors.PermissionDenied,
                    '36105': errors.PermissionDenied,
                    '36106': errors.AccountSuspended,
                    '36107': errors.PermissionDenied,
                    '36108': errors.InsufficientFunds,
                    '36109': errors.PermissionDenied,
                    '36201': errors.PermissionDenied,
                    '36202': errors.PermissionDenied,
                    '36203': errors.InvalidOrder,
                    '36204': errors.ExchangeError,
                    '36205': errors.BadRequest,
                    '36206': errors.BadRequest,
                    '36207': errors.InvalidOrder,
                    '36208': errors.InvalidOrder,
                    '36209': errors.InvalidOrder,
                    '36210': errors.InvalidOrder,
                    '36211': errors.InvalidOrder,
                    '36212': errors.InvalidOrder,
                    '36213': errors.InvalidOrder,
                    '36214': errors.ExchangeError,
                    '36216': errors.OrderNotFound,
                    '36217': errors.InvalidOrder,
                    '36218': errors.InvalidOrder,
                    '36219': errors.InvalidOrder,
                    '36220': errors.InvalidOrder,
                    '36221': errors.InvalidOrder,
                    '36222': errors.InvalidOrder,
                    '36223': errors.InvalidOrder,
                    '36224': errors.InvalidOrder,
                    '36225': errors.InvalidOrder,
                    '36226': errors.InvalidOrder,
                    '36227': errors.InvalidOrder,
                    '36228': errors.InvalidOrder,
                    '36229': errors.InvalidOrder,
                    '36230': errors.InvalidOrder,
                    // --------------------------------------------------------
                    // swap
                    '400': errors.BadRequest,
                    '401': errors.AuthenticationError,
                    '403': errors.PermissionDenied,
                    '404': errors.BadRequest,
                    '405': errors.BadRequest,
                    '415': errors.BadRequest,
                    '429': errors.DDoSProtection,
                    '500': errors.ExchangeNotAvailable,
                    '1001': errors.RateLimitExceeded,
                    '1002': errors.ExchangeError,
                    '1003': errors.ExchangeError,
                    // '00000': ExchangeError, // success
                    '40001': errors.AuthenticationError,
                    '40002': errors.AuthenticationError,
                    '40003': errors.AuthenticationError,
                    '40004': errors.InvalidNonce,
                    '40005': errors.InvalidNonce,
                    '40006': errors.AuthenticationError,
                    '40007': errors.BadRequest,
                    '40008': errors.InvalidNonce,
                    '40009': errors.AuthenticationError,
                    '40010': errors.AuthenticationError,
                    '40011': errors.AuthenticationError,
                    '40012': errors.AuthenticationError,
                    '40013': errors.ExchangeError,
                    '40014': errors.PermissionDenied,
                    '40015': errors.ExchangeError,
                    '40016': errors.PermissionDenied,
                    '40017': errors.ExchangeError,
                    '40018': errors.PermissionDenied,
                    '40019': errors.BadRequest,
                    '40102': errors.BadRequest,
                    '40103': errors.BadRequest,
                    '40104': errors.ExchangeError,
                    '40105': errors.ExchangeError,
                    '40106': errors.ExchangeError,
                    '40107': errors.ExchangeError,
                    '40108': errors.InvalidOrder,
                    '40109': errors.OrderNotFound,
                    '40200': errors.OnMaintenance,
                    '40201': errors.InvalidOrder,
                    '40202': errors.ExchangeError,
                    '40203': errors.BadRequest,
                    '40204': errors.BadRequest,
                    '40205': errors.BadRequest,
                    '40206': errors.BadRequest,
                    '40207': errors.BadRequest,
                    '40208': errors.BadRequest,
                    '40209': errors.BadRequest,
                    '40300': errors.ExchangeError,
                    '40301': errors.PermissionDenied,
                    '40302': errors.BadRequest,
                    '40303': errors.BadRequest,
                    '40304': errors.BadRequest,
                    '40305': errors.BadRequest,
                    '40306': errors.ExchangeError,
                    '40308': errors.OnMaintenance,
                    '40309': errors.BadSymbol,
                    '40400': errors.ExchangeError,
                    '40401': errors.ExchangeError,
                    '40402': errors.BadRequest,
                    '40403': errors.BadRequest,
                    '40404': errors.BadRequest,
                    '40405': errors.BadRequest,
                    '40406': errors.BadRequest,
                    '40407': errors.ExchangeError,
                    '40408': errors.ExchangeError,
                    '40409': errors.ExchangeError,
                    '40500': errors.InvalidOrder,
                    '40501': errors.ExchangeError,
                    '40502': errors.ExchangeError,
                    '40503': errors.ExchangeError,
                    '40504': errors.ExchangeError,
                    '40505': errors.ExchangeError,
                    '40506': errors.AuthenticationError,
                    '40507': errors.AuthenticationError,
                    '40508': errors.ExchangeError,
                    '40509': errors.ExchangeError,
                    '40600': errors.ExchangeError,
                    '40601': errors.ExchangeError,
                    '40602': errors.ExchangeError,
                    '40603': errors.ExchangeError,
                    '40604': errors.ExchangeNotAvailable,
                    '40605': errors.ExchangeError,
                    '40606': errors.ExchangeError,
                    '40607': errors.ExchangeError,
                    '40608': errors.ExchangeError,
                    '40609': errors.ExchangeError,
                    '40700': errors.BadRequest,
                    '40701': errors.ExchangeError,
                    '40702': errors.ExchangeError,
                    '40703': errors.ExchangeError,
                    '40704': errors.ExchangeError,
                    '40705': errors.BadRequest,
                    '40706': errors.InvalidOrder,
                    '40707': errors.BadRequest,
                    '40708': errors.BadRequest,
                    '40709': errors.ExchangeError,
                    '40710': errors.ExchangeError,
                    '40711': errors.InsufficientFunds,
                    '40712': errors.InsufficientFunds,
                    '40713': errors.ExchangeError,
                    '40714': errors.ExchangeError,
                    '41114': errors.OnMaintenance,
                    '43011': errors.InvalidOrder,
                    '43025': errors.InvalidOrder,
                    '45110': errors.InvalidOrder,
                    // spot
                    'invalid sign': errors.AuthenticationError,
                    'invalid currency': errors.BadSymbol,
                    'invalid symbol': errors.BadSymbol,
                    'invalid period': errors.BadRequest,
                    'invalid user': errors.ExchangeError,
                    'invalid amount': errors.InvalidOrder,
                    'invalid type': errors.InvalidOrder,
                    'invalid orderId': errors.InvalidOrder,
                    'invalid record': errors.ExchangeError,
                    'invalid accountId': errors.BadRequest,
                    'invalid address': errors.BadRequest,
                    'accesskey not null': errors.AuthenticationError,
                    'illegal accesskey': errors.AuthenticationError,
                    'sign not null': errors.AuthenticationError,
                    'req_time is too much difference from server time': errors.InvalidNonce,
                    'permissions not right': errors.PermissionDenied,
                    'illegal sign invalid': errors.AuthenticationError,
                    'user locked': errors.AccountSuspended,
                    'Request Frequency Is Too High': errors.RateLimitExceeded,
                    'more than a daily rate of cash': errors.BadRequest,
                    'more than the maximum daily withdrawal amount': errors.BadRequest,
                    'need to bind email or mobile': errors.ExchangeError,
                    'user forbid': errors.PermissionDenied,
                    'User Prohibited Cash Withdrawal': errors.PermissionDenied,
                    'Cash Withdrawal Is Less Than The Minimum Value': errors.BadRequest,
                    'Cash Withdrawal Is More Than The Maximum Value': errors.BadRequest,
                    'the account with in 24 hours ban coin': errors.PermissionDenied,
                    'order cancel fail': errors.BadRequest,
                    'base symbol error': errors.BadSymbol,
                    'base date error': errors.ExchangeError,
                    'api signature not valid': errors.AuthenticationError,
                    'gateway internal error': errors.ExchangeError,
                    'audit failed': errors.ExchangeError,
                    'order queryorder invalid': errors.BadRequest,
                    'market no need price': errors.InvalidOrder,
                    'limit need price': errors.InvalidOrder,
                    'userid not equal to account_id': errors.ExchangeError,
                    'your balance is low': errors.InsufficientFunds,
                    'address invalid cointype': errors.ExchangeError,
                    'system exception': errors.ExchangeError,
                    '50003': errors.ExchangeError,
                    '50004': errors.BadSymbol,
                    '50006': errors.PermissionDenied,
                    '50007': errors.PermissionDenied,
                    '50008': errors.RequestTimeout,
                    '50009': errors.RateLimitExceeded,
                    '50010': errors.ExchangeError,
                    '50014': errors.InvalidOrder,
                    '50015': errors.InvalidOrder,
                    '50016': errors.InvalidOrder,
                    '50017': errors.InvalidOrder,
                    '50018': errors.InvalidOrder,
                    '50019': errors.InvalidOrder,
                    '50020': errors.InsufficientFunds,
                    '50021': errors.InvalidOrder,
                    '50026': errors.InvalidOrder,
                    'invalid order query time': errors.ExchangeError,
                    'invalid start time': errors.BadRequest,
                    'invalid end time': errors.BadRequest,
                    '20003': errors.ExchangeError,
                    '01001': errors.ExchangeError,
                    '43111': errors.PermissionDenied, // {"code":"43111","msg":"参数错误 address not in address book","requestTime":1665394201164,"data":null}
                },
                'broad': {
                    'invalid size, valid range': errors.ExchangeError,
                },
            },
            'precisionMode': number.TICK_SIZE,
            'commonCurrencies': {
                'JADE': 'Jade Protocol',
            },
            'options': {
                'timeframes': {
                    'spot': {
                        '1m': '1min',
                        '5m': '5min',
                        '15m': '15min',
                        '30m': '30min',
                        '1h': '1h',
                        '4h': '4h',
                        '6h': '6Hutc',
                        '12h': '12Hutc',
                        '1d': '1Dutc',
                        '3d': '3Dutc',
                        '1w': '1Wutc',
                        '1M': '1Mutc',
                    },
                    'swap': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1H',
                        '2h': '2H',
                        '4h': '4H',
                        '6h': '6Hutc',
                        '12h': '12Hutc',
                        '1d': '1Dutc',
                        '3d': '3Dutc',
                        '1w': '1Wutc',
                        '1M': '1Mutc',
                    },
                },
                'fetchMarkets': [
                    'spot',
                    'swap',
                ],
                'defaultType': 'spot',
                'defaultSubType': 'linear',
                'createMarketBuyOrderRequiresPrice': true,
                'broker': 'p4sve',
                'withdraw': {
                    'fillResponseFromRequest': true,
                },
                'accountsByType': {
                    'main': 'EXCHANGE',
                    'spot': 'EXCHANGE',
                    'future': 'USDT_MIX',
                    'contract': 'CONTRACT',
                    'mix': 'USD_MIX',
                },
                'accountsById': {
                    'EXCHANGE': 'spot',
                    'USDT_MIX': 'future',
                    'CONTRACT': 'swap',
                    'USD_MIX': 'swap',
                },
                'sandboxMode': false,
                'networks': {
                    'TRX': 'TRC20',
                    'ETH': 'ERC20',
                    'BSC': 'BEP20',
                },
                'networksById': {
                    'TRC20': 'TRX',
                    'BSC': 'BEP20',
                },
            },
        });
    }
    setSandboxMode(enabled) {
        this.options['sandboxMode'] = enabled;
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name bitget#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicSpotGetPublicTime(params);
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645837773501,
        //       data: '1645837773501'
        //     }
        //
        return this.safeInteger(response, 'data');
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name bitget#fetchMarkets
         * @description retrieves data on all markets for bitget
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const sandboxMode = this.safeValue(this.options, 'sandboxMode', false);
        let types = this.safeValue(this.options, 'fetchMarkets', ['spot', 'swap']);
        if (sandboxMode) {
            types = ['swap'];
        }
        let promises = [];
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if (type === 'swap') {
                let subTypes = undefined;
                if (sandboxMode) {
                    // the following are simulated trading markets [ 'sumcbl', 'sdmcbl', 'scmcbl' ];
                    subTypes = ['sumcbl', 'sdmcbl', 'scmcbl'];
                }
                else {
                    subTypes = ['umcbl', 'dmcbl', 'cmcbl'];
                }
                for (let j = 0; j < subTypes.length; j++) {
                    promises.push(this.fetchMarketsByType(type, this.extend(params, {
                        'productType': subTypes[j],
                    })));
                }
            }
            else {
                promises.push(this.fetchMarketsByType(types[i], params));
            }
        }
        promises = await Promise.all(promises);
        let result = promises[0];
        for (let i = 1; i < promises.length; i++) {
            result = this.arrayConcat(result, promises[i]);
        }
        return result;
    }
    parseMarkets(markets) {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push(this.parseMarket(markets[i]));
        }
        return result;
    }
    parseMarket(market) {
        //
        // spot
        //
        //    {
        //        symbol: 'ALPHAUSDT_SPBL',
        //        symbolName: 'ALPHAUSDT',
        //        baseCoin: 'ALPHA',
        //        quoteCoin: 'USDT',
        //        minTradeAmount: '2',
        //        maxTradeAmount: '0',
        //        minTradeUSDT": '5',
        //        takerFeeRate: '0.001',
        //        makerFeeRate: '0.001',
        //        priceScale: '4',
        //        quantityScale: '4',
        //        status: 'online'
        //    }
        //
        // swap
        //
        //    {
        //        symbol: 'BTCUSDT_UMCBL',
        //        makerFeeRate: '0.0002',
        //        takerFeeRate: '0.0006',
        //        feeRateUpRatio: '0.005',
        //        openCostUpRatio: '0.01',
        //        quoteCoin: 'USDT',
        //        baseCoin: 'BTC',
        //        buyLimitPriceRatio: '0.01',
        //        sellLimitPriceRatio: '0.01',
        //        supportMarginCoins: [ 'USDT' ],
        //        minTradeNum: '0.001',
        //        priceEndStep: '5',
        //        volumePlace: '3',
        //        pricePlace: '1',
        //        symbolStatus: "normal",
        //        offTime: "-1",
        //        limitOpenTime: "-1"
        //    }
        //
        const marketId = this.safeString(market, 'symbol');
        const quoteId = this.safeString(market, 'quoteCoin');
        const baseId = this.safeString(market, 'baseCoin');
        const quote = this.safeCurrencyCode(quoteId);
        const base = this.safeCurrencyCode(baseId);
        const supportMarginCoins = this.safeValue(market, 'supportMarginCoins', []);
        const settleId = this.safeString(supportMarginCoins, 0);
        const settle = this.safeCurrencyCode(settleId);
        let symbol = base + '/' + quote;
        const parts = marketId.split('_');
        const typeId = this.safeString(parts, 1);
        let type = undefined;
        let swap = false;
        let spot = false;
        let future = false;
        let contract = false;
        let pricePrecision = undefined;
        let amountPrecision = undefined;
        let linear = undefined;
        let inverse = undefined;
        let expiry = undefined;
        let expiryDatetime = undefined;
        if (typeId === 'SPBL') {
            type = 'spot';
            spot = true;
            pricePrecision = this.parseNumber(this.parsePrecision(this.safeString(market, 'priceScale')));
            amountPrecision = this.parseNumber(this.parsePrecision(this.safeString(market, 'quantityScale')));
        }
        else {
            const expiryString = this.safeString(parts, 2);
            if (expiryString !== undefined) {
                const year = '20' + expiryString.slice(0, 2);
                const month = expiryString.slice(2, 4);
                const day = expiryString.slice(4, 6);
                expiryDatetime = year + '-' + month + '-' + day + 'T00:00:00.000Z';
                expiry = this.parse8601(expiryDatetime);
                type = 'future';
                future = true;
                symbol = symbol + ':' + settle + '-' + expiryString;
            }
            else {
                type = 'swap';
                swap = true;
                symbol = symbol + ':' + settle;
            }
            contract = true;
            linear = (typeId === 'UMCBL') || (typeId === 'CMCBL') || (typeId === 'SUMCBL') || (typeId === 'SCMCBL');
            inverse = !linear;
            const priceDecimals = this.safeInteger(market, 'pricePlace');
            const amountDecimals = this.safeInteger(market, 'volumePlace');
            const priceStep = this.safeString(market, 'priceEndStep');
            const amountStep = this.safeString(market, 'minTradeNum');
            const precisePrice = new Precise["default"](priceStep);
            precisePrice.decimals = Math.max(precisePrice.decimals, priceDecimals);
            precisePrice.reduce();
            const priceString = precisePrice.toString();
            pricePrecision = this.parseNumber(priceString);
            const preciseAmount = new Precise["default"](amountStep);
            preciseAmount.decimals = Math.max(preciseAmount.decimals, amountDecimals);
            preciseAmount.reduce();
            const amountString = preciseAmount.toString();
            amountPrecision = this.parseNumber(amountString);
        }
        const status = this.safeString2(market, 'status', 'symbolStatus');
        let active = undefined;
        if (status !== undefined) {
            active = (status === 'online' || status === 'normal');
        }
        let minCost = undefined;
        if (quote === 'USDT') {
            minCost = this.safeNumber(market, 'minTradeUSDT');
        }
        const contractSize = contract ? 1 : undefined;
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'margin': false,
            'swap': swap,
            'future': future,
            'option': false,
            'active': active,
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'taker': this.safeNumber(market, 'takerFeeRate'),
            'maker': this.safeNumber(market, 'makerFeeRate'),
            'contractSize': contractSize,
            'expiry': expiry,
            'expiryDatetime': expiryDatetime,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber2(market, 'minTradeNum', 'minTradeAmount'),
                    'max': this.safeNumber(market, 'maxTradeAmount'),
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
            'info': market,
        };
    }
    async fetchMarketsByType(type, params = {}) {
        const method = this.getSupportedMapping(type, {
            'spot': 'publicSpotGetPublicProducts',
            'swap': 'publicMixGetMarketContracts',
        });
        const response = await this[method](params);
        //
        // spot
        //
        //    {
        //        code: '00000',
        //        msg: 'success',
        //        requestTime: 1645840064031,
        //        data: [
        //            {
        //                symbol: 'ALPHAUSDT_SPBL',
        //                symbolName: 'ALPHAUSDT',
        //                baseCoin: 'ALPHA',
        //                quoteCoin: 'USDT',
        //                minTradeAmount: '2',
        //                maxTradeAmount: '0',
        //                takerFeeRate: '0.001',
        //                makerFeeRate: '0.001',
        //                priceScale: '4',
        //                quantityScale: '4',
        //                status: 'online'
        //            }
        //        ]
        //    }
        //
        // swap
        //
        //    {
        //        code: '00000',
        //        msg: 'success',
        //        requestTime: 1645840821493,
        //        data: [
        //            {
        //                symbol: 'BTCUSDT_UMCBL',
        //                makerFeeRate: '0.0002',
        //                takerFeeRate: '0.0006',
        //                feeRateUpRatio: '0.005',
        //                openCostUpRatio: '0.01',
        //                quoteCoin: 'USDT',
        //                baseCoin: 'BTC',
        //                buyLimitPriceRatio: '0.01',
        //                sellLimitPriceRatio: '0.01',
        //                supportMarginCoins: [Array],
        //                minTradeNum: '0.001',
        //                priceEndStep: '5',
        //                volumePlace: '3',
        //                pricePlace: '1'
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseMarkets(data);
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name bitget#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicSpotGetPublicCurrencies(params);
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645935668288,
        //       data: [
        //         {
        //           coinId: '230',
        //           coinName: 'KIN',
        //           transfer: 'false',
        //           chains: [
        //             {
        //               chain: 'SOL',
        //               needTag: 'false',
        //               withdrawable: 'true',
        //               rechargeable: 'true',
        //               withdrawFee: '187500',
        //               depositConfirm: '100',
        //               withdrawConfirm: '100',
        //               minDepositAmount: '12500',
        //               minWithdrawAmount: '250000',
        //               browserUrl: 'https://explorer.solana.com/tx/'
        //             }
        //           ]
        //         }
        //       ]
        //     }
        //
        const result = {};
        const data = this.safeValue(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString(entry, 'coinId');
            const code = this.safeCurrencyCode(this.safeString(entry, 'coinName'));
            const chains = this.safeValue(entry, 'chains', []);
            const networks = {};
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString(chain, 'chain');
                const network = this.safeCurrencyCode(networkId);
                const withdrawEnabled = this.safeString(chain, 'withdrawable');
                const depositEnabled = this.safeString(chain, 'rechargeable');
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber(chain, 'minWithdrawAmount'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber(chain, 'minDepositAmount'),
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'withdraw': withdrawEnabled === 'true',
                    'deposit': depositEnabled === 'true',
                    'fee': this.safeNumber(chain, 'withdrawFee'),
                    'precision': undefined,
                };
            }
            result[code] = {
                'info': entry,
                'id': id,
                'code': code,
                'networks': networks,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }
    async fetchMarketLeverageTiers(symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchMarketLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-position-tier
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        market = this.market(symbol);
        if (market['spot']) {
            throw new errors.BadRequest(this.id + ' fetchMarketLeverageTiers() symbol does not support market ' + symbol);
        }
        request['symbol'] = market['id'];
        request['productType'] = 'UMCBL';
        const response = await this.publicMixGetMarketQueryPositionLever(this.extend(request, params));
        //
        //     {
        //         "code":"00000",
        //         "data":[
        //             {
        //                 "level": 1,
        //                 "startUnit": 0,
        //                 "endUnit": 150000,
        //                 "leverage": 125,
        //                 "keepMarginRate": "0.004"
        //             }
        //         ],
        //         "msg":"success",
        //         "requestTime":1627292076687
        //     }
        //
        const result = this.safeValue(response, 'data');
        return this.parseMarketLeverageTiers(result, market);
    }
    parseMarketLeverageTiers(info, market = undefined) {
        //
        //     [
        //         {
        //             "level": 1,
        //             "startUnit": 0,
        //             "endUnit": 150000,
        //             "leverage": 125,
        //             "keepMarginRate": "0.004"
        //         }
        //     ],
        //
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            const minNotional = this.safeNumber(item, 'startUnit');
            const maxNotional = this.safeNumber(item, 'endUnit');
            tiers.push({
                'tier': this.sum(i, 1),
                'currency': market['base'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeNumber(item, 'keepMarginRate'),
                'maxLeverage': this.safeNumber(item, 'leverage'),
                'info': item,
            });
        }
        return tiers;
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-deposit-list
         * @param {string|undefined} code unified currency code
         * @param {int} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {string|undefined} params.pageNo pageNo default 1
         * @param {string|undefined} params.pageSize pageSize default 20. Max 100
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDeposits() requires a `code` argument');
        }
        const currency = this.currency(code);
        if (since === undefined) {
            since = this.milliseconds() - 31556952000; // 1yr
        }
        const request = {
            'coin': currency['code'],
            'startTime': since,
            'endTime': this.milliseconds(),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateSpotGetWalletDepositList(this.extend(request, params));
        //
        //      {
        //          "code": "00000",
        //          "msg": "success",
        //          "requestTime": 0,
        //          "data": [{
        //              "id": "925607360021839872",
        //              "txId": "f73a4ac034da06b729f49676ca8801f406a093cf90c69b16e5a1cc9080df4ccb",
        //              "coin": "USDT",
        //              "type": "deposit",
        //              "amount": "19.44800000",
        //              "status": "success",
        //              "toAddress": "TRo4JMfZ1XYHUgnLsUMfDEf8MWzcWaf8uh",
        //              "fee": null,
        //              "chain": "TRC20",
        //              "confirm": null,
        //              "cTime": "1656407912259",
        //              "uTime": "1656407940148"
        //          }]
        //      }
        //
        const rawTransactions = this.safeValue(response, 'data', []);
        return this.parseTransactions(rawTransactions, currency, since, limit);
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitget#withdraw
         * @description make a withdrawal
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#withdraw-v2
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {string} params.chain the chain to withdraw to
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        this.checkAddress(address);
        const chain = this.safeString2(params, 'chain', 'network');
        params = this.omit(params, ['network']);
        if (chain === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' withdraw() requires a chain parameter');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const networkId = this.networkCodeToId(chain);
        const request = {
            'coin': currency['code'],
            'address': address,
            'chain': networkId,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privateSpotPostWalletWithdrawalV2(this.extend(request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "data": "888291686266343424"
        //     }
        //
        const result = {
            'id': this.safeString(response, 'data'),
            'info': response,
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': 'withdrawal',
            'currency': undefined,
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
        };
        const withdrawOptions = this.safeValue(this.options, 'withdraw', {});
        const fillResponseFromRequest = this.safeValue(withdrawOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            result['currency'] = code;
            result['timestamp'] = this.milliseconds();
            result['datetime'] = this.iso8601(this.milliseconds());
            result['amount'] = amount;
            result['tag'] = tag;
            result['address'] = address;
            result['addressTo'] = address;
            result['network'] = chain;
        }
        return result;
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-withdraw-list
         * @param {string|undefined} code unified currency code
         * @param {int} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {string|undefined} params.pageNo pageNo default 1
         * @param {string|undefined} params.pageSize pageSize default 20. Max 100
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchWithdrawals() requires a `code` argument');
        }
        const currency = this.currency(code);
        if (since === undefined) {
            since = this.milliseconds() - 31556952000; // 1yr
        }
        const request = {
            'coin': currency['code'],
            'startTime': since,
            'endTime': this.milliseconds(),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateSpotGetWalletWithdrawalList(this.extend(request, params));
        //
        //      {
        //          "code": "00000",
        //          "msg": "success",
        //          "requestTime": 0,
        //          "data": [{
        //              "id": "925607360021839872",
        //              "txId": "f73a4ac034da06b729f49676ca8801f406a093cf90c69b16e5a1cc9080df4ccb",
        //              "coin": "USDT",
        //              "type": "deposit",
        //              "amount": "19.44800000",
        //              "status": "success",
        //              "toAddress": "TRo4JMfZ1XYHUgnLsUMfDEf8MWzcWaf8uh",
        //              "fee": null,
        //              "chain": "TRC20",
        //              "confirm": null,
        //              "cTime": "1656407912259",
        //              "uTime": "1656407940148"
        //          }]
        //      }
        //
        const rawTransactions = this.safeValue(response, 'data', []);
        return this.parseTransactions(rawTransactions, currency, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //     {
        //         "id": "925607360021839872",
        //         "txId": "f73a4ac034da06b729f49676ca8801f406a093cf90c69b16e5a1cc9080df4ccb",
        //         "coin": "USDT",
        //         "type": "deposit",
        //         "amount": "19.44800000",
        //         "status": "success",
        //         "toAddress": "TRo4JMfZ1XYHUgnLsUMfDEf8MWzcWaf8uh",
        //         "fee": null,
        //         "chain": "TRC20",
        //         "confirm": null,
        //         "cTime": "1656407912259",
        //         "uTime": "1656407940148"
        //     }
        //
        const timestamp = this.safeInteger(transaction, 'cTime');
        const networkId = this.safeString(transaction, 'chain');
        const currencyId = this.safeString(transaction, 'coin');
        const status = this.safeString(transaction, 'status');
        return {
            'id': this.safeString(transaction, 'id'),
            'info': transaction,
            'txid': this.safeString(transaction, 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': networkId,
            'addressFrom': undefined,
            'address': this.safeString(transaction, 'toAddress'),
            'addressTo': this.safeString(transaction, 'toAddress'),
            'amount': this.safeNumber(transaction, 'amount'),
            'type': this.safeString(transaction, 'type'),
            'currency': this.safeCurrencyCode(currencyId),
            'status': this.parseTransactionStatus(status),
            'updated': this.safeNumber(transaction, 'uTime'),
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'success': 'ok',
            'Pending': 'pending',
            'pending_review': 'pending',
            'pending_review_fail': 'failed',
            'reject': 'failed',
        };
        return this.safeString(statuses, status, status);
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name bitget#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const networkCode = this.safeString(params, 'network');
        const networkId = this.networkCodeToId(networkCode, code);
        const currency = this.currency(code);
        const request = {
            'coin': currency['code'],
        };
        if (networkId !== undefined) {
            request['chain'] = networkId;
        }
        const response = await this.privateSpotGetWalletDepositAddress(this.extend(request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "data": {
        //             "address": "1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv",
        //             "chain": "BTC-Bitcoin",
        //             "coin": "BTC",
        //             "tag": "",
        //             "url": "https://btc.com/1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv"
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //    {
        //        "address": "1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv",
        //        "chain": "BTC-Bitcoin",
        //        "coin": "BTC",
        //        "tag": "",
        //        "url": "https://btc.com/1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv"
        //    }
        //
        const currencyId = this.safeString(depositAddress, 'coin');
        const networkId = this.safeString(depositAddress, 'chain');
        const parsedCurrency = this.safeCurrencyCode(currencyId, currency);
        return {
            'currency': parsedCurrency,
            'address': this.safeString(depositAddress, 'address'),
            'tag': this.safeString(depositAddress, 'tag'),
            'network': this.networkIdToCode(networkId, parsedCurrency),
            'info': depositAddress,
        };
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicSpotGetMarketDepth(this.extend(request, params));
        }
        else {
            response = await this.publicMixGetMarketDepth(this.extend(request, params));
        }
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645854610294,
        //       data: {
        //         asks: [ [ '39102', '11.026' ] ],
        //         bids: [ [ '39100.5', '1.773' ] ],
        //         timestamp: '1645854610294'
        //       }
        //     }
        //
        const data = this.safeValue(response, 'data');
        const timestamp = this.safeInteger(data, 'timestamp');
        return this.parseOrderBook(data, symbol, timestamp);
    }
    parseTicker(ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         symbol: 'BTCUSDT',
        //         high24h: '40252.43',
        //         low24h: '38548.54',
        //         close: '39102.16',
        //         quoteVol: '67295596.1458',
        //         baseVol: '1723.4152',
        //         usdtVol: '67295596.14578',
        //         ts: '1645856170030',
        //         buyOne: '39096.16',
        //         sellOne: '39103.99'
        //     }
        //
        // swap
        //
        //     {
        //         symbol: 'BTCUSDT_UMCBL',
        //         last: '39086',
        //         bestAsk: '39087',
        //         bestBid: '39086',
        //         high24h: '40312',
        //         low24h: '38524.5',
        //         timestamp: '1645856591864',
        //         priceChangePercent: '-0.00861',
        //         baseVolume: '142251.757',
        //         quoteVolume: '5552388715.9215',
        //         usdtVolume: '5552388715.9215'
        //     }
        //
        let marketId = this.safeString(ticker, 'symbol');
        if ((market === undefined) && (marketId !== undefined) && (marketId.indexOf('_') === -1)) {
            // fetchTickers fix:
            // spot symbol are different from the "request id"
            // so we need to convert it to the exchange-specific id
            // otherwise we will not be able to find the market
            marketId = marketId + '_SPBL';
        }
        const symbol = this.safeSymbol(marketId, market);
        const high = this.safeString(ticker, 'high24h');
        const low = this.safeString(ticker, 'low24h');
        const close = this.safeString2(ticker, 'close', 'last');
        const quoteVolume = this.safeString2(ticker, 'quoteVol', 'quoteVolume');
        const baseVolume = this.safeString2(ticker, 'baseVol', 'baseVolume');
        const timestamp = this.safeInteger2(ticker, 'ts', 'timestamp');
        const datetime = this.iso8601(timestamp);
        const bid = this.safeString2(ticker, 'buyOne', 'bestBid');
        const ask = this.safeString2(ticker, 'sellOne', 'bestAsk');
        const percentage = Precise["default"].stringMul(this.safeString(ticker, 'priceChangePercent'), '100');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        const extended = this.extend(request, params);
        if (market['spot']) {
            response = await this.publicSpotGetMarketTicker(extended);
        }
        else {
            response = await this.publicMixGetMarketTicker(extended);
        }
        //
        //     {
        //         code: '00000',
        //         msg: 'success',
        //         requestTime: '1645856138576',
        //         data: {
        //             symbol: 'BTCUSDT',
        //             high24h: '40252.43',
        //             low24h: '38548.54',
        //             close: '39104.65',
        //             quoteVol: '67221762.2184',
        //             baseVol: '1721.527',
        //             usdtVol: '67221762.218361',
        //             ts: '1645856138031',
        //             buyOne: '39102.55',
        //             sellOne: '39110.56'
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.parseTicker(data, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-all-tickers
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-all-symbol-ticker
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const sandboxMode = this.safeValue(this.options, 'sandboxMode', false);
        await this.loadMarkets();
        let type = undefined;
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue(symbols, 0);
            market = this.market(symbol);
        }
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        const request = {};
        if (type !== 'spot') {
            let subType = undefined;
            [subType, params] = this.handleSubTypeAndParams('fetchTickers', undefined, params);
            let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
            if (sandboxMode) {
                productType = 'S' + productType;
            }
            request['productType'] = productType;
        }
        const extended = this.extend(request, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.publicSpotGetMarketTickers(extended);
        }
        else {
            response = await this.publicMixGetMarketTickers(extended);
        }
        //
        // spot
        //
        //     {
        //         "code":"00000",
        //         "msg":"success",
        //         "requestTime":1653237548496,
        //         "data":[
        //             {
        //                 "symbol":"LINKUSDT",
        //                 "high24h":"7.2634",
        //                 "low24h":"7.1697",
        //                 "close":"7.2444",
        //                 "quoteVol":"330424.2366",
        //                 "baseVol":"46401.3116",
        //                 "usdtVol":"330424.2365573",
        //                 "ts":"1653237548026",
        //                 "buyOne":"7.2382",
        //                 "sellOne":"7.2513"
        //             },
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code":"00000",
        //         "msg":"success",
        //         "requestTime":1653237819762,
        //         "data":[
        //             {
        //                 "symbol":"BTCUSDT_UMCBL",
        //                 "last":"29891.5",
        //                 "bestAsk":"29891.5",
        //                 "bestBid":"29889.5",
        //                 "high24h":"29941.5",
        //                 "low24h":"29737.5",
        //                 "timestamp":"1653237819761",
        //                 "priceChangePercent":"0.00163",
        //                 "baseVolume":"127937.56",
        //                 "quoteVolume":"3806276573.6285",
        //                 "usdtVolume":"3806276573.6285"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.parseTickers(data, symbols);
    }
    parseTrade(trade, market = undefined) {
        //
        // spot
        //
        //     {
        //         symbol: 'BTCUSDT_SPBL',
        //         tradeId: '881371996363608065',
        //         side: 'sell',
        //         fillPrice: '39123.05',
        //         fillQuantity: '0.0363',
        //         fillTime: '1645861379709'
        //     }
        //
        // swap
        //
        //     {
        //         tradeId: '881373204067311617',
        //         price: '39119.0',
        //         size: '0.001',
        //         side: 'buy',
        //         timestamp: '1645861667648',
        //         symbol: 'BTCUSDT_UMCBL'
        //     }
        //
        // private
        //
        //     {
        //         accountId: '4383649766',
        //         symbol: 'ETHBTC_SPBL',
        //         orderId: '1009402341131468800',
        //         fillId: '1009402351489581068',
        //         orderType: 'limit',
        //         side: 'sell',
        //         fillPrice: '0.06997800',
        //         fillQuantity: '0.04120000',
        //         fillTotalAmount: '0.00288309',
        //         feeCcy: 'BTC',
        //         fees: '-0.00000288',
        //         cTime: '1676386195060'
        //     }
        //
        //     {
        //         tradeId: '881640729552281602',
        //         symbol: 'BTCUSDT_UMCBL',
        //         orderId: '881640729145409536',
        //         price: '38429.50',
        //         sizeQty: '0.001',
        //         fee: '0',
        //         side: 'open_long',
        //         fillAmount: '38.4295',
        //         profit: '0',
        //         cTime: '1645925450694'
        //     }
        //
        const marketId = this.safeString(trade, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const id = this.safeString2(trade, 'tradeId', 'fillId');
        const order = this.safeString(trade, 'orderId');
        const side = this.safeString(trade, 'side');
        const price = this.safeString2(trade, 'fillPrice', 'price');
        let amount = this.safeString2(trade, 'fillQuantity', 'size');
        amount = this.safeString(trade, 'sizeQty', amount);
        let timestamp = this.safeInteger2(trade, 'fillTime', 'timestamp');
        timestamp = this.safeInteger(trade, 'cTime', timestamp);
        let fee = undefined;
        const feeAmount = this.safeString(trade, 'fees');
        const type = this.safeString(trade, 'orderType');
        if (feeAmount !== undefined) {
            const currencyCode = this.safeCurrencyCode(this.safeString(trade, 'feeCcy'));
            fee = {
                'code': currencyCode,
                'currency': currencyCode,
                'cost': Precise["default"].stringNeg(feeAmount),
            };
        }
        const datetime = this.iso8601(timestamp);
        return this.safeTrade({
            'info': trade,
            'id': id,
            'order': order,
            'symbol': symbol,
            'side': side,
            'type': type,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
            'timestamp': timestamp,
            'datetime': datetime,
        }, market);
    }
    async fetchTrades(symbol, limit = undefined, since = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const extended = this.extend(request, params);
        let response = undefined;
        if (market['spot']) {
            response = await this.publicSpotGetMarketFills(extended);
        }
        else {
            response = await this.publicMixGetMarketFills(extended);
        }
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: '1645861382032',
        //       data: [
        //         {
        //           symbol: 'BTCUSDT_SPBL',
        //           tradeId: '881371996363608065',
        //           side: 'sell',
        //           fillPrice: '39123.05',
        //           fillQuantity: '0.0363',
        //           fillTime: '1645861379709'
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    async fetchTradingFee(symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicSpotGetPublicProduct(this.extend(request, params));
        //
        //     {
        //         code: '00000',
        //         msg: 'success',
        //         requestTime: '1646255374000',
        //         data: {
        //           symbol: 'ethusdt_SPBL',
        //           symbolName: null,
        //           baseCoin: 'ETH',
        //           quoteCoin: 'USDT',
        //           minTradeAmount: '0',
        //           maxTradeAmount: '0',
        //           takerFeeRate: '0.002',
        //           makerFeeRate: '0.002',
        //           priceScale: '2',
        //           quantityScale: '4',
        //           status: 'online'
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseTradingFee(data, market);
    }
    async fetchTradingFees(params = {}) {
        /**
         * @method
         * @name bitget#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const response = await this.publicSpotGetPublicProducts(params);
        //
        //     {
        //         code: '00000',
        //         msg: 'success',
        //         requestTime: '1646255662391',
        //         data: [
        //           {
        //             symbol: 'ALPHAUSDT_SPBL',
        //             symbolName: 'ALPHAUSDT',
        //             baseCoin: 'ALPHA',
        //             quoteCoin: 'USDT',
        //             minTradeAmount: '2',
        //             maxTradeAmount: '0',
        //             takerFeeRate: '0.001',
        //             makerFeeRate: '0.001',
        //             priceScale: '4',
        //             quantityScale: '4',
        //             status: 'online'
        //           },
        //           ...
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const feeInfo = data[i];
            const fee = this.parseTradingFee(feeInfo);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }
    parseTradingFee(data, market = undefined) {
        const marketId = this.safeString(data, 'symbol');
        return {
            'info': data,
            'symbol': this.safeSymbol(marketId, market),
            'maker': this.safeNumber(data, 'makerFeeRate'),
            'taker': this.safeNumber(data, 'takerFeeRate'),
        };
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        // spot
        //
        //     {
        //         open: '57882.31',
        //         high: '58967.24',
        //         low: '57509.56',
        //         close: '57598.96',
        //         quoteVol: '439160536.605821',
        //         baseVol: '7531.2927',
        //         usdtVol: '439160536.605821',
        //         ts: '1637337600000'
        //     }
        //
        // swap
        //
        //     [
        //         "1645911960000",
        //         "39406",
        //         "39407",
        //         "39374.5",
        //         "39379",
        //         "35.526",
        //         "1399132.341"
        //     ]
        //
        return [
            this.safeInteger2(ohlcv, 0, 'ts'),
            this.safeNumber2(ohlcv, 1, 'open'),
            this.safeNumber2(ohlcv, 2, 'high'),
            this.safeNumber2(ohlcv, 3, 'low'),
            this.safeNumber2(ohlcv, 4, 'close'),
            this.safeNumber2(ohlcv, 5, 'baseVol'),
        ];
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-candle-data
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#candlestick-line-timeframe
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const until = this.safeInteger2(params, 'until', 'till');
        if (limit === undefined) {
            limit = 1000;
        }
        request['limit'] = limit;
        const marketType = market['spot'] ? 'spot' : 'swap';
        const timeframes = this.options['timeframes'][marketType];
        const selectedTimeframe = this.safeString(timeframes, timeframe, timeframe);
        const duration = this.parseTimeframe(timeframe);
        if (market['spot']) {
            request['period'] = selectedTimeframe;
            request['limit'] = limit;
            if (since !== undefined) {
                request['after'] = since;
                if (until === undefined) {
                    request['before'] = this.sum(since, limit * duration * 1000);
                }
            }
            if (until !== undefined) {
                request['before'] = until;
            }
        }
        else if (market['contract']) {
            request['granularity'] = selectedTimeframe;
            const now = this.milliseconds();
            if (since === undefined) {
                request['startTime'] = now - limit * (duration * 1000);
                request['endTime'] = now;
            }
            else {
                request['startTime'] = since;
                if (until !== undefined) {
                    request['endTime'] = until;
                }
                else {
                    request['endTime'] = this.sum(since, limit * duration * 1000);
                }
            }
        }
        const ommitted = this.omit(params, ['until', 'till']);
        const extended = this.extend(request, ommitted);
        let response = undefined;
        if (market['spot']) {
            response = await this.publicSpotGetMarketCandles(extended);
        }
        else {
            response = await this.publicMixGetMarketCandles(extended);
        }
        //  [ ["1645911960000","39406","39407","39374.5","39379","35.526","1399132.341"] ]
        const data = this.safeValue(response, 'data', response);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name bitget#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const sandboxMode = this.safeValue(this.options, 'sandboxMode', false);
        await this.loadMarkets();
        const [marketType, query] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        const method = this.getSupportedMapping(marketType, {
            'spot': 'privateSpotGetAccountAssets',
            'swap': 'privateMixGetAccountAccounts',
        });
        const request = {};
        if (marketType === 'swap') {
            let subType = undefined;
            [subType, params] = this.handleSubTypeAndParams('fetchBalance', undefined, params);
            let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
            if (sandboxMode) {
                productType = 'S' + productType;
            }
            request['productType'] = productType;
        }
        const response = await this[method](this.extend(request, query));
        // spot
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645928868827,
        //       data: [
        //         {
        //           coinId: 1,
        //           coinName: 'BTC',
        //           available: '0.00070000',
        //           frozen: '0.00000000',
        //           lock: '0.00000000',
        //           uTime: '1645921706000'
        //         }
        //       ]
        //     }
        //
        // swap
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645928929251,
        //       data: [
        //         {
        //           marginCoin: 'USDT',
        //           locked: '0',
        //           available: '8.078525',
        //           crossMaxAvailable: '8.078525',
        //           fixedMaxAvailable: '8.078525',
        //           maxTransferOut: '8.078525',
        //           equity: '10.02508',
        //           usdtEquity: '10.02508',
        //           btcEquity: '0.00026057027'
        //         }
        //       ]
        //     }
        const data = this.safeValue(response, 'data');
        return this.parseBalance(data);
    }
    parseBalance(balance) {
        const result = { 'info': balance };
        //
        //     {
        //       coinId: '1',
        //       coinName: 'BTC',
        //       available: '0.00099900',
        //       frozen: '0.00000000',
        //       lock: '0.00000000',
        //       uTime: '1661595535000'
        //     }
        //
        for (let i = 0; i < balance.length; i++) {
            const entry = balance[i];
            const currencyId = this.safeString2(entry, 'coinName', 'marginCoin');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            const frozen = this.safeString(entry, 'frozen');
            const locked = this.safeString2(entry, 'lock', 'locked');
            account['used'] = Precise["default"].stringAdd(frozen, locked);
            account['free'] = this.safeString(entry, 'available');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    parseOrderStatus(status) {
        const statuses = {
            'new': 'open',
            'init': 'open',
            'not_trigger': 'open',
            'partial_fill': 'open',
            'triggered': 'closed',
            'full_fill': 'closed',
            'filled': 'closed',
            'fail_trigger': 'canceled',
            'cancel': 'canceled',
            'cancelled': 'canceled',
            'canceled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // spot
        //     {
        //       accountId: '6394957606',
        //       symbol: 'BTCUSDT_SPBL',
        //       orderId: '881623995442958336',
        //       clientOrderId: '135335e9-b054-4e43-b00a-499f11d3a5cc',
        //       price: '39000.000000000000',
        //       quantity: '0.000700000000',
        //       orderType: 'limit',
        //       side: 'buy',
        //       status: 'new',
        //       fillPrice: '0.000000000000',
        //       fillQuantity: '0.000000000000',
        //       fillTotalAmount: '0.000000000000',
        //       cTime: '1645921460972'
        //     }
        //
        // swap
        //     {
        //       symbol: 'BTCUSDT_UMCBL',
        //       size: 0.001,
        //       orderId: '881640729145409536',
        //       clientOid: '881640729204129792',
        //       filledQty: 0.001,
        //       fee: 0,
        //       price: null,
        //       priceAvg: 38429.5,
        //       state: 'filled',
        //       side: 'open_long',
        //       timeInForce: 'normal',
        //       totalProfits: 0,
        //       posSide: 'long',
        //       marginCoin: 'USDT',
        //       filledAmount: 38.4295,
        //       orderType: 'market',
        //       cTime: '1645925450611',
        //       uTime: '1645925450746'
        //     }
        //
        // stop
        //
        //     {
        //         "orderId": "910246821491617792",
        //         "symbol": "BTCUSDT_UMCBL",
        //         "marginCoin": "USDT",
        //         "size": "16",
        //         "executePrice": "20000",
        //         "triggerPrice": "24000",
        //         "status": "not_trigger",
        //         "orderType": "limit",
        //         "planType": "normal_plan",
        //         "side": "open_long",
        //         "triggerType": "market_price",
        //         "presetTakeProfitPrice": "0",
        //         "presetTakeLossPrice": "0",
        //         "cTime": "1652745674488"
        //     }
        //
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const id = this.safeString(order, 'orderId');
        const price = this.safeString2(order, 'price', 'executePrice');
        const amount = this.safeString2(order, 'quantity', 'size');
        const filled = this.safeString2(order, 'fillQuantity', 'filledQty');
        const cost = this.safeString2(order, 'fillTotalAmount', 'filledAmount');
        const average = this.safeString2(order, 'fillPrice', 'priceAvg');
        const type = this.safeString(order, 'orderType');
        const timestamp = this.safeInteger(order, 'cTime');
        let side = this.safeString2(order, 'side', 'posSide');
        if ((side === 'open_long') || (side === 'close_short')) {
            side = 'buy';
        }
        else if ((side === 'close_long') || (side === 'open_short')) {
            side = 'sell';
        }
        const clientOrderId = this.safeString2(order, 'clientOrderId', 'clientOid');
        const fee = undefined;
        const rawStatus = this.safeString2(order, 'status', 'state');
        const status = this.parseOrderStatus(rawStatus);
        const lastTradeTimestamp = this.safeInteger(order, 'uTime');
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': this.safeNumber(order, 'triggerPrice'),
            'triggerPrice': this.safeNumber(order, 'triggerPrice'),
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitget#createOrder
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#place-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#place-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#place-stop-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#place-position-tpsl
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#place-plan-order
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell' or 'open_long' or 'open_short' or 'close_long' or 'close_short'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {float} params.triggerPrice *swap only* The price at which a trigger order is triggered at
         * @param {float|undefined} params.stopLossPrice *swap only* The price at which a stop loss order is triggered at
         * @param {float|undefined} params.takeProfitPrice *swap only* The price at which a take profit order is triggered at
         * @param {float|undefined} params.stopLoss *swap only* *uses the Place Position TPSL* The price at which a stop loss order is triggered at
         * @param {float|undefined} params.takeProfit *swap only* *uses the Place Position TPSL* The price at which a take profit order is triggered at
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const [marketType, query] = this.handleMarketTypeAndParams('createOrder', market, params);
        const request = {
            'symbol': market['id'],
            'orderType': type,
        };
        const isMarketOrder = type === 'market';
        const triggerPrice = this.safeNumber2(params, 'stopPrice', 'triggerPrice');
        const stopLossTriggerPrice = this.safeNumber(params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeNumber(params, 'takeProfitPrice');
        const stopLoss = this.safeNumber(params, 'stopLoss');
        const takeProfit = this.safeNumber(params, 'takeProfit');
        const isTriggerOrder = triggerPrice !== undefined;
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
        const isStopLossOrTakeProfit = isStopLoss || isTakeProfit;
        if (this.sum(isTriggerOrder, isStopLossTriggerOrder, isTakeProfitTriggerOrder, isStopLoss, isTakeProfit) > 1) {
            throw new errors.ExchangeError(this.id + ' createOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice, stopLoss, takeProfit');
        }
        if ((type === 'limit') && (triggerPrice === undefined)) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        let method = this.getSupportedMapping(marketType, {
            'spot': 'privateSpotPostTradeOrders',
            'swap': 'privateMixPostOrderPlaceOrder',
            'future': 'privateMixPostOrderPlaceOrder',
        });
        const exchangeSpecificTifParam = this.safeStringN(params, ['force', 'timeInForceValue', 'timeInForce']);
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(isMarketOrder, exchangeSpecificTifParam === 'post_only', params);
        if (marketType === 'spot') {
            if (isStopLossOrTakeProfitTrigger || isStopLossOrTakeProfit) {
                throw new errors.InvalidOrder(this.id + ' createOrder() does not support stop loss/take profit orders on spot markets, only swap markets');
            }
            let timeInForceKey = 'force';
            let quantityKey = 'quantity';
            let quantity = undefined;
            const createMarketBuyOrderRequiresPrice = this.safeValue(this.options, 'createMarketBuyOrderRequiresPrice', true);
            if (createMarketBuyOrderRequiresPrice && isMarketOrder && (side === 'buy')) {
                if (price === undefined) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                }
                else {
                    const amountString = this.numberToString(amount);
                    const priceString = this.numberToString(price);
                    const cost = this.parseNumber(Precise["default"].stringMul(amountString, priceString));
                    quantity = this.priceToPrecision(symbol, cost);
                }
            }
            else {
                quantity = this.amountToPrecision(symbol, amount);
            }
            if (clientOrderId !== undefined) {
                request['clientOrderId'] = clientOrderId;
            }
            request['side'] = side;
            if (triggerPrice !== undefined) {
                quantityKey = 'size';
                timeInForceKey = 'timeInForceValue';
                // default triggerType to market price for unification
                const triggerType = this.safeString(params, 'triggerType', 'market_price');
                request['triggerType'] = triggerType;
                request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
                request['executePrice'] = this.priceToPrecision(symbol, price);
                method = 'privateSpotPostPlanPlacePlan';
            }
            if (quantity !== undefined) {
                request[quantityKey] = quantity;
            }
            if (postOnly) {
                request[timeInForceKey] = 'post_only';
            }
            else {
                request[timeInForceKey] = 'normal';
            }
        }
        else {
            if (clientOrderId !== undefined) {
                request['clientOid'] = clientOrderId;
            }
            if (!isStopLossOrTakeProfit) {
                request['size'] = this.amountToPrecision(symbol, amount);
                if (postOnly) {
                    request['timeInForceValue'] = 'post_only';
                }
            }
            if (isTriggerOrder || isStopLossOrTakeProfit) {
                // default triggerType to market price for unification
                const triggerType = this.safeString(params, 'triggerType', 'market_price');
                request['triggerType'] = triggerType;
            }
            if (isStopLossOrTakeProfitTrigger || isStopLossOrTakeProfit) {
                if (!isMarketOrder) {
                    throw new errors.ExchangeError(this.id + ' createOrder() bitget stopLoss or takeProfit orders must be market orders');
                }
                request['holdSide'] = (side === 'buy') ? 'long' : 'short';
            }
            const reduceOnly = this.safeValue(params, 'reduceOnly', false);
            if (isTriggerOrder) {
                request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
                if (price !== undefined) {
                    request['executePrice'] = this.priceToPrecision(symbol, price);
                }
                if (side === 'buy') {
                    request['side'] = 'open_long';
                }
                else if (side === 'sell') {
                    request['side'] = 'open_short';
                }
                else {
                    request['side'] = side;
                }
                method = 'privateMixPostPlanPlacePlan';
            }
            else if (isStopLossOrTakeProfitTrigger) {
                if (isStopLossTriggerOrder) {
                    request['triggerPrice'] = this.priceToPrecision(symbol, stopLossTriggerPrice);
                    request['planType'] = 'loss_plan';
                }
                else if (isTakeProfitTriggerOrder) {
                    request['triggerPrice'] = this.priceToPrecision(symbol, takeProfitTriggerPrice);
                    request['planType'] = 'profit_plan';
                }
                method = 'privateMixPostPlanPlaceTPSL';
            }
            else if (isStopLossOrTakeProfit) {
                if (isStopLoss) {
                    request['triggerPrice'] = this.priceToPrecision(symbol, stopLoss);
                    request['planType'] = 'pos_loss';
                }
                else if (isTakeProfit) {
                    request['triggerPrice'] = this.priceToPrecision(symbol, takeProfit);
                    request['planType'] = 'pos_profit';
                }
                method = 'privateMixPostPlanPlacePositionsTPSL';
            }
            else {
                if (reduceOnly) {
                    request['side'] = (side === 'buy') ? 'close_short' : 'close_long';
                }
                else {
                    if (side === 'buy') {
                        request['side'] = 'open_long';
                    }
                    else if (side === 'sell') {
                        request['side'] = 'open_short';
                    }
                    else {
                        request['side'] = side;
                    }
                }
            }
            request['marginCoin'] = market['settleId'];
        }
        const omitted = this.omit(query, ['stopPrice', 'triggerType', 'stopLossPrice', 'takeProfitPrice', 'stopLoss', 'takeProfit', 'postOnly']);
        const response = await this[method](this.extend(request, omitted));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1645932209602,
        //         "data": {
        //             "orderId": "881669078313766912",
        //             "clientOrderId": "iauIBf#a45b595f96474d888d0ada"
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.parseOrder(data, market);
    }
    async editOrder(id, symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitget#editOrder
         * @description edit a trade order
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const [marketType, query] = this.handleMarketTypeAndParams('editOrder', market, params);
        const request = {
            'orderId': id,
            'orderType': type,
        };
        const isMarketOrder = type === 'market';
        const triggerPrice = this.safeValue2(params, 'stopPrice', 'triggerPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const stopLossPrice = this.safeValue(params, 'stopLossPrice');
        const isStopLossOrder = stopLossPrice !== undefined;
        const takeProfitPrice = this.safeValue(params, 'takeProfitPrice');
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        const isStopOrder = isStopLossOrder || isTakeProfitOrder;
        if (this.sum(isTriggerOrder, isStopLossOrder, isTakeProfitOrder) > 1) {
            throw new errors.ExchangeError(this.id + ' editOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice');
        }
        if (!isStopOrder && !isTriggerOrder) {
            throw new errors.InvalidOrder(this.id + ' editOrder() only support plan orders');
        }
        let method = this.getSupportedMapping(marketType, {
            'spot': 'privateSpotPostPlanModifyPlan',
            'swap': 'privateMixPostPlanModifyPlan',
            'future': 'privateMixPostPlanModifyPlan',
        });
        if (triggerPrice !== undefined) {
            // default triggerType to market price for unification
            const triggerType = this.safeString(params, 'triggerType', 'market_price');
            request['triggerType'] = triggerType;
            request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
            request['executePrice'] = this.priceToPrecision(symbol, price);
        }
        if (marketType === 'spot') {
            if (isStopOrder) {
                throw new errors.InvalidOrder(this.id + ' editOrder() does not support stop orders on spot markets, only swap markets');
            }
            const editMarketBuyOrderRequiresPrice = this.safeValue(this.options, 'editMarketBuyOrderRequiresPrice', true);
            if (editMarketBuyOrderRequiresPrice && isMarketOrder && (side === 'buy')) {
                if (price === undefined) {
                    throw new errors.InvalidOrder(this.id + ' editOrder() requires price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the editMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                }
                else {
                    const amountString = this.numberToString(amount);
                    const priceString = this.numberToString(price);
                    const cost = this.parseNumber(Precise["default"].stringMul(amountString, priceString));
                    request['size'] = this.priceToPrecision(symbol, cost);
                }
            }
            else {
                request['size'] = this.amountToPrecision(symbol, amount);
            }
        }
        else {
            request['symbol'] = market['id'];
            request['size'] = this.amountToPrecision(symbol, amount);
            if (isStopOrder) {
                if (!isMarketOrder) {
                    throw new errors.ExchangeError(this.id + ' editOrder() bitget stopLoss or takeProfit orders must be market orders');
                }
                if (isStopLossOrder) {
                    request['triggerPrice'] = this.priceToPrecision(symbol, stopLossPrice);
                    request['planType'] = 'loss_plan';
                }
                else if (isTakeProfitOrder) {
                    request['triggerPrice'] = this.priceToPrecision(symbol, takeProfitPrice);
                    request['planType'] = 'profit_plan';
                }
                method = 'privateMixPostPlanModifyTPSLPlan';
            }
            request['marginCoin'] = market['settleId'];
        }
        const omitted = this.omit(query, ['stopPrice', 'triggerType', 'stopLossPrice', 'takeProfitPrice']);
        const response = await this[method](this.extend(request, omitted));
        //
        // spot
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1668136575920,
        //         "data": {
        //         "orderId": "974792060738441216",
        //         "clientOrderId": "974792554995224576"
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.parseOrder(data, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('cancelOrder', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const [marketType, query] = this.handleMarketTypeAndParams('cancelOrder', market, params);
        let method = this.getSupportedMapping(marketType, {
            'spot': 'privateSpotPostTradeCancelOrder',
            'swap': 'privateMixPostOrderCancelOrder',
            'future': 'privateMixPostOrderCancelOrder',
        });
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const stop = this.safeValue(query, 'stop');
        if (stop) {
            if (marketType === 'spot') {
                method = 'privateSpotPostPlanCancelPlan';
            }
            else {
                const planType = this.safeString(params, 'planType');
                if (planType === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a planType parameter for stop orders, either normal_plan, profit_plan or loss_plan');
                }
                request['planType'] = planType;
                method = 'privateMixPostPlanCancelPlan';
            }
        }
        if (marketType === 'swap') {
            request['marginCoin'] = market['settleId'];
        }
        const ommitted = this.omit(query, ['stop', 'planType']);
        const response = await this[method](this.extend(request, ommitted));
        return this.parseOrder(response, market);
    }
    async cancelOrders(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('cancelOrders', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('cancelOrders', market, params);
        const request = {};
        let method = undefined;
        if (type === 'spot') {
            method = 'privateSpotPostTradeCancelBatchOrdersV2';
            request['symbol'] = market['id'];
            request['orderIds'] = ids;
        }
        else {
            method = 'privateMixPostOrderCancelBatchOrders';
            request['symbol'] = market['id'];
            request['marginCoin'] = market['quote'];
            request['orderIds'] = ids;
        }
        const response = await this[method](this.extend(request, params));
        //
        //     spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": "1680008815965",
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "orderId": "1024598257429823488",
        //                     "clientOrderId": "876493ce-c287-4bfc-9f4a-8b1905881313"
        //                 },
        //             ],
        //             "failed": []
        //         }
        //     }
        //
        //     swap
        //
        //     {
        //         "result":true,
        //         "symbol":"cmt_btcusdt",
        //         "order_ids":[
        //             "258414711",
        //             "478585558"
        //         ],
        //         "fail_infos":[
        //             {
        //                 "order_id":"258414711",
        //                 "err_code":"401",
        //                 "err_msg":""
        //             }
        //         ]
        //     }
        //
        return response;
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelAllOrders
         * @description cancel all open orders
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#cancel-all-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#cancel-all-trigger-order-tpsl
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {string} params.code marginCoin unified currency code
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const sandboxMode = this.safeValue(this.options, 'sandboxMode', false);
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('cancelAllOrders', market, params);
        let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
        if (sandboxMode) {
            productType = 'S' + productType;
        }
        const [marketType, query] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        if (marketType === 'spot') {
            throw new errors.NotSupported(this.id + ' cancelAllOrders () does not support spot markets');
        }
        const request = {
            'productType': productType,
        };
        let method = undefined;
        const stop = this.safeValue(query, 'stop');
        const planType = this.safeString(query, 'planType');
        if (stop !== undefined || planType !== undefined) {
            if (planType === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a planType parameter for stop orders, either normal_plan, profit_plan, loss_plan, pos_profit, pos_loss, moving_plan or track_plan');
            }
            method = 'privateMixPostPlanCancelAllPlan';
        }
        else {
            const code = this.safeString2(params, 'code', 'marginCoin');
            if (code === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders () requires a code argument [marginCoin] in the params');
            }
            const currency = this.currency(code);
            request['marginCoin'] = this.safeCurrencyCode(code, currency);
            method = 'privateMixPostOrderCancelAllOrders';
        }
        const ommitted = this.omit(query, ['stop', 'code', 'marginCoin']);
        const response = await this[method](this.extend(request, ommitted));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1663312535998,
        //         "data": {
        //             "result": true,
        //             "order_ids": ["954564352813969409"],
        //             "fail_infos": [
        //                 {
        //                     "order_id": "",
        //                     "err_code": "",
        //                     "err_msg": ""
        //                 }
        //             ]
        //         }
        //     }
        //
        return response;
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('fetchOrder', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const [marketType, query] = this.handleMarketTypeAndParams('fetchOrder', market, params);
        const method = this.getSupportedMapping(marketType, {
            'spot': 'privateSpotPostTradeOrderInfo',
            'swap': 'privateMixGetOrderDetail',
            'future': 'privateMixGetOrderDetail',
        });
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        let response = await this[method](this.extend(request, query));
        // spot
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: '1645926849436',
        //       data: [
        //         {
        //           accountId: '6394957606',
        //           symbol: 'BTCUSDT_SPBL',
        //           orderId: '881626139738935296',
        //           clientOrderId: '525890c8-767e-4cd6-8585-38160ed7bb5e',
        //           price: '38000.000000000000',
        //           quantity: '0.000700000000',
        //           orderType: 'limit',
        //           side: 'buy',
        //           status: 'new',
        //           fillPrice: '0.000000000000',
        //           fillQuantity: '0.000000000000',
        //           fillTotalAmount: '0.000000000000',
        //           cTime: '1645921972212'
        //         }
        //       ]
        //     }
        //
        // swap
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: '1645926587877',
        //       data: {
        //         symbol: 'BTCUSDT_UMCBL',
        //         size: '0.001',
        //         orderId: '881640729145409536',
        //         clientOid: '881640729204129792',
        //         filledQty: '0.001',
        //         fee: '0E-8',
        //         price: null,
        //         priceAvg: '38429.50',
        //         state: 'filled',
        //         side: 'open_long',
        //         timeInForce: 'normal',
        //         totalProfits: '0E-8',
        //         posSide: 'long',
        //         marginCoin: 'USDT',
        //         filledAmount: '38.4295',
        //         orderType: 'market',
        //         cTime: '1645925450611',
        //         uTime: '1645925450746'
        //       }
        //     }
        //
        // response will be string after filled, see: ccxt/ccxt#17900
        if (typeof response === 'string') {
            response = JSON.parse(response);
        }
        const data = this.safeValue(response, 'data');
        const first = this.safeValue(data, 0, data);
        return this.parseOrder(first, market);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOpenOrders
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-order-list
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-all-open-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-plan-order-tpsl-list
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-open-order
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of open order structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {};
        let marketType = undefined;
        let query = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        [marketType, query] = this.handleMarketTypeAndParams('fetchOpenOrders', market, params);
        let response = undefined;
        const stop = this.safeValue(query, 'stop');
        if (stop) {
            this.checkRequiredSymbol('fetchOpenOrders', symbol);
            query = this.omit(query, 'stop');
            if (marketType === 'spot') {
                if (limit !== undefined) {
                    request['pageSize'] = limit;
                }
                response = await this.privateSpotPostPlanCurrentPlan(this.extend(request, query));
            }
            else {
                response = await this.privateMixGetPlanCurrentPlan(this.extend(request, query));
            }
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateSpotPostTradeOpenOrders(this.extend(request, query));
            }
            else {
                if (market === undefined) {
                    let subType = undefined;
                    [subType, params] = this.handleSubTypeAndParams('fetchOpenOrders', undefined, params);
                    let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
                    const sandboxMode = this.safeValue(this.options, 'sandboxMode', false);
                    if (sandboxMode) {
                        productType = 'S' + productType;
                    }
                    request['productType'] = productType;
                    response = await this.privateMixGetOrderMarginCoinCurrent(this.extend(request, query));
                }
                else {
                    response = await this.privateMixGetOrderCurrent(this.extend(request, query));
                }
            }
        }
        //
        //  spot
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645921640193,
        //       data: [
        //         {
        //           accountId: '6394957606',
        //           symbol: 'BTCUSDT_SPBL',
        //           orderId: '881623995442958336',
        //           clientOrderId: '135335e9-b054-4e43-b00a-499f11d3a5cc',
        //           price: '39000.000000000000',
        //           quantity: '0.000700000000',
        //           orderType: 'limit',
        //           side: 'buy',
        //           status: 'new',
        //           fillPrice: '0.000000000000',
        //           fillQuantity: '0.000000000000',
        //           fillTotalAmount: '0.000000000000',
        //           cTime: '1645921460972'
        //         }
        //       ]
        //     }
        //
        // swap
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645922324630,
        //       data: [
        //         {
        //           symbol: 'BTCUSDT_UMCBL',
        //           size: 0.001,
        //           orderId: '881627074081226752',
        //           clientOid: '881627074160918528',
        //           filledQty: 0,
        //           fee: 0,
        //           price: 38000,
        //           state: 'new',
        //           side: 'open_long',
        //           timeInForce: 'normal',
        //           totalProfits: 0,
        //           posSide: 'long',
        //           marginCoin: 'USDT',
        //           filledAmount: 0,
        //           orderType: 'limit',
        //           cTime: '1645922194995',
        //           uTime: '1645922194995'
        //         }
        //       ]
        //     }
        //
        // stop
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652745815697,
        //         "data": [
        //             {
        //                 "orderId": "910246821491617792",
        //                 "symbol": "BTCUSDT_UMCBL",
        //                 "marginCoin": "USDT",
        //                 "size": "16",
        //                 "executePrice": "20000",
        //                 "triggerPrice": "24000",
        //                 "status": "not_trigger",
        //                 "orderType": "limit",
        //                 "planType": "normal_plan",
        //                 "side": "open_long",
        //                 "triggerType": "market_price",
        //                 "presetTakeProfitPrice": "0",
        //                 "presetTakeLossPrice": "0",
        //                 "cTime": "1652745674488"
        //             }
        //         ]
        //     }
        //
        // spot plan order
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1668134581006,
        //         "data": {
        //             "nextFlag": false,
        //             "endId": 974792555020390400,
        //             "orderList": [{
        //                 "orderId": "974792555020390400",
        //                 "symbol": "TRXUSDT_SPBL",
        //                 "size": "151",
        //                 "executePrice": "0.041572",
        //                 "triggerPrice": "0.041572",
        //                 "status": "not_trigger",
        //                 "orderType": "limit",
        //                 "side": "buy",
        //                 "triggerType": "fill_price",
        //                 "cTime": "1668134576563"
        //             }]
        //         }
        //     }
        //
        if (typeof response === 'string') {
            response = JSON.parse(response);
        }
        let data = this.safeValue(response, 'data', []);
        if (!Array.isArray(data)) {
            data = this.safeValue(data, 'orderList', []);
        }
        return this.parseOrders(data, market, since, limit);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-order-history
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-orders
         * @param {string} symbol unified market symbol of the closed orders
         * @param {int|undefined} since timestamp in ms of the earliest order
         * @param {int|undefined} limit the max number of closed orders to return
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        this.checkRequiredSymbol('fetchClosedOrders', symbol);
        const market = this.market(symbol);
        const response = await this.fetchCanceledAndClosedOrders(symbol, since, limit, params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const status = this.parseOrderStatus(this.safeString2(entry, 'state', 'status'));
            if (status === 'closed') {
                result.push(entry);
            }
        }
        return this.parseOrders(result, market, since, limit);
    }
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-order-history
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-orders
         * @param {string} symbol unified market symbol of the canceled orders
         * @param {int|undefined} since timestamp in ms of the earliest order
         * @param {int|undefined} limit the max number of canceled orders to return
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        this.checkRequiredSymbol('fetchCanceledOrders', symbol);
        const market = this.market(symbol);
        const response = await this.fetchCanceledAndClosedOrders(symbol, since, limit, params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const status = this.parseOrderStatus(this.safeString2(entry, 'state', 'status'));
            if (status === 'canceled') {
                result.push(entry);
            }
        }
        return this.parseOrders(result, market, since, limit);
    }
    async fetchCanceledAndClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchCanceledAndClosedOrders', market, params);
        const request = {
            'symbol': market['id'],
        };
        let method = this.getSupportedMapping(marketType, {
            'spot': 'privateSpotPostTradeHistory',
            'swap': 'privateMixGetOrderHistory',
            'future': 'privateMixGetOrderHistory',
        });
        const stop = this.safeValue(params, 'stop');
        if (stop) {
            if (marketType === 'spot') {
                method = 'privateSpotPostPlanHistoryPlan';
            }
            else {
                method = 'privateMixGetPlanHistoryPlan';
            }
            params = this.omit(params, 'stop');
        }
        if (marketType === 'swap' || stop) {
            if (limit === undefined) {
                limit = 100;
            }
            request['pageSize'] = limit;
            if (since === undefined) {
                since = 0;
            }
            request['startTime'] = since;
            request['endTime'] = this.milliseconds();
        }
        const response = await this[method](this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1663623237813,
        //         "data": [
        //             {
        //                 "accountId": "7264631750",
        //                 "symbol": "BTCUSDT_SPBL",
        //                 "orderId": "909129926745432064",
        //                 "clientOrderId": "9e12ee3d-6a87-4e68-b1cc-094422d223a5",
        //                 "price": "30001.580000000000",
        //                 "quantity": "0.000600000000",
        //                 "orderType": "limit",
        //                 "side": "sell",
        //                 "status": "full_fill",
        //                 "fillPrice": "30001.580000000000",
        //                 "fillQuantity": "0.000600000000",
        //                 "fillTotalAmount": "18.000948000000",
        //                 "cTime": "1652479386030"
        //             },
        //             ...
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1663622728935,
        //         "data": {
        //             "nextFlag": false,
        //             "endId": "908510348120305664",
        //             "orderList": [
        //                 {
        //                     "symbol": "BTCUSDT_UMCBL",
        //                     "size": 0.004,
        //                     "orderId": "954568553644306433",
        //                     "clientOid": "954568553677860864",
        //                     "filledQty": 0.000,
        //                     "fee": 0E-8,
        //                     "price": 18000.00,
        //                     "state": "canceled",
        //                     "side": "open_long",
        //                     "timeInForce": "normal",
        //                     "totalProfits": 0E-8,
        //                     "posSide": "long",
        //                     "marginCoin": "USDT",
        //                     "filledAmount": 0.0000,
        //                     "orderType": "limit",
        //                     "leverage": "3",
        //                     "marginMode": "fixed",
        //                     "cTime": "1663312798899",
        //                     "uTime": "1663312809425"
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        // spot plan order
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1668134626684,
        //         "data": {
        //             "nextFlag": false,
        //             "endId": 974792060738441216,
        //             "orderList": [
        //                 {
        //                 "orderId": "974792060738441216",
        //                 "symbol": "TRXUSDT_SPBL",
        //                 "size": "156",
        //                 "executePrice": "0.041272",
        //                 "triggerPrice": "0.041222",
        //                 "status": "cancel",
        //                 "orderType": "limit",
        //                 "side": "buy",
        //                 "triggerType": "fill_price",
        //                 "cTime": "1668134458717"
        //                 }
        //             ]
        //         }
        //     }
        //
        // swap plan order
        //
        //     {
        //         "code":"00000",
        //         "data":[
        //             {
        //                 "orderId":"803521986049314816",
        //                 "executeOrderId":"84271931884910",
        //                 "symbol":"BTCUSDT_UMCBL",
        //                 "marginCoin":"USDT",
        //                 "size":"1",
        //                 "executePrice":"38923.1",
        //                 "triggerPrice":"45000.3",
        //                 "status":"cancel",
        //                 "orderType":"limit",
        //                 "planType":"normal_plan",
        //                 "side":"open_long",
        //                 "triggerType":"fill_price",
        //                 "presetTakeProfitPrice":"0",
        //                 "presetTakeLossPrice":"0",
        //                 "ctime":"1627300490867"
        //             }
        //         ],
        //         "msg":"success",
        //         "requestTime":1627354109502
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.safeValue(data, 'orderList', []);
    }
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency(code);
            request['coinId'] = currency['id'];
        }
        const response = await this.privateSpotPostAccountBills(this.extend(request, params));
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: '1645929886887',
        //       data: [
        //         {
        //           billId: '881626974170554368',
        //           coinId: '2',
        //           coinName: 'USDT',
        //           groupType: 'transfer',
        //           bizType: 'transfer-out',
        //           quantity: '-10.00000000',
        //           balance: '73.36005300',
        //           fees: '0.00000000',
        //           cTime: '1645922171146'
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.parseLedger(data, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //       billId: '881626974170554368',
        //       coinId: '2',
        //       coinName: 'USDT',
        //       groupType: 'transfer',
        //       bizType: 'transfer-out',
        //       quantity: '-10.00000000',
        //       balance: '73.36005300',
        //       fees: '0.00000000',
        //       cTime: '1645922171146'
        //     }
        //
        const id = this.safeString(item, 'billId');
        const currencyId = this.safeString(item, 'coinId');
        const code = this.safeCurrencyCode(currencyId);
        const amount = this.parseNumber(Precise["default"].stringAbs(this.safeString(item, 'quantity')));
        const timestamp = this.safeInteger(item, 'cTime');
        const bizType = this.safeString(item, 'bizType');
        let direction = undefined;
        if (bizType !== undefined && bizType.indexOf('-') >= 0) {
            const parts = bizType.split('-');
            direction = parts[1];
        }
        const type = this.safeString(item, 'groupType');
        const fee = this.safeNumber(item, 'fees');
        const after = this.safeNumber(item, 'balance');
        return {
            'info': item,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': after,
            'status': undefined,
            'fee': fee,
        };
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        this.checkRequiredSymbol('fetchMyTrades', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchMyTrades() only supports spot markets');
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateSpotPostTradeFills(this.extend(request, params));
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: '1645918954082',
        //       data: [
        //         {
        //           accountId: '6394957606',
        //           symbol: 'LTCUSDT_SPBL',
        //           orderId: '864752115272552448',
        //           fillId: '864752115685969921',
        //           orderType: 'limit',
        //           side: 'buy',
        //           fillPrice: '127.92000000',
        //           fillQuantity: '0.10000000',
        //           fillTotalAmount: '12.79200000',
        //           feeCcy: 'LTC',
        //           fees: '0.00000000',
        //           cTime: '1641898891373'
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.parseTrades(data, market, since, limit);
    }
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        this.checkRequiredSymbol('fetchOrderTrades', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const [marketType, query] = this.handleMarketTypeAndParams('fetchOrderTrades', market, params);
        const method = this.getSupportedMapping(marketType, {
            'spot': 'privateSpotPostTradeFills',
            'swap': 'privateMixGetOrderFills',
            'future': 'privateMixGetOrderFills',
        });
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this[method](this.extend(request, query));
        // spot
        //
        // swap
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645927862710,
        //       data: [
        //         {
        //           tradeId: '881640729552281602',
        //           symbol: 'BTCUSDT_UMCBL',
        //           orderId: '881640729145409536',
        //           price: '38429.50',
        //           sizeQty: '0.001',
        //           fee: '0',
        //           side: 'open_long',
        //           fillAmount: '38.4295',
        //           profit: '0',
        //           cTime: '1645925450694'
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue(response, 'data');
        return this.parseTrades(data, market, since, limit);
    }
    async fetchPosition(symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
        };
        const response = await this.privateMixGetPositionSinglePositionV2(this.extend(request, params));
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: '1645933957584',
        //       data: [
        //         {
        //           marginCoin: 'USDT',
        //           symbol: 'BTCUSDT_UMCBL',
        //           holdSide: 'long',
        //           openDelegateCount: '0',
        //           margin: '1.921475',
        //           available: '0.001',
        //           locked: '0',
        //           total: '0.001',
        //           leverage: '20',
        //           achievedProfits: '0',
        //           averageOpenPrice: '38429.5',
        //           marginMode: 'fixed',
        //           holdMode: 'double_hold',
        //           unrealizedPL: '0.1634',
        //           liquidationPrice: '0',
        //           keepMarginRate: '0.004',
        //           cTime: '1645922194988'
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parsePositions(data);
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        const sandboxMode = this.safeValue(this.options, 'sandboxMode', false);
        await this.loadMarkets();
        let market = undefined;
        if (symbols !== undefined) {
            const first = this.safeString(symbols, 0);
            market = this.market(first);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchPositions', market, params);
        let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
        if (sandboxMode) {
            productType = 'S' + productType;
        }
        const request = {
            'productType': productType,
        };
        const response = await this.privateMixGetPositionAllPositionV2(this.extend(request, params));
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: '1645933905060',
        //       data: [
        //         {
        //           marginCoin: 'USDT',
        //           symbol: 'BTCUSDT_UMCBL',
        //           holdSide: 'long',
        //           openDelegateCount: '0',
        //           margin: '1.921475',
        //           available: '0.001',
        //           locked: '0',
        //           total: '0.001',
        //           leverage: '20',
        //           achievedProfits: '0',
        //           averageOpenPrice: '38429.5',
        //           marginMode: 'fixed',
        //           holdMode: 'double_hold',
        //           unrealizedPL: '0.14869',
        //           liquidationPrice: '0',
        //           keepMarginRate: '0.004',
        //           cTime: '1645922194988'
        //         }
        //       ]
        //     }
        //
        const position = this.safeValue(response, 'data', []);
        const result = [];
        for (let i = 0; i < position.length; i++) {
            result.push(this.parsePosition(position[i]));
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArray(result, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         marginCoin: 'USDT',
        //         symbol: 'BTCUSDT_UMCBL',
        //         holdSide: 'long',
        //         openDelegateCount: '0',
        //         margin: '1.921475',
        //         available: '0.001',
        //         locked: '0',
        //         total: '0.001',
        //         leverage: '20',
        //         achievedProfits: '0',
        //         averageOpenPrice: '38429.5',
        //         marginMode: 'fixed',
        //         holdMode: 'double_hold',
        //         unrealizedPL: '0.14869',
        //         liquidationPrice: '0',
        //         keepMarginRate: '0.004',
        //         cTime: '1645922194988'
        //     }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(position, 'cTime');
        let marginMode = this.safeString(position, 'marginMode');
        let collateral = undefined;
        let initialMargin = undefined;
        const unrealizedPnl = this.safeString(position, 'unrealizedPL');
        const rawCollateral = this.safeString(position, 'margin');
        if (marginMode === 'fixed') {
            marginMode = 'isolated';
            collateral = Precise["default"].stringAdd(rawCollateral, unrealizedPnl);
        }
        else if (marginMode === 'crossed') {
            marginMode = 'cross';
            initialMargin = rawCollateral;
        }
        const holdMode = this.safeString(position, 'holdMode');
        let hedged = undefined;
        if (holdMode === 'double_hold') {
            hedged = true;
        }
        else if (holdMode === 'single_hold') {
            hedged = false;
        }
        const side = this.safeString(position, 'holdSide');
        const leverage = this.safeString(position, 'leverage');
        const contractSizeNumber = this.safeValue(market, 'contractSize');
        const contractSize = this.numberToString(contractSizeNumber);
        const baseAmount = this.safeString(position, 'total');
        const entryPrice = this.safeString(position, 'averageOpenPrice');
        const maintenanceMarginPercentage = this.safeString(position, 'keepMarginRate');
        const openNotional = Precise["default"].stringMul(entryPrice, baseAmount);
        if (initialMargin === undefined) {
            initialMargin = Precise["default"].stringDiv(openNotional, leverage);
        }
        const contracts = this.parseNumber(Precise["default"].stringDiv(baseAmount, contractSize));
        const markPrice = this.safeString(position, 'marketPrice');
        const notional = Precise["default"].stringMul(baseAmount, markPrice);
        const initialMarginPercentage = Precise["default"].stringDiv(initialMargin, notional);
        let liquidationPrice = this.parseNumber(this.omitZero(this.safeString(position, 'liquidationPrice')));
        const calcTakerFeeRate = '0.0006';
        const calcTakerFeeMult = '0.9994';
        if ((liquidationPrice === undefined) && (marginMode === 'isolated') && Precise["default"].stringGt(baseAmount, '0')) {
            let signedMargin = Precise["default"].stringDiv(rawCollateral, baseAmount);
            let signedMmp = maintenanceMarginPercentage;
            if (side === 'short') {
                signedMargin = Precise["default"].stringNeg(signedMargin);
                signedMmp = Precise["default"].stringNeg(signedMmp);
            }
            let mmrMinusOne = Precise["default"].stringSub('1', signedMmp);
            let numerator = Precise["default"].stringSub(entryPrice, signedMargin);
            if (side === 'long') {
                mmrMinusOne = Precise["default"].stringMul(mmrMinusOne, calcTakerFeeMult);
            }
            else {
                numerator = Precise["default"].stringMul(numerator, calcTakerFeeMult);
            }
            liquidationPrice = this.parseNumber(Precise["default"].stringDiv(numerator, mmrMinusOne));
        }
        const feeToClose = Precise["default"].stringMul(notional, calcTakerFeeRate);
        const maintenanceMargin = Precise["default"].stringAdd(Precise["default"].stringMul(maintenanceMarginPercentage, notional), feeToClose);
        const marginRatio = Precise["default"].stringDiv(maintenanceMargin, collateral);
        const percentage = Precise["default"].stringMul(Precise["default"].stringDiv(unrealizedPnl, initialMargin, 4), '100');
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'notional': this.parseNumber(notional),
            'marginMode': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.parseNumber(entryPrice),
            'unrealizedPnl': this.parseNumber(unrealizedPnl),
            'percentage': this.parseNumber(percentage),
            'contracts': contracts,
            'contractSize': contractSizeNumber,
            'markPrice': this.parseNumber(markPrice),
            'lastPrice': undefined,
            'side': side,
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': this.parseNumber(maintenanceMargin),
            'maintenanceMarginPercentage': this.parseNumber(maintenanceMarginPercentage),
            'collateral': this.parseNumber(collateral),
            'initialMargin': this.parseNumber(initialMargin),
            'initialMarginPercentage': this.parseNumber(initialMarginPercentage),
            'leverage': this.parseNumber(leverage),
            'marginRatio': this.parseNumber(marginRatio),
        });
    }
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        this.checkRequiredSymbol('fetchFundingRateHistory', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'pageSize': limit, // default 20
            // 'pageNo': 1,
            // 'nextPage': false,
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.publicMixGetMarketHistoryFundRate(this.extend(request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652406728393,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "fundingRate": "-0.0003",
        //                 "settleTime": "1652396400000"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString(entry, 'symbol');
            const symbolInner = this.safeSymbol(marketId, market);
            const timestamp = this.safeInteger(entry, 'settleTime');
            rates.push({
                'info': entry,
                'symbol': symbolInner,
                'fundingRate': this.safeNumber(entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicMixGetMarketCurrentFundRate(this.extend(request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652401684275,
        //         "data": {
        //             "symbol": "BTCUSDT_UMCBL",
        //             "fundingRate": "-0.000182"
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseFundingRate(data, market);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "fundingRate": "-0.000182"
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber(contract, 'fundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }
    async fetchFundingHistory(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchFundingHistory
         * @description fetch the funding history
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-account-bill
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the starting timestamp in milliseconds
         * @param {int|undefined} limit the number of entries to return
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingHistory() supports swap contracts only');
        }
        if (since === undefined) {
            since = this.milliseconds() - 31556952000; // 1 year
        }
        const request = {
            'symbol': market['id'],
            'marginCoin': market['quoteId'],
            'startTime': since,
            'endTime': this.milliseconds(),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateMixGetAccountAccountBill(this.extend(request, params));
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "data": {
        //            "result": [
        //                {
        //                    "id": "892962903462432768",
        //                    "symbol": "ETHUSDT_UMCBL",
        //                    "marginCoin": "USDT",
        //                    "amount": "0",
        //                    "fee": "-0.1765104",
        //                    "feeByCoupon": "",
        //                    "feeCoin": "USDT",
        //                    "business": "contract_settle_fee",
        //                    "cTime": "1648624867354"
        //                }
        //            ],
        //            "endId": "885353495773458432",
        //            "nextFlag": false,
        //            "preFlag": false
        //    }
        //
        const data = this.safeValue(response, 'data', {});
        const result = this.safeValue(data, 'result', []);
        return this.parseFundingHistories(result, market, since, limit);
    }
    parseFundingHistory(contract, market = undefined) {
        //
        //     {
        //         "id": "892962903462432768",
        //         "symbol": "ETHUSDT_UMCBL",
        //         "marginCoin": "USDT",
        //         "amount": "0",
        //         "fee": "-0.1765104",
        //         "feeByCoupon": "",
        //         "feeCoin": "USDT",
        //         "business": "contract_settle_fee",
        //         "cTime": "1648624867354"
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, 'swap');
        const currencyId = this.safeString(contract, 'marginCoin');
        const code = this.safeCurrencyCode(currencyId);
        const amount = this.safeNumber(contract, 'amount');
        const timestamp = this.safeInteger(contract, 'cTime');
        const id = this.safeString(contract, 'id');
        return {
            'info': contract,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'code': code,
            'amount': amount,
            'id': id,
        };
    }
    parseFundingHistories(contracts, market = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < contracts.length; i++) {
            const contract = contracts[i];
            const business = this.safeString(contract, 'business');
            if (business !== 'contract_settle_fee') {
                continue;
            }
            result.push(this.parseFundingHistory(contract, market));
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterBySinceLimit(sorted, since, limit);
    }
    async modifyMarginHelper(symbol, amount, type, params = {}) {
        await this.loadMarkets();
        const holdSide = this.safeString(params, 'holdSide');
        const market = this.market(symbol);
        const marginCoin = (market['linear']) ? market['quote'] : market['base'];
        const request = {
            'symbol': market['id'],
            'marginCoin': marginCoin,
            'amount': this.amountToPrecision(symbol, amount),
            'holdSide': holdSide, // long or short
        };
        params = this.omit(params, 'holdSide');
        const response = await this.privateMixPostAccountSetMargin(this.extend(request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652483636792,
        //         "data": {
        //             "result": true
        //         }
        //     }
        //
        return this.extend(this.parseMarginModification(response, market), {
            'amount': this.parseNumber(amount),
            'type': type,
        });
    }
    parseMarginModification(data, market = undefined) {
        const errorCode = this.safeString(data, 'code');
        const status = (errorCode === '00000') ? 'ok' : 'failed';
        const code = (market['linear']) ? market['quote'] : market['base'];
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': code,
            'symbol': market['symbol'],
            'status': status,
        };
    }
    async reduceMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name bitget#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        if (amount > 0) {
            throw new errors.BadRequest(this.id + ' reduceMargin() amount parameter must be a negative value');
        }
        const holdSide = this.safeString(params, 'holdSide');
        if (holdSide === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' reduceMargin() requires a holdSide parameter, either long or short');
        }
        return await this.modifyMarginHelper(symbol, amount, 'reduce', params);
    }
    async addMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name bitget#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        const holdSide = this.safeString(params, 'holdSide');
        if (holdSide === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' addMargin() requires a holdSide parameter, either long or short');
        }
        return await this.modifyMarginHelper(symbol, amount, 'add', params);
    }
    async fetchLeverage(symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchLeverage
         * @description fetch the set leverage for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
        };
        const response = await this.privateMixGetAccountAccount(this.extend(request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 0,
        //         "data": {
        //             "marginCoin": "SUSDT",
        //             "locked": "0",
        //             "available": "3000",
        //             "crossMaxAvailable": "3000",
        //             "fixedMaxAvailable": "3000",
        //             "maxTransferOut": "3000",
        //             "equity": "3000",
        //             "usdtEquity": "3000",
        //             "btcEquity": "0.12217217236",
        //             "crossRiskRate": "0",
        //             "crossMarginLeverage": 20,
        //             "fixedLongLeverage": 40,
        //             "fixedShortLeverage": 10,
        //             "marginMode": "fixed",
        //             "holdMode": "double_hold",
        //             "unrealizedPL": null,
        //             "bonus": "0"
        //         }
        //     }
        //
        return response;
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} response from the exchange
         */
        this.checkRequiredSymbol('setLeverage', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'leverage': leverage,
            // 'holdSide': 'long',
        };
        return await this.privateMixPostAccountSetLeverage(this.extend(request, params));
    }
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} response from the exchange
         */
        this.checkRequiredSymbol('setMarginMode', symbol);
        marginMode = marginMode.toLowerCase();
        if ((marginMode !== 'fixed') && (marginMode !== 'crossed')) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() marginMode must be "fixed" or "crossed"');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'marginMode': marginMode,
        };
        return await this.privateMixPostAccountSetMarginMode(this.extend(request, params));
    }
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setPositionMode
         * @description set hedged to true or false for a market
         * @param {bool} hedged set to true to use dualSidePosition
         * @param {string|undefined} symbol not used by bitget setPositionMode ()
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} response from the exchange
         *
         */
        await this.loadMarkets();
        const sandboxMode = this.safeValue(this.options, 'sandboxMode', false);
        const holdMode = hedged ? 'double_hold' : 'single_hold';
        const request = {
            'holdMode': holdMode,
        };
        let subType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        [subType, params] = this.handleSubTypeAndParams('setPositionMode', market, params);
        let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
        if (sandboxMode) {
            productType = 'S' + productType;
        }
        request['productType'] = productType;
        const response = await this.privateMixPostAccountSetPositionMode(this.extend(request, params));
        //
        //    {
        //         "code": "40919",
        //         "msg": "This function is not open yet",
        //         "requestTime": 1672212431093,
        //         "data": null
        //     }
        //
        return response;
    }
    async fetchOpenInterest(symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchOpenInterest
         * @description Retrieves the open interest of a currency
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-open-interest
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicMixGetMarketOpenInterest(this.extend(request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 0,
        //         "data": {
        //             "symbol": "BTCUSDT_UMCBL",
        //             "amount": "130818.967",
        //             "timestamp": "1663399151127"
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        return this.parseOpenInterest(data, market);
    }
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-transfer-list
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTransfers', undefined, params);
        const fromAccount = this.safeString(params, 'fromAccount', type);
        params = this.omit(params, 'fromAccount');
        const accountsByType = this.safeValue(this.options, 'accountsByType', {});
        type = this.safeString(accountsByType, fromAccount);
        const request = {
            'fromType': type,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coinId'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateSpotGetAccountTransferRecords(this.extend(request, params));
        //
        //     {
        //         "code":"00000",
        //         "message":"success",
        //         "data":[{
        //             "cTime":"1622697148",
        //             "coinId":"22",
        //             "coinName":"usdt",
        //             "groupType":"deposit",
        //             "bizType":"transfer-in",
        //             "quantity":"1",
        //             "balance": "1",
        //             "fees":"0",
        //             "billId":"1291"
        //         }]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        return this.parseTransfers(data, currency, since, limit);
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name bitget#transfer
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#transfer-v2
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the bitget api endpoint
         *
         * EXCHANGE SPECIFIC PARAMS
         * @param {string} params.clientOid custom id
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const fromSwap = fromAccount === 'swap';
        const toSwap = toAccount === 'swap';
        const usdt = currency['code'] === 'USDT';
        if (fromSwap) {
            fromAccount = usdt ? 'mix_usdt' : 'mix_usd';
        }
        else if (toSwap) {
            toAccount = usdt ? 'mix_usdt' : 'mix_usd';
        }
        const request = {
            'fromType': fromAccount,
            'toType': toAccount,
            'amount': amount,
            'coin': currency['info']['coinName'],
        };
        const response = await this.privateSpotPostWalletTransferV2(this.extend(request, params));
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": 1668119107154,
        //        "data": "SUCCESS"
        //    }
        //
        return this.parseTransfer(response, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": 1668119107154,
        //        "data": "SUCCESS"
        //    }
        //
        // fetchTransfers
        //
        //     {
        //         "cTime":"1622697148",
        //         "coinId":"22",
        //         "coinName":"usdt",
        //         "groupType":"deposit",
        //         "bizType":"transfer-in",
        //         "quantity":"1",
        //         "balance": "1",
        //         "fees":"0",
        //         "billId":"1291"
        //     }
        //
        let timestamp = this.safeInteger2(transfer, 'requestTime', 'tradeTime');
        if (timestamp === undefined) {
            timestamp = this.safeTimestamp(transfer, 'cTime');
        }
        const msg = this.safeStringLowerN(transfer, ['msg', 'status']);
        let currencyId = this.safeString2(transfer, 'code', 'coinName');
        if (currencyId === '00000') {
            currencyId = undefined;
        }
        const fromAccountRaw = this.safeString(transfer, 'fromType');
        const accountsById = this.safeValue(this.options, 'accountsById', {});
        const fromAccount = this.safeString(accountsById, fromAccountRaw, fromAccountRaw);
        const toAccountRaw = this.safeString(transfer, 'toType');
        const toAccount = this.safeString(accountsById, toAccountRaw, toAccountRaw);
        return {
            'info': transfer,
            'id': this.safeString2(transfer, 'id', 'billId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': this.safeCurrencyCode(currencyId),
            'amount': this.safeNumberN(transfer, ['size', 'quantity', 'amount']),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus(msg),
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'success': 'ok',
            'successful': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "amount": "130818.967",
        //         "timestamp": "1663399151127"
        //     }
        //
        const timestamp = this.safeInteger(interest, 'timestamp');
        const id = this.safeString(interest, 'symbol');
        const symbol = this.safeSymbol(id, market);
        const amount = this.safeNumber(interest, 'amount');
        return {
            'symbol': symbol,
            'openInterestAmount': amount,
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        // spot
        //
        //     {"status":"fail","err_code":"01001","err_msg":"系统异常，请稍后重试"}
        //     {"status":"error","ts":1595594160149,"err_code":"invalid-parameter","err_msg":"invalid size, valid range: [1,2000]"}
        //     {"status":"error","ts":1595684716042,"err_code":"invalid-parameter","err_msg":"illegal sign invalid"}
        //     {"status":"error","ts":1595700216275,"err_code":"bad-request","err_msg":"your balance is low!"}
        //     {"status":"error","ts":1595700344504,"err_code":"invalid-parameter","err_msg":"invalid type"}
        //     {"status":"error","ts":1595703343035,"err_code":"bad-request","err_msg":"order cancel fail"}
        //     {"status":"error","ts":1595704360508,"err_code":"invalid-parameter","err_msg":"accesskey not null"}
        //     {"status":"error","ts":1595704490084,"err_code":"invalid-parameter","err_msg":"permissions not right"}
        //     {"status":"error","ts":1595711862763,"err_code":"system exception","err_msg":"system exception"}
        //     {"status":"error","ts":1595730308979,"err_code":"bad-request","err_msg":"20003"}
        //
        // swap
        //
        //     {"code":"40015","msg":"","requestTime":1595698564931,"data":null}
        //     {"code":"40017","msg":"Order id must not be blank","requestTime":1595702477835,"data":null}
        //     {"code":"40017","msg":"Order Type must not be blank","requestTime":1595698516162,"data":null}
        //     {"code":"40301","msg":"","requestTime":1595667662503,"data":null}
        //     {"code":"40017","msg":"Contract code must not be blank","requestTime":1595703151651,"data":null}
        //     {"code":"40108","msg":"","requestTime":1595885064600,"data":null}
        //     {"order_id":"513468410013679613","client_oid":null,"symbol":"ethusd","result":false,"err_code":"order_no_exist_error","err_msg":"订单不存在！"}
        //
        const message = this.safeString(response, 'err_msg');
        const errorCode = this.safeString2(response, 'code', 'err_code');
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
        }
        const nonZeroErrorCode = (errorCode !== undefined) && (errorCode !== '00000');
        if (nonZeroErrorCode) {
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
        }
        if (nonZeroErrorCode || nonEmptyMessage) {
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
    sign(path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const signed = api[0] === 'private';
        const endpoint = api[1];
        let pathPart = '';
        if (endpoint === 'spot') {
            pathPart = '/api/spot/v1';
        }
        else if (endpoint === 'mix') {
            pathPart = '/api/mix/v1';
        }
        else if (endpoint === 'user') {
            pathPart = '/api/user/v1';
        }
        else if (endpoint === 'broker') {
            pathPart = '/api/broker/v1';
        }
        else if (endpoint === 'margin') {
            pathPart = '/api/margin/v1';
        }
        else {
            pathPart = '/api/p2p/v1';
        }
        const request = '/' + this.implodeParams(path, params);
        const payload = pathPart + request;
        let url = this.implodeHostname(this.urls['api'][endpoint]) + payload;
        const query = this.omit(params, this.extractParams(path));
        if (!signed && (method === 'GET')) {
            const keys = Object.keys(query);
            const keysLength = keys.length;
            if (keysLength > 0) {
                url = url + '?' + this.urlencode(query);
            }
        }
        if (signed) {
            this.checkRequiredCredentials();
            const timestamp = this.milliseconds().toString();
            let auth = timestamp + method + payload;
            if (method === 'POST') {
                body = this.json(params);
                auth += body;
            }
            else {
                if (Object.keys(params).length) {
                    const queryInner = '?' + this.urlencode(this.keysort(params));
                    url += queryInner;
                    auth += queryInner;
                }
            }
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256, 'base64');
            const broker = this.safeString(this.options, 'broker');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': this.password,
                'X-CHANNEL-API-CODE': broker,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = bitget;
