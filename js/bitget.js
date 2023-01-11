'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, NotSupported, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, BadSymbol, RateLimitExceeded } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitget extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitget',
            'name': 'Bitget',
            'countries': [ 'SG' ],
            'version': 'v1',
            'rateLimit': 50, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
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
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
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
                'fetchTransfers': undefined,
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
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'hostname': 'bitget.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/195989417-4253ddb0-afbe-4a1c-9dea-9dbcd121fa5d.jpg',
                'api': {
                    'spot': 'https://api.{hostname}',
                    'mix': 'https://api.{hostname}',
                },
                'www': 'https://www.bitget.com',
                'doc': [
                    'https://bitgetlimited.github.io/apidoc/en/mix',
                    'https://bitgetlimited.github.io/apidoc/en/spot',
                    'https://bitgetlimited.github.io/apidoc/en/broker',
                ],
                'fees': 'https://www.bitget.cc/zh-CN/rate?tab=1',
                'referral': 'https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j',
            },
            'api': {
                'public': {
                    'spot': {
                        'get': {
                            'public/time': 1,
                            'public/currencies': 1,
                            'public/products': 1,
                            'public/product': 1,
                            'market/ticker': 1,
                            'market/tickers': 1,
                            'market/fills': 1,
                            'market/candles': 1,
                            'market/depth': 1,
                        },
                    },
                    'mix': {
                        'get': {
                            'market/contracts': 1,
                            'market/depth': 1,
                            'market/ticker': 1,
                            'market/tickers': 1,
                            'market/fills': 1,
                            'market/candles': 1,
                            'market/index': 1,
                            'market/funding-time': 1,
                            'market/history-fundRate': 1,
                            'market/current-fundRate': 1,
                            'market/open-interest': 1,
                            'market/mark-price': 1,
                            'market/symbol-leverage': 1,
                        },
                    },
                },
                'private': {
                    'spot': {
                        'get': {
                            'account/getInfo': 20,
                            'account/assets': 2,
                            'account/transferRecords': 4,
                            'wallet/deposit-address': 4,
                            'wallet/withdrawal-inner': 4,
                            'wallet/withdrawal-list': 1,
                            'wallet/deposit-list': 1,
                        },
                        'post': {
                            'account/bills': 2,
                            'account/sub-account-spot-assets': 200,
                            'trade/orders': 2,
                            'trade/batch-orders': 4,
                            'trade/cancel-order': 2,
                            'trade/cancel-batch-orders': 4,
                            'trade/orderInfo': 1,
                            'trade/open-orders': 1,
                            'trade/history': 1,
                            'trade/fills': 1,
                            'wallet/transfer': 4,
                            'wallet/withdrawal': 4,
                            'wallet/subTransfer': 10,
                        },
                    },
                    'mix': {
                        'get': {
                            'account/account': 2,
                            'account/accounts': 2,
                            'account/open-count': 1,
                            'order/current': 2,
                            'order/history': 2,
                            'order/detail': 2,
                            'order/fills': 2,
                            'order/historyProductType': 8,
                            'order/allFills': 2,
                            'plan/currentPlan': 2,
                            'plan/historyPlan': 2,
                            'position/singlePosition': 2,
                            'position/allPosition': 2,
                            'trace/currentTrack': 2,
                            'trace/followerOrder': 2,
                            'trace/historyTrack': 2,
                            'trace/summary': 2,
                            'trace/profitSettleTokenIdGroup': 2,
                            'trace/profitDateGroupList': 2,
                            'trade/profitDateList': 2,
                            'trace/waitProfitDateList': 2,
                            'trace/traderSymbols': 2,
                            'order/marginCoinCurrent': 2,
                        },
                        'post': {
                            'account/setLeverage': 8,
                            'account/setMargin': 8,
                            'account/setMarginMode': 8,
                            'account/setPositionMode': 8,
                            'order/placeOrder': 2,
                            'order/batch-orders': 2,
                            'order/cancel-order': 2,
                            'order/cancel-all-orders': 2,
                            'order/cancel-batch-orders': 2,
                            'plan/placePlan': 2,
                            'plan/modifyPlan': 2,
                            'plan/modifyPlanPreset': 2,
                            'plan/placeTPSL': 2,
                            'plan/placePositionsTPSL': 2,
                            'plan/modifyTPSLPlan': 2,
                            'plan/cancelPlan': 2,
                            'plan/cancelAllPlan': 2,
                            'trace/closeTrackOrder': 2,
                            'trace/setUpCopySymbols': 2,
                        },
                    },
                },
            },
            'fees': {
                'spot': {
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
                'swap': {
                    'taker': this.parseNumber ('0.0006'),
                    'maker': this.parseNumber ('0.0004'),
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
                    '1': ExchangeError, // { "code": 1, "message": "System error" }
                    // undocumented
                    'failure to get a peer from the ring-balancer': ExchangeNotAvailable, // { "message": "failure to get a peer from the ring-balancer" }
                    '4010': PermissionDenied, // { "code": 4010, "message": "For the security of your funds, withdrawals are not permitted within 24 hours after changing fund password  / mobile number / Google Authenticator settings " }
                    // common
                    // '0': ExchangeError, // 200 successful,when the order placement / cancellation / operation is successful
                    '4001': ExchangeError, // no data received in 30s
                    '4002': ExchangeError, // Buffer full. cannot write data
                    // --------------------------------------------------------
                    '30001': AuthenticationError, // { "code": 30001, "message": 'request header "OK_ACCESS_KEY" cannot be blank'}
                    '30002': AuthenticationError, // { "code": 30002, "message": 'request header "OK_ACCESS_SIGN" cannot be blank'}
                    '30003': AuthenticationError, // { "code": 30003, "message": 'request header "OK_ACCESS_TIMESTAMP" cannot be blank'}
                    '30004': AuthenticationError, // { "code": 30004, "message": 'request header "OK_ACCESS_PASSPHRASE" cannot be blank'}
                    '30005': InvalidNonce, // { "code": 30005, "message": "invalid OK_ACCESS_TIMESTAMP" }
                    '30006': AuthenticationError, // { "code": 30006, "message": "invalid OK_ACCESS_KEY" }
                    '30007': BadRequest, // { "code": 30007, "message": 'invalid Content_Type, please use "application/json" format'}
                    '30008': RequestTimeout, // { "code": 30008, "message": "timestamp request expired" }
                    '30009': ExchangeError, // { "code": 30009, "message": "system error" }
                    '30010': AuthenticationError, // { "code": 30010, "message": "API validation failed" }
                    '30011': PermissionDenied, // { "code": 30011, "message": "invalid IP" }
                    '30012': AuthenticationError, // { "code": 30012, "message": "invalid authorization" }
                    '30013': AuthenticationError, // { "code": 30013, "message": "invalid sign" }
                    '30014': DDoSProtection, // { "code": 30014, "message": "request too frequent" }
                    '30015': AuthenticationError, // { "code": 30015, "message": 'request header "OK_ACCESS_PASSPHRASE" incorrect'}
                    '30016': ExchangeError, // { "code": 30015, "message": "you are using v1 apiKey, please use v1 endpoint. If you would like to use v3 endpoint, please subscribe to v3 apiKey" }
                    '30017': ExchangeError, // { "code": 30017, "message": "apikey's broker id does not match" }
                    '30018': ExchangeError, // { "code": 30018, "message": "apikey's domain does not match" }
                    '30019': ExchangeNotAvailable, // { "code": 30019, "message": "Api is offline or unavailable" }
                    '30020': BadRequest, // { "code": 30020, "message": "body cannot be blank" }
                    '30021': BadRequest, // { "code": 30021, "message": "Json data format error" }, { "code": 30021, "message": "json data format error" }
                    '30022': PermissionDenied, // { "code": 30022, "message": "Api has been frozen" }
                    '30023': BadRequest, // { "code": 30023, "message": "{0} parameter cannot be blank" }
                    '30024': BadSymbol, // {"code":30024,"message":"\"instrument_id\" is an invalid parameter"}
                    '30025': BadRequest, // { "code": 30025, "message": "{0} parameter category error" }
                    '30026': DDoSProtection, // { "code": 30026, "message": "requested too frequent" }
                    '30027': AuthenticationError, // { "code": 30027, "message": "login failure" }
                    '30028': PermissionDenied, // { "code": 30028, "message": "unauthorized execution" }
                    '30029': AccountSuspended, // { "code": 30029, "message": "account suspended" }
                    '30030': ExchangeError, // { "code": 30030, "message": "endpoint request failed. Please try again" }
                    '30031': BadRequest, // { "code": 30031, "message": "token does not exist" }
                    '30032': BadSymbol, // { "code": 30032, "message": "pair does not exist" }
                    '30033': BadRequest, // { "code": 30033, "message": "exchange domain does not exist" }
                    '30034': ExchangeError, // { "code": 30034, "message": "exchange ID does not exist" }
                    '30035': ExchangeError, // { "code": 30035, "message": "trading is not supported in this website" }
                    '30036': ExchangeError, // { "code": 30036, "message": "no relevant data" }
                    '30037': ExchangeNotAvailable, // { "code": 30037, "message": "endpoint is offline or unavailable" }
                    // '30038': AuthenticationError, // { "code": 30038, "message": "user does not exist" }
                    '30038': OnMaintenance, // {"client_oid":"","code":"30038","error_code":"30038","error_message":"Matching engine is being upgraded. Please try in about 1 minute.","message":"Matching engine is being upgraded. Please try in about 1 minute.","order_id":"-1","result":false}
                    // futures
                    '32001': AccountSuspended, // { "code": 32001, "message": "futures account suspended" }
                    '32002': PermissionDenied, // { "code": 32002, "message": "futures account does not exist" }
                    '32003': CancelPending, // { "code": 32003, "message": "canceling, please wait" }
                    '32004': ExchangeError, // { "code": 32004, "message": "you have no unfilled orders" }
                    '32005': InvalidOrder, // { "code": 32005, "message": "max order quantity" }
                    '32006': InvalidOrder, // { "code": 32006, "message": "the order price or trigger price exceeds USD 1 million" }
                    '32007': InvalidOrder, // { "code": 32007, "message": "leverage level must be the same for orders on the same side of the contract" }
                    '32008': InvalidOrder, // { "code": 32008, "message": "Max. positions to open (cross margin)" }
                    '32009': InvalidOrder, // { "code": 32009, "message": "Max. positions to open (fixed margin)" }
                    '32010': ExchangeError, // { "code": 32010, "message": "leverage cannot be changed with open positions" }
                    '32011': ExchangeError, // { "code": 32011, "message": "futures status error" }
                    '32012': ExchangeError, // { "code": 32012, "message": "futures order update error" }
                    '32013': ExchangeError, // { "code": 32013, "message": "token type is blank" }
                    '32014': ExchangeError, // { "code": 32014, "message": "your number of contracts closing is larger than the number of contracts available" }
                    '32015': ExchangeError, // { "code": 32015, "message": "margin ratio is lower than 100% before opening positions" }
                    '32016': ExchangeError, // { "code": 32016, "message": "margin ratio is lower than 100% after opening position" }
                    '32017': ExchangeError, // { "code": 32017, "message": "no BBO" }
                    '32018': ExchangeError, // { "code": 32018, "message": "the order quantity is less than 1, please try again" }
                    '32019': ExchangeError, // { "code": 32019, "message": "the order price deviates from the price of the previous minute by more than 3%" }
                    '32020': ExchangeError, // { "code": 32020, "message": "the price is not in the range of the price limit" }
                    '32021': ExchangeError, // { "code": 32021, "message": "leverage error" }
                    '32022': ExchangeError, // { "code": 32022, "message": "this function is not supported in your country or region according to the regulations" }
                    '32023': ExchangeError, // { "code": 32023, "message": "this account has outstanding loan" }
                    '32024': ExchangeError, // { "code": 32024, "message": "order cannot be placed during delivery" }
                    '32025': ExchangeError, // { "code": 32025, "message": "order cannot be placed during settlement" }
                    '32026': ExchangeError, // { "code": 32026, "message": "your account is restricted from opening positions" }
                    '32027': ExchangeError, // { "code": 32027, "message": "cancelled over 20 orders" }
                    '32028': AccountSuspended, // { "code": 32028, "message": "account is suspended and liquidated" }
                    '32029': ExchangeError, // { "code": 32029, "message": "order info does not exist" }
                    '32030': InvalidOrder, // The order cannot be cancelled
                    '32031': ArgumentsRequired, // client_oid or order_id is required.
                    '32038': AuthenticationError, // User does not exist
                    '32040': ExchangeError, // User have open contract orders or position
                    '32044': ExchangeError, // { "code": 32044, "message": "The margin ratio after submitting this order is lower than the minimum requirement ({0}) for your tier." }
                    '32045': ExchangeError, // String of commission over 1 million
                    '32046': ExchangeError, // Each user can hold up to 10 trade plans at the same time
                    '32047': ExchangeError, // system error
                    '32048': InvalidOrder, // Order strategy track range error
                    '32049': ExchangeError, // Each user can hold up to 10 track plans at the same time
                    '32050': InvalidOrder, // Order strategy rang error
                    '32051': InvalidOrder, // Order strategy ice depth error
                    '32052': ExchangeError, // String of commission over 100 thousand
                    '32053': ExchangeError, // Each user can hold up to 6 ice plans at the same time
                    '32057': ExchangeError, // The order price is zero. Market-close-all function cannot be executed
                    '32054': ExchangeError, // Trade not allow
                    '32055': InvalidOrder, // cancel order error
                    '32056': ExchangeError, // iceberg per order average should between {0}-{1} contracts
                    '32058': ExchangeError, // Each user can hold up to 6 initiative plans at the same time
                    '32059': InvalidOrder, // Total amount should exceed per order amount
                    '32060': InvalidOrder, // Order strategy type error
                    '32061': InvalidOrder, // Order strategy initiative limit error
                    '32062': InvalidOrder, // Order strategy initiative range error
                    '32063': InvalidOrder, // Order strategy initiative rate error
                    '32064': ExchangeError, // Time Stringerval of orders should set between 5-120s
                    '32065': ExchangeError, // Close amount exceeds the limit of Market-close-all (999 for BTC, and 9999 for the rest tokens)
                    '32066': ExchangeError, // You have open orders. Please cancel all open orders before changing your leverage level.
                    '32067': ExchangeError, // Account equity < required margin in this setting. Please adjust your leverage level again.
                    '32068': ExchangeError, // The margin for this position will fall short of the required margin in this setting. Please adjust your leverage level or increase your margin to proceed.
                    '32069': ExchangeError, // Target leverage level too low. Your account balance is insufficient to cover the margin required. Please adjust the leverage level again.
                    '32070': ExchangeError, // Please check open position or unfilled order
                    '32071': ExchangeError, // Your current liquidation mode does not support this action.
                    '32072': ExchangeError, // The highest available margin for your order’s tier is {0}. Please edit your margin and place a new order.
                    '32073': ExchangeError, // The action does not apply to the token
                    '32074': ExchangeError, // The number of contracts of your position, open orders, and the current order has exceeded the maximum order limit of this asset.
                    '32075': ExchangeError, // Account risk rate breach
                    '32076': ExchangeError, // Liquidation of the holding position(s) at market price will require cancellation of all pending close orders of the contracts.
                    '32077': ExchangeError, // Your margin for this asset in futures account is insufficient and the position has been taken over for liquidation. (You will not be able to place orders, close positions, transfer funds, or add margin during this period of time. Your account will be restored after the liquidation is complete.)
                    '32078': ExchangeError, // Please cancel all open orders before switching the liquidation mode(Please cancel all open orders before switching the liquidation mode)
                    '32079': ExchangeError, // Your open positions are at high risk.(Please add margin or reduce positions before switching the mode)
                    '32080': ExchangeError, // Funds cannot be transferred out within 30 minutes after futures settlement
                    '32083': ExchangeError, // The number of contracts should be a positive multiple of %%. Please place your order again
                    // token and margin trading
                    '33001': PermissionDenied, // { "code": 33001, "message": "margin account for this pair is not enabled yet" }
                    '33002': AccountSuspended, // { "code": 33002, "message": "margin account for this pair is suspended" }
                    '33003': InsufficientFunds, // { "code": 33003, "message": "no loan balance" }
                    '33004': ExchangeError, // { "code": 33004, "message": "loan amount cannot be smaller than the minimum limit" }
                    '33005': ExchangeError, // { "code": 33005, "message": "repayment amount must exceed 0" }
                    '33006': ExchangeError, // { "code": 33006, "message": "loan order not found" }
                    '33007': ExchangeError, // { "code": 33007, "message": "status not found" }
                    '33008': InsufficientFunds, // { "code": 33008, "message": "loan amount cannot exceed the maximum limit" }
                    '33009': ExchangeError, // { "code": 33009, "message": "user ID is blank" }
                    '33010': ExchangeError, // { "code": 33010, "message": "you cannot cancel an order during session 2 of call auction" }
                    '33011': ExchangeError, // { "code": 33011, "message": "no new market data" }
                    '33012': ExchangeError, // { "code": 33012, "message": "order cancellation failed" }
                    '33013': InvalidOrder, // { "code": 33013, "message": "order placement failed" }
                    '33014': OrderNotFound, // { "code": 33014, "message": "order does not exist" }
                    '33015': InvalidOrder, // { "code": 33015, "message": "exceeded maximum limit" }
                    '33016': ExchangeError, // { "code": 33016, "message": "margin trading is not open for this token" }
                    '33017': InsufficientFunds, // { "code": 33017, "message": "insufficient balance" }
                    '33018': ExchangeError, // { "code": 33018, "message": "this parameter must be smaller than 1" }
                    '33020': ExchangeError, // { "code": 33020, "message": "request not supported" }
                    '33021': BadRequest, // { "code": 33021, "message": "token and the pair do not match" }
                    '33022': InvalidOrder, // { "code": 33022, "message": "pair and the order do not match" }
                    '33023': ExchangeError, // { "code": 33023, "message": "you can only place market orders during call auction" }
                    '33024': InvalidOrder, // { "code": 33024, "message": "trading amount too small" }
                    '33025': InvalidOrder, // { "code": 33025, "message": "base token amount is blank" }
                    '33026': ExchangeError, // { "code": 33026, "message": "transaction completed" }
                    '33027': InvalidOrder, // { "code": 33027, "message": "cancelled order or order cancelling" }
                    '33028': InvalidOrder, // { "code": 33028, "message": "the decimal places of the trading price exceeded the limit" }
                    '33029': InvalidOrder, // { "code": 33029, "message": "the decimal places of the trading size exceeded the limit" }
                    '33034': ExchangeError, // { "code": 33034, "message": "You can only place limit order after Call Auction has started" }
                    '33035': ExchangeError, // This type of order cannot be canceled(This type of order cannot be canceled)
                    '33036': ExchangeError, // Exceeding the limit of entrust order
                    '33037': ExchangeError, // The buy order price should be lower than 130% of the trigger price
                    '33038': ExchangeError, // The sell order price should be higher than 70% of the trigger price
                    '33039': ExchangeError, // The limit of callback rate is 0 < x <= 5%
                    '33040': ExchangeError, // The trigger price of a buy order should be lower than the latest transaction price
                    '33041': ExchangeError, // The trigger price of a sell order should be higher than the latest transaction price
                    '33042': ExchangeError, // The limit of price variance is 0 < x <= 1%
                    '33043': ExchangeError, // The total amount must be larger than 0
                    '33044': ExchangeError, // The average amount should be 1/1000 * total amount <= x <= total amount
                    '33045': ExchangeError, // The price should not be 0, including trigger price, order price, and price limit
                    '33046': ExchangeError, // Price variance should be 0 < x <= 1%
                    '33047': ExchangeError, // Sweep ratio should be 0 < x <= 100%
                    '33048': ExchangeError, // Per order limit: Total amount/1000 < x <= Total amount
                    '33049': ExchangeError, // Total amount should be X > 0
                    '33050': ExchangeError, // Time interval should be 5 <= x <= 120s
                    '33051': ExchangeError, // cancel order number not higher limit: plan and track entrust no more than 10, ice and time entrust no more than 6
                    '33059': BadRequest, // { "code": 33059, "message": "client_oid or order_id is required" }
                    '33060': BadRequest, // { "code": 33060, "message": "Only fill in either parameter client_oid or order_id" }
                    '33061': ExchangeError, // Value of a single market price order cannot exceed 100,000 USD
                    '33062': ExchangeError, // The leverage ratio is too high. The borrowed position has exceeded the maximum position of this leverage ratio. Please readjust the leverage ratio
                    '33063': ExchangeError, // Leverage multiple is too low, there is insufficient margin in the account, please readjust the leverage ratio
                    '33064': ExchangeError, // The setting of the leverage ratio cannot be less than 2, please readjust the leverage ratio
                    '33065': ExchangeError, // Leverage ratio exceeds maximum leverage ratio, please readjust leverage ratio
                    // account
                    '21009': ExchangeError, // Funds cannot be transferred out within 30 minutes after swap settlement(Funds cannot be transferred out within 30 minutes after swap settlement)
                    '34001': PermissionDenied, // { "code": 34001, "message": "withdrawal suspended" }
                    '34002': InvalidAddress, // { "code": 34002, "message": "please add a withdrawal address" }
                    '34003': ExchangeError, // { "code": 34003, "message": "sorry, this token cannot be withdrawn to xx at the moment" }
                    '34004': ExchangeError, // { "code": 34004, "message": "withdrawal fee is smaller than minimum limit" }
                    '34005': ExchangeError, // { "code": 34005, "message": "withdrawal fee exceeds the maximum limit" }
                    '34006': ExchangeError, // { "code": 34006, "message": "withdrawal amount is lower than the minimum limit" }
                    '34007': ExchangeError, // { "code": 34007, "message": "withdrawal amount exceeds the maximum limit" }
                    '34008': InsufficientFunds, // { "code": 34008, "message": "insufficient balance" }
                    '34009': ExchangeError, // { "code": 34009, "message": "your withdrawal amount exceeds the daily limit" }
                    '34010': ExchangeError, // { "code": 34010, "message": "transfer amount must be larger than 0" }
                    '34011': ExchangeError, // { "code": 34011, "message": "conditions not met" }
                    '34012': ExchangeError, // { "code": 34012, "message": "the minimum withdrawal amount for NEO is 1, and the amount must be an integer" }
                    '34013': ExchangeError, // { "code": 34013, "message": "please transfer" }
                    '34014': ExchangeError, // { "code": 34014, "message": "transfer limited" }
                    '34015': ExchangeError, // { "code": 34015, "message": "subaccount does not exist" }
                    '34016': PermissionDenied, // { "code": 34016, "message": "transfer suspended" }
                    '34017': AccountSuspended, // { "code": 34017, "message": "account suspended" }
                    '34018': AuthenticationError, // { "code": 34018, "message": "incorrect trades password" }
                    '34019': PermissionDenied, // { "code": 34019, "message": "please bind your email before withdrawal" }
                    '34020': PermissionDenied, // { "code": 34020, "message": "please bind your funds password before withdrawal" }
                    '34021': InvalidAddress, // { "code": 34021, "message": "Not verified address" }
                    '34022': ExchangeError, // { "code": 34022, "message": "Withdrawals are not available for sub accounts" }
                    '34023': PermissionDenied, // { "code": 34023, "message": "Please enable futures trading before transferring your funds" }
                    '34026': ExchangeError, // transfer too frequently(transfer too frequently)
                    '34036': ExchangeError, // Parameter is incorrect, please refer to API documentation
                    '34037': ExchangeError, // Get the sub-account balance interface, account type is not supported
                    '34038': ExchangeError, // Since your C2C transaction is unusual, you are restricted from fund transfer. Please contact our customer support to cancel the restriction
                    '34039': ExchangeError, // You are now restricted from transferring out your funds due to abnormal trades on C2C Market. Please transfer your fund on our website or app instead to verify your identity
                    // swap
                    '35001': ExchangeError, // { "code": 35001, "message": "Contract does not exist" }
                    '35002': ExchangeError, // { "code": 35002, "message": "Contract settling" }
                    '35003': ExchangeError, // { "code": 35003, "message": "Contract paused" }
                    '35004': ExchangeError, // { "code": 35004, "message": "Contract pending settlement" }
                    '35005': AuthenticationError, // { "code": 35005, "message": "User does not exist" }
                    '35008': InvalidOrder, // { "code": 35008, "message": "Risk ratio too high" }
                    '35010': InvalidOrder, // { "code": 35010, "message": "Position closing too large" }
                    '35012': InvalidOrder, // { "code": 35012, "message": "Incorrect order size" }
                    '35014': InvalidOrder, // { "code": 35014, "message": "Order price is not within limit" }
                    '35015': InvalidOrder, // { "code": 35015, "message": "Invalid leverage level" }
                    '35017': ExchangeError, // { "code": 35017, "message": "Open orders exist" }
                    '35019': InvalidOrder, // { "code": 35019, "message": "Order size too large" }
                    '35020': InvalidOrder, // { "code": 35020, "message": "Order price too high" }
                    '35021': InvalidOrder, // { "code": 35021, "message": "Order size exceeded current tier limit" }
                    '35022': ExchangeError, // { "code": 35022, "message": "Contract status error" }
                    '35024': ExchangeError, // { "code": 35024, "message": "Contract not initialized" }
                    '35025': InsufficientFunds, // { "code": 35025, "message": "No account balance" }
                    '35026': ExchangeError, // { "code": 35026, "message": "Contract settings not initialized" }
                    '35029': OrderNotFound, // { "code": 35029, "message": "Order does not exist" }
                    '35030': InvalidOrder, // { "code": 35030, "message": "Order size too large" }
                    '35031': InvalidOrder, // { "code": 35031, "message": "Cancel order size too large" }
                    '35032': ExchangeError, // { "code": 35032, "message": "Invalid user status" }
                    '35037': ExchangeError, // No last traded price in cache
                    '35039': ExchangeError, // { "code": 35039, "message": "Open order quantity exceeds limit" }
                    '35040': InvalidOrder, // {"error_message":"Invalid order type","result":"true","error_code":"35040","order_id":"-1"}
                    '35044': ExchangeError, // { "code": 35044, "message": "Invalid order status" }
                    '35046': InsufficientFunds, // { "code": 35046, "message": "Negative account balance" }
                    '35047': InsufficientFunds, // { "code": 35047, "message": "Insufficient account balance" }
                    '35048': ExchangeError, // { "code": 35048, "message": "User contract is frozen and liquidating" }
                    '35049': InvalidOrder, // { "code": 35049, "message": "Invalid order type" }
                    '35050': InvalidOrder, // { "code": 35050, "message": "Position settings are blank" }
                    '35052': InsufficientFunds, // { "code": 35052, "message": "Insufficient cross margin" }
                    '35053': ExchangeError, // { "code": 35053, "message": "Account risk too high" }
                    '35055': InsufficientFunds, // { "code": 35055, "message": "Insufficient account balance" }
                    '35057': ExchangeError, // { "code": 35057, "message": "No last traded price" }
                    '35058': ExchangeError, // { "code": 35058, "message": "No limit" }
                    '35059': BadRequest, // { "code": 35059, "message": "client_oid or order_id is required" }
                    '35060': BadRequest, // { "code": 35060, "message": "Only fill in either parameter client_oid or order_id" }
                    '35061': BadRequest, // { "code": 35061, "message": "Invalid instrument_id" }
                    '35062': InvalidOrder, // { "code": 35062, "message": "Invalid match_price" }
                    '35063': InvalidOrder, // { "code": 35063, "message": "Invalid order_size" }
                    '35064': InvalidOrder, // { "code": 35064, "message": "Invalid client_oid" }
                    '35066': InvalidOrder, // Order interval error
                    '35067': InvalidOrder, // Time-weighted order ratio error
                    '35068': InvalidOrder, // Time-weighted order range error
                    '35069': InvalidOrder, // Time-weighted single transaction limit error
                    '35070': InvalidOrder, // Algo order type error
                    '35071': InvalidOrder, // Order total must be larger than single order limit
                    '35072': InvalidOrder, // Maximum 6 unfulfilled time-weighted orders can be held at the same time
                    '35073': InvalidOrder, // Order price is 0. Market-close-all not available
                    '35074': InvalidOrder, // Iceberg order single transaction average error
                    '35075': InvalidOrder, // Failed to cancel order
                    '35076': InvalidOrder, // LTC 20x leverage. Not allowed to open position
                    '35077': InvalidOrder, // Maximum 6 unfulfilled iceberg orders can be held at the same time
                    '35078': InvalidOrder, // Order amount exceeded 100,000
                    '35079': InvalidOrder, // Iceberg order price variance error
                    '35080': InvalidOrder, // Callback rate error
                    '35081': InvalidOrder, // Maximum 10 unfulfilled trail orders can be held at the same time
                    '35082': InvalidOrder, // Trail order callback rate error
                    '35083': InvalidOrder, // Each user can only hold a maximum of 10 unfulfilled stop-limit orders at the same time
                    '35084': InvalidOrder, // Order amount exceeded 1 million
                    '35085': InvalidOrder, // Order amount is not in the correct range
                    '35086': InvalidOrder, // Price exceeds 100 thousand
                    '35087': InvalidOrder, // Price exceeds 100 thousand
                    '35088': InvalidOrder, // Average amount error
                    '35089': InvalidOrder, // Price exceeds 100 thousand
                    '35090': ExchangeError, // No stop-limit orders available for cancelation
                    '35091': ExchangeError, // No trail orders available for cancellation
                    '35092': ExchangeError, // No iceberg orders available for cancellation
                    '35093': ExchangeError, // No trail orders available for cancellation
                    '35094': ExchangeError, // Stop-limit order last traded price error
                    '35095': BadRequest, // Instrument_id error
                    '35096': ExchangeError, // Algo order status error
                    '35097': ExchangeError, // Order status and order ID cannot exist at the same time
                    '35098': ExchangeError, // An order status or order ID must exist
                    '35099': ExchangeError, // Algo order ID error
                    // option
                    '36001': BadRequest, // Invalid underlying index.
                    '36002': BadRequest, // Instrument does not exist.
                    '36005': ExchangeError, // Instrument status is invalid.
                    '36101': AuthenticationError, // Account does not exist.
                    '36102': PermissionDenied, // Account status is invalid.
                    '36103': AccountSuspended, // Account is suspended due to ongoing liquidation.
                    '36104': PermissionDenied, // Account is not enabled for options trading.
                    '36105': PermissionDenied, // Please enable the account for option contract.
                    '36106': AccountSuspended, // Funds cannot be transferred in or out, as account is suspended.
                    '36107': PermissionDenied, // Funds cannot be transferred out within 30 minutes after option exercising or settlement.
                    '36108': InsufficientFunds, // Funds cannot be transferred in or out, as equity of the account is less than zero.
                    '36109': PermissionDenied, // Funds cannot be transferred in or out during option exercising or settlement.
                    '36201': PermissionDenied, // New order function is blocked.
                    '36202': PermissionDenied, // Account does not have permission to short option.
                    '36203': InvalidOrder, // Invalid format for client_oid.
                    '36204': ExchangeError, // Invalid format for request_id.
                    '36205': BadRequest, // Instrument id does not match underlying index.
                    '36206': BadRequest, // Order_id and client_oid can not be used at the same time.
                    '36207': InvalidOrder, // Either order price or fartouch price must be present.
                    '36208': InvalidOrder, // Either order price or size must be present.
                    '36209': InvalidOrder, // Either order_id or client_oid must be present.
                    '36210': InvalidOrder, // Either order_ids or client_oids must be present.
                    '36211': InvalidOrder, // Exceeding max batch size for order submission.
                    '36212': InvalidOrder, // Exceeding max batch size for oder cancellation.
                    '36213': InvalidOrder, // Exceeding max batch size for order amendment.
                    '36214': ExchangeError, // Instrument does not have valid bid/ask quote.
                    '36216': OrderNotFound, // Order does not exist.
                    '36217': InvalidOrder, // Order submission failed.
                    '36218': InvalidOrder, // Order cancellation failed.
                    '36219': InvalidOrder, // Order amendment failed.
                    '36220': InvalidOrder, // Order is pending cancel.
                    '36221': InvalidOrder, // Order qty is not valid multiple of lot size.
                    '36222': InvalidOrder, // Order price is breaching highest buy limit.
                    '36223': InvalidOrder, // Order price is breaching lowest sell limit.
                    '36224': InvalidOrder, // Exceeding max order size.
                    '36225': InvalidOrder, // Exceeding max open order count for instrument.
                    '36226': InvalidOrder, // Exceeding max open order count for underlying.
                    '36227': InvalidOrder, // Exceeding max open size across all orders for underlying
                    '36228': InvalidOrder, // Exceeding max available qty for instrument.
                    '36229': InvalidOrder, // Exceeding max available qty for underlying.
                    '36230': InvalidOrder, // Exceeding max position limit for underlying.
                    // --------------------------------------------------------
                    // swap
                    '400': BadRequest, // Bad Request
                    '401': AuthenticationError, // Unauthorized access
                    '403': PermissionDenied, // Access prohibited
                    '404': BadRequest, // Request address does not exist
                    '405': BadRequest, // The HTTP Method is not supported
                    '415': BadRequest, // The current media type is not supported
                    '429': DDoSProtection, // Too many requests
                    '500': ExchangeNotAvailable, // System busy
                    '1001': RateLimitExceeded, // The request is too frequent and has been throttled
                    '1002': ExchangeError, // {0} verifications within 24 hours
                    '1003': ExchangeError, // You failed more than {0} times today, the current operation is locked, please try again in 24 hours
                    // '00000': ExchangeError, // success
                    '40001': AuthenticationError, // ACCESS_KEY cannot be empty
                    '40002': AuthenticationError, // SECRET_KEY cannot be empty
                    '40003': AuthenticationError, // Signature cannot be empty
                    '40004': InvalidNonce, // Request timestamp expired
                    '40005': InvalidNonce, // Invalid ACCESS_TIMESTAMP
                    '40006': AuthenticationError, // Invalid ACCESS_KEY
                    '40007': BadRequest, // Invalid Content_Type
                    '40008': InvalidNonce, // Request timestamp expired
                    '40009': AuthenticationError, // sign signature error
                    '40010': AuthenticationError, // sign signature error
                    '40011': AuthenticationError, // ACCESS_PASSPHRASE cannot be empty
                    '40012': AuthenticationError, // apikey/password is incorrect
                    '40013': ExchangeError, // User status is abnormal
                    '40014': PermissionDenied, // Incorrect permissions
                    '40015': ExchangeError, // System is abnormal, please try again later
                    '40016': PermissionDenied, // The user must bind the phone or Google
                    '40017': ExchangeError, // Parameter verification failed
                    '40018': PermissionDenied, // Invalid IP
                    '40102': BadRequest, // Contract configuration does not exist, please check the parameters
                    '40103': BadRequest, // Request method cannot be empty
                    '40104': ExchangeError, // Lever adjustment failure
                    '40105': ExchangeError, // Abnormal access to current price limit data
                    '40106': ExchangeError, // Abnormal get next settlement time
                    '40107': ExchangeError, // Abnormal access to index price data
                    '40108': InvalidOrder, // Wrong order quantity
                    '40109': OrderNotFound, // The data of the order cannot be found, please confirm the order number
                    '40200': OnMaintenance, // Server upgrade, please try again later
                    '40201': InvalidOrder, // Order number cannot be empty
                    '40202': ExchangeError, // User information cannot be empty
                    '40203': BadRequest, // The amount of adjustment margin cannot be empty or negative
                    '40204': BadRequest, // Adjustment margin type cannot be empty
                    '40205': BadRequest, // Adjusted margin type data is wrong
                    '40206': BadRequest, // The direction of the adjustment margin cannot be empty
                    '40207': BadRequest, // The adjustment margin data is wrong
                    '40208': BadRequest, // The accuracy of the adjustment margin amount is incorrect
                    '40209': BadRequest, // The current page number is wrong, please confirm
                    '40300': ExchangeError, // User does not exist
                    '40301': PermissionDenied, // Permission has not been obtained yet. If you need to use it, please contact customer service
                    '40302': BadRequest, // Parameter abnormality
                    '40303': BadRequest, // Can only query up to 20,000 data
                    '40304': BadRequest, // Parameter type is abnormal
                    '40305': BadRequest, // Client_oid length is not greater than 50, and cannot be Martian characters
                    '40306': ExchangeError, // Batch processing orders can only process up to 20
                    '40308': OnMaintenance, // The contract is being temporarily maintained
                    '40309': BadSymbol, // The contract has been removed
                    '40400': ExchangeError, // Status check abnormal
                    '40401': ExchangeError, // The operation cannot be performed
                    '40402': BadRequest, // The opening direction cannot be empty
                    '40403': BadRequest, // Wrong opening direction format
                    '40404': BadRequest, // Whether to enable automatic margin call parameters cannot be empty
                    '40405': BadRequest, // Whether to enable the automatic margin call parameter type is wrong
                    '40406': BadRequest, // Whether to enable automatic margin call parameters is of unknown type
                    '40407': ExchangeError, // The query direction is not the direction entrusted by the plan
                    '40408': ExchangeError, // Wrong time range
                    '40409': ExchangeError, // Time format error
                    '40500': InvalidOrder, // Client_oid check error
                    '40501': ExchangeError, // Channel name error
                    '40502': ExchangeError, // If it is a copy user, you must pass the copy to whom
                    '40503': ExchangeError, // With the single type
                    '40504': ExchangeError, // Platform code must pass
                    '40505': ExchangeError, // Not the same as single type
                    '40506': AuthenticationError, // Platform signature error
                    '40507': AuthenticationError, // Api signature error
                    '40508': ExchangeError, // KOL is not authorized
                    '40509': ExchangeError, // Abnormal copy end
                    '40600': ExchangeError, // Copy function suspended
                    '40601': ExchangeError, // Followers cannot be KOL
                    '40602': ExchangeError, // The number of copies has reached the limit and cannot process the request
                    '40603': ExchangeError, // Abnormal copy end
                    '40604': ExchangeNotAvailable, // Server is busy, please try again later
                    '40605': ExchangeError, // Copy type, the copy number must be passed
                    '40606': ExchangeError, // The type of document number is wrong
                    '40607': ExchangeError, // Document number must be passed
                    '40608': ExchangeError, // No documented products currently supported
                    '40609': ExchangeError, // The contract product does not support copying
                    '40700': BadRequest, // Cursor parameters are incorrect
                    '40701': ExchangeError, // KOL is not authorized
                    '40702': ExchangeError, // Unauthorized copying user
                    '40703': ExchangeError, // Bill inquiry start and end time cannot be empty
                    '40704': ExchangeError, // Can only check the data of the last three months
                    '40705': BadRequest, // The start and end time cannot exceed 90 days
                    '40706': InvalidOrder, // Wrong order price
                    '40707': BadRequest, // Start time is greater than end time
                    '40708': BadRequest, // Parameter verification is abnormal
                    '40709': ExchangeError, // There is no position in this position, and no automatic margin call can be set
                    '40710': ExchangeError, // Abnormal account status
                    '40711': InsufficientFunds, // Insufficient contract account balance
                    '40712': InsufficientFunds, // Insufficient margin
                    '40713': ExchangeError, // Cannot exceed the maximum transferable margin amount
                    '40714': ExchangeError, // No direct margin call is allowed
                    '45110': InvalidOrder, // {"code":"45110","msg":"less than the minimum amount 5 USDT","requestTime":1669911118932,"data":null}
                    // spot
                    'invalid sign': AuthenticationError,
                    'invalid currency': BadSymbol, // invalid trading pair
                    'invalid symbol': BadSymbol,
                    'invalid period': BadRequest, // invalid Kline type
                    'invalid user': ExchangeError,
                    'invalid amount': InvalidOrder,
                    'invalid type': InvalidOrder, // {"status":"error","ts":1595700344504,"err_code":"invalid-parameter","err_msg":"invalid type"}
                    'invalid orderId': InvalidOrder,
                    'invalid record': ExchangeError,
                    'invalid accountId': BadRequest,
                    'invalid address': BadRequest,
                    'accesskey not null': AuthenticationError, // {"status":"error","ts":1595704360508,"err_code":"invalid-parameter","err_msg":"accesskey not null"}
                    'illegal accesskey': AuthenticationError,
                    'sign not null': AuthenticationError,
                    'req_time is too much difference from server time': InvalidNonce,
                    'permissions not right': PermissionDenied, // {"status":"error","ts":1595704490084,"err_code":"invalid-parameter","err_msg":"permissions not right"}
                    'illegal sign invalid': AuthenticationError, // {"status":"error","ts":1595684716042,"err_code":"invalid-parameter","err_msg":"illegal sign invalid"}
                    'user locked': AccountSuspended,
                    'Request Frequency Is Too High': RateLimitExceeded,
                    'more than a daily rate of cash': BadRequest,
                    'more than the maximum daily withdrawal amount': BadRequest,
                    'need to bind email or mobile': ExchangeError,
                    'user forbid': PermissionDenied,
                    'User Prohibited Cash Withdrawal': PermissionDenied,
                    'Cash Withdrawal Is Less Than The Minimum Value': BadRequest,
                    'Cash Withdrawal Is More Than The Maximum Value': BadRequest,
                    'the account with in 24 hours ban coin': PermissionDenied,
                    'order cancel fail': BadRequest, // {"status":"error","ts":1595703343035,"err_code":"bad-request","err_msg":"order cancel fail"}
                    'base symbol error': BadSymbol,
                    'base date error': ExchangeError,
                    'api signature not valid': AuthenticationError,
                    'gateway internal error': ExchangeError,
                    'audit failed': ExchangeError,
                    'order queryorder invalid': BadRequest,
                    'market no need price': InvalidOrder,
                    'limit need price': InvalidOrder,
                    'userid not equal to account_id': ExchangeError,
                    'your balance is low': InsufficientFunds, // {"status":"error","ts":1595594160149,"err_code":"invalid-parameter","err_msg":"invalid size, valid range: [1,2000]"}
                    'address invalid cointype': ExchangeError,
                    'system exception': ExchangeError, // {"status":"error","ts":1595711862763,"err_code":"system exception","err_msg":"system exception"}
                    '50003': ExchangeError, // No record
                    '50004': BadSymbol, // The transaction pair is currently not supported or has been suspended
                    '50006': PermissionDenied, // The account is forbidden to withdraw. If you have any questions, please contact customer service.
                    '50007': PermissionDenied, // The account is forbidden to withdraw within 24 hours. If you have any questions, please contact customer service.
                    '50008': RequestTimeout, // network timeout
                    '50009': RateLimitExceeded, // The operation is too frequent, please try again later
                    '50010': ExchangeError, // The account is abnormally frozen. If you have any questions, please contact customer service.
                    '50014': InvalidOrder, // The transaction amount under minimum limits
                    '50015': InvalidOrder, // The transaction amount exceed maximum limits
                    '50016': InvalidOrder, // The price can't be higher than the current price
                    '50017': InvalidOrder, // Price under minimum limits
                    '50018': InvalidOrder, // The price exceed maximum limits
                    '50019': InvalidOrder, // The amount under minimum limits
                    '50020': InsufficientFunds, // Insufficient balance
                    '50021': InvalidOrder, // Price is under minimum limits
                    '50026': InvalidOrder, // Market price parameter error
                    'invalid order query time': ExchangeError, // start time is greater than end time; or the time interval between start time and end time is greater than 48 hours
                    'invalid start time': BadRequest, // start time is a date 30 days ago; or start time is a date in the future
                    'invalid end time': BadRequest, // end time is a date 30 days ago; or end time is a date in the future
                    '20003': ExchangeError, // operation failed, {"status":"error","ts":1595730308979,"err_code":"bad-request","err_msg":"20003"}
                    '01001': ExchangeError, // order failed, {"status":"fail","err_code":"01001","err_msg":"系统异常，请稍后重试"}
                    '43111': PermissionDenied, // {"code":"43111","msg":"参数错误 address not in address book","requestTime":1665394201164,"data":null}
                },
                'broad': {
                    'invalid size, valid range': ExchangeError,
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
                'JADE': 'Jade Protocol',
            },
            'options': {
                'timeframes': {
                    'spot': {
                        '1m': '1m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
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
                'defaultType': 'spot', // 'spot', 'swap'
                'defaultSubType': 'linear', // 'linear', 'inverse'
                'createMarketBuyOrderRequiresPrice': true,
                'broker': 'p4sve',
                'withdraw': {
                    'fillResponseFromRequest': true,
                },
                'sandboxMode': false,
            },
        });
    }

    setSandboxMode (enabled) {
        this.options['sandboxMode'] = enabled;
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bitget#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicSpotGetPublicTime (params);
        //
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645837773501,
        //       data: '1645837773501'
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitget#fetchMarkets
         * @description retrieves data on all markets for bitget
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
        let types = this.safeValue (this.options, 'fetchMarkets', [ 'spot', 'swap' ]);
        if (sandboxMode) {
            types = [ 'swap' ];
        }
        let promises = [];
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if (type === 'swap') {
                let subTypes = undefined;
                if (sandboxMode) {
                    // the following are simulated trading markets [ 'sumcbl', 'sdmcbl', 'scmcbl' ];
                    subTypes = [ 'sumcbl', 'sdmcbl', 'scmcbl' ];
                } else {
                    subTypes = [ 'umcbl', 'dmcbl', 'cmcbl' ];
                }
                for (let j = 0; j < subTypes.length; j++) {
                    promises.push (this.fetchMarketsByType (type, this.extend (params, {
                        'productType': subTypes[j],
                    })));
                }
            } else {
                promises.push (this.fetchMarketsByType (types[i], params));
            }
        }
        promises = await Promise.all (promises);
        let result = promises[0];
        for (let i = 1; i < promises.length; i++) {
            result = this.arrayConcat (result, promises[i]);
        }
        return result;
    }

    parseMarkets (markets) {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push (this.parseMarket (markets[i]));
        }
        return result;
    }

    parseMarket (market) {
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
        //        pricePlace: '1'
        //    }
        //
        const marketId = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteCoin');
        const baseId = this.safeString (market, 'baseCoin');
        const quote = this.safeCurrencyCode (quoteId);
        const base = this.safeCurrencyCode (baseId);
        const supportMarginCoins = this.safeValue (market, 'supportMarginCoins', []);
        const settleId = this.safeString (supportMarginCoins, 0);
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        const parts = marketId.split ('_');
        const typeId = this.safeString (parts, 1);
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
            pricePrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'priceScale')));
            amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityScale')));
        } else {
            const expiryString = this.safeString (parts, 2);
            if (expiryString !== undefined) {
                const year = '20' + expiryString.slice (0, 2);
                const month = expiryString.slice (2, 4);
                const day = expiryString.slice (4, 6);
                expiryDatetime = year + '-' + month + '-' + day + 'T00:00:00Z';
                expiry = this.parse8601 (expiryDatetime);
                type = 'future';
                future = true;
                symbol = symbol + ':' + settle + '-' + expiryString;
            } else {
                type = 'swap';
                swap = true;
                symbol = symbol + ':' + settle;
            }
            contract = true;
            linear = (typeId === 'UMCBL') || (typeId === 'CMCBL') || (typeId === 'SUMCBL') || (typeId === 'SCMCBL');
            inverse = !linear;
            const priceDecimals = this.safeInteger (market, 'pricePlace');
            const amountDecimals = this.safeInteger (market, 'volumePlace');
            const priceStep = this.safeString (market, 'priceEndStep');
            const amountStep = this.safeString (market, 'minTradeNum');
            const precisePrice = new Precise (priceStep);
            precisePrice.decimals = Math.max (precisePrice.decimals, priceDecimals);
            precisePrice.reduce ();
            const priceString = precisePrice.toString ();
            pricePrecision = this.parseNumber (priceString);
            const preciseAmount = new Precise (amountStep);
            preciseAmount.decimals = Math.max (preciseAmount.decimals, amountDecimals);
            preciseAmount.reduce ();
            const amountString = preciseAmount.toString ();
            amountPrecision = this.parseNumber (amountString);
        }
        const status = this.safeString (market, 'status');
        let active = undefined;
        if (status !== undefined) {
            active = status === 'online';
        }
        let minCost = undefined;
        if (quote === 'USDT') {
            minCost = this.safeNumber (market, 'minTradeUSDT');
        }
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
            'taker': this.safeNumber (market, 'takerFeeRate'),
            'maker': this.safeNumber (market, 'makerFeeRate'),
            'contractSize': this.safeNumber (market, 'sizeMultiplier'),
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
                    'min': this.safeNumber2 (market, 'minTradeNum', 'minTradeAmount'),
                    'max': this.safeNumber (market, 'maxTradeAmount'),
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

    async fetchMarketsByType (type, params = {}) {
        const method = this.getSupportedMapping (type, {
            'spot': 'publicSpotGetPublicProducts',
            'swap': 'publicMixGetMarketContracts',
        });
        const response = await this[method] (params);
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
        const data = this.safeValue (response, 'data', []);
        return this.parseMarkets (data);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitget#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicSpotGetPublicCurrencies (params);
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
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString (entry, 'coinId');
            const code = this.safeCurrencyCode (this.safeString (entry, 'coinName'));
            const chains = this.safeValue (entry, 'chains', []);
            const networks = {};
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const network = this.safeCurrencyCode (networkId);
                const withdrawEnabled = this.safeString (chain, 'withdrawable');
                const depositEnabled = this.safeString (chain, 'rechargeable');
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'minWithdrawAmount'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'minDepositAmount'),
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'withdraw': withdrawEnabled === 'true',
                    'deposit': depositEnabled === 'true',
                    'fee': this.safeNumber (chain, 'withdrawFee'),
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

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchDeposits
         * @description fetch all deposits made to an account
         * @url https://bitgetlimited.github.io/apidoc/en/spot/#get-deposit-list
         * @param {string|undefined} code unified currency code
         * @param {int} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {string|undefined} params.pageNo pageNo default 1
         * @param {string|undefined} params.pageSize pageSize default 20. Max 100
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a `code` argument');
        }
        const currency = this.currency (code);
        if (since === undefined) {
            since = this.milliseconds () - 31556952000; // 1yr
        }
        const request = {
            'coin': currency['code'],
            'startTime': since,
            'endTime': this.milliseconds (),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateSpotGetWalletDepositList (this.extend (request, params));
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
        const rawTransactions = this.safeValue (response, 'data', []);
        return this.parseTransactions (rawTransactions, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitget#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {string} params.chain the chain to withdraw to
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        this.checkAddress (address);
        const chain = this.safeString (params, 'chain');
        if (chain === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a chain parameter');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['code'],
            'address': address,
            'chain': chain,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privateSpotPostWalletWithdrawal (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "data": "888291686266343424"
        //     }
        //
        const result = {
            'id': this.safeString (response, 'data'),
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
        const withdrawOptions = this.safeValue (this.options, 'withdraw', {});
        const fillResponseFromRequest = this.safeValue (withdrawOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            result['currency'] = code;
            result['timestamp'] = this.milliseconds ();
            result['datetime'] = this.iso8601 (this.milliseconds ());
            result['amount'] = amount;
            result['tag'] = tag;
            result['address'] = address;
            result['addressTo'] = address;
            result['network'] = chain;
        }
        return result;
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @url https://bitgetlimited.github.io/apidoc/en/spot/#get-withdraw-list
         * @param {string|undefined} code unified currency code
         * @param {int} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {string|undefined} params.pageNo pageNo default 1
         * @param {string|undefined} params.pageSize pageSize default 20. Max 100
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a `code` argument');
        }
        const currency = this.currency (code);
        if (since === undefined) {
            since = this.milliseconds () - 31556952000; // 1yr
        }
        const request = {
            'coin': currency['code'],
            'startTime': since,
            'endTime': this.milliseconds (),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateSpotGetWalletWithdrawalList (this.extend (request, params));
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
        const rawTransactions = this.safeValue (response, 'data', []);
        return this.parseTransactions (rawTransactions, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
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
        const timestamp = this.safeInteger (transaction, 'cTime');
        const networkId = this.safeString (transaction, 'chain');
        const currencyId = this.safeString (transaction, 'coin');
        const status = this.safeString (transaction, 'status');
        return {
            'id': this.safeString (transaction, 'id'),
            'info': transaction,
            'txid': this.safeString (transaction, 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': networkId,
            'addressFrom': undefined,
            'address': this.safeString (transaction, 'toAddress'),
            'addressTo': this.safeString (transaction, 'toAddress'),
            'amount': this.safeNumber (transaction, 'amount'),
            'type': this.safeString (transaction, 'type'),
            'currency': this.safeCurrencyCode (currencyId),
            'status': this.parseTransactionStatus (status),
            'updated': this.safeNumber (transaction, 'uTime'),
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'success': 'ok',
            'Pending': 'pending',
            'pending_review': 'pending',
            'pending_review_fail': 'failed',
            'reject': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name bitget#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['code'],
        };
        const response = await this.privateSpotGetWalletDepositAddress (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //    {
        //        "address": "1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv",
        //        "chain": "BTC-Bitcoin",
        //        "coin": "BTC",
        //        "tag": "",
        //        "url": "https://btc.com/1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv"
        //    }
        //
        const currencyId = this.safeString (depositAddress, 'coin');
        const networkId = this.safeString (depositAddress, 'chain');
        return {
            'currency': this.safeCurrencyCode (currencyId, currency),
            'address': this.safeString (depositAddress, 'address'),
            'tag': this.safeString (depositAddress, 'tag'),
            'network': networkId,
            'info': depositAddress,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderBook', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicSpotGetMarketDepth',
            'swap': 'publicMixGetMarketDepth',
        });
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, query));
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
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp);
    }

    parseTicker (ticker, market = undefined) {
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
        let marketId = this.safeString (ticker, 'symbol');
        if ((market === undefined) && (marketId !== undefined) && (marketId.indexOf ('_') === -1)) {
            // fetchTickers fix:
            // spot symbol are different from the "request id"
            // so we need to convert it to the exchange-specific id
            // otherwise we will not be able to find the market
            marketId = marketId + '_SPBL';
        }
        const symbol = this.safeSymbol (marketId, market);
        const high = this.safeString (ticker, 'high24h');
        const low = this.safeString (ticker, 'low24h');
        const close = this.safeString2 (ticker, 'close', 'last');
        const quoteVolume = this.safeString2 (ticker, 'quoteVol', 'quoteVolume');
        const baseVolume = this.safeString2 (ticker, 'baseVol', 'baseVolume');
        const timestamp = this.safeInteger2 (ticker, 'ts', 'timestamp');
        const datetime = this.iso8601 (timestamp);
        const bid = this.safeString2 (ticker, 'buyOne', 'bestBid');
        const ask = this.safeString2 (ticker, 'sellOne', 'bestAsk');
        const percentage = Precise.stringMul (this.safeString (ticker, 'priceChangePercent'), '100');
        return this.safeTicker ({
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

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTicker', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicSpotGetMarketTicker',
            'swap': 'publicMixGetMarketTicker',
        });
        const response = await this[method] (this.extend (request, query));
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
        const data = this.safeValue (response, 'data');
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-all-tickers
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-all-symbol-ticker
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue (symbols, 0);
            market = this.market (symbol);
        }
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        const method = this.getSupportedMapping (type, {
            'spot': 'publicSpotGetMarketTickers',
            'swap': 'publicMixGetMarketTickers',
        });
        const request = {};
        if (method === 'publicMixGetMarketTickers') {
            const defaultSubType = this.safeString (this.options, 'defaultSubType');
            request['productType'] = (defaultSubType === 'linear') ? 'UMCBL' : 'DMCBL';
        }
        const response = await this[method] (this.extend (request, params));
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
        const data = this.safeValue (response, 'data');
        return this.parseTickers (data, symbols);
    }

    parseTrade (trade, market = undefined) {
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
        //         accountId: '6394957606',
        //         symbol: 'LTCUSDT_SPBL',
        //         orderId: '864752115272552448',
        //         fillId: '864752115685969921',
        //         orderType: 'limit',
        //         side: 'buy',
        //         fillPrice: '127.92000000',
        //         fillQuantity: '0.10000000',
        //         fillTotalAmount: '12.79200000',
        //         feeCcy: 'LTC',
        //         fees: '0.00000000',
        //         cTime: '1641898891373'
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
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString2 (trade, 'tradeId', 'fillId');
        const order = this.safeString (trade, 'orderId');
        const side = this.safeString (trade, 'side');
        const price = this.safeString2 (trade, 'fillPrice', 'price');
        let amount = this.safeString2 (trade, 'fillQuantity', 'size');
        amount = this.safeString (trade, 'sizeQty', amount);
        let timestamp = this.safeInteger2 (trade, 'fillTime', 'timestamp');
        timestamp = this.safeInteger (trade, 'cTime', timestamp);
        let fee = undefined;
        const feeAmount = this.safeString (trade, 'fees');
        const type = this.safeString (trade, 'orderType');
        if (feeAmount !== undefined) {
            const currencyCode = this.safeCurrencyCode (this.safeString (trade, 'feeCcy'));
            fee = {
                'code': currencyCode, // kept here for backward-compatibility, but will be removed soon
                'currency': currencyCode,
                'cost': feeAmount,
            };
        }
        const datetime = this.iso8601 (timestamp);
        return this.safeTrade ({
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

    async fetchTrades (symbol, limit = undefined, since = undefined, params = {}) {
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicSpotGetMarketFills',
            'swap': 'publicMixGetMarketFills',
        });
        const response = await this[method] (this.extend (request, query));
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
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicSpotGetPublicProduct (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', {});
        return this.parseTradingFee (data, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitget#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicSpotGetPublicProducts (params);
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
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const feeInfo = data[i];
            const fee = this.parseTradingFee (feeInfo);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    parseTradingFee (data, market = undefined) {
        const marketId = this.safeString (data, 'symbol');
        return {
            'info': data,
            'symbol': this.safeSymbol (marketId, market),
            'maker': this.safeNumber (data, 'makerFeeRate'),
            'taker': this.safeNumber (data, 'takerFeeRate'),
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m') {
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
            this.safeInteger2 (ohlcv, 0, 'ts'),
            this.safeNumber2 (ohlcv, 1, 'open'),
            this.safeNumber2 (ohlcv, 2, 'high'),
            this.safeNumber2 (ohlcv, 3, 'low'),
            this.safeNumber2 (ohlcv, 4, 'close'),
            this.safeNumber2 (ohlcv, 5, 'baseVol'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOHLCV', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicSpotGetMarketCandles',
            'swap': 'publicMixGetMarketCandles',
        });
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'until', 'till' ]);
        if (limit === undefined) {
            limit = 100;
        }
        if (market['type'] === 'spot') {
            request['period'] = this.options['timeframes']['spot'][timeframe];
            request['limit'] = limit;
            if (since !== undefined) {
                request['after'] = since;
                if (until === undefined) {
                    const millisecondsPerTimeframe = this.options['timeframes']['swap'][timeframe] * 1000;
                    request['before'] = this.sum (since, millisecondsPerTimeframe * limit);
                }
            }
            if (until !== undefined) {
                request['before'] = until;
            }
        } else if (market['type'] === 'swap') {
            request['granularity'] = this.options['timeframes']['swap'][timeframe];
            const duration = this.parseTimeframe (timeframe);
            const now = this.milliseconds ();
            if (since === undefined) {
                request['startTime'] = now - (limit - 1) * (duration * 1000);
                request['endTime'] = now;
            } else {
                request['startTime'] = this.sum (since, duration * 1000);
                if (until !== undefined) {
                    request['endTime'] = until;
                } else {
                    request['endTime'] = this.sum (since, limit * duration * 1000);
                }
            }
        }
        const response = await this[method] (this.extend (request, query));
        //  [ ["1645911960000","39406","39407","39374.5","39379","35.526","1399132.341"] ]
        const data = this.safeValue (response, 'data', response);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bitget#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateSpotGetAccountAssets',
            'swap': 'privateMixGetAccountAccounts',
        });
        const request = {};
        if (marketType === 'swap') {
            const defaultSubType = this.safeString (this.options, 'defaultSubType');
            request['productType'] = (defaultSubType === 'linear') ? 'UMCBL' : 'DMCBL';
        }
        const response = await this[method] (this.extend (request, query));
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
        const data = this.safeValue (response, 'data');
        return this.parseBalance (data);
    }

    parseBalance (balance) {
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
            const currencyId = this.safeString2 (entry, 'coinId', 'marginCoin');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const frozen = this.safeString (entry, 'frozen');
            const locked = this.safeString2 (entry, 'lock', 'locked');
            account['used'] = Precise.stringAdd (frozen, locked);
            account['free'] = this.safeString (entry, 'available');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'init': 'open',
            'full_fill': 'closed',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
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
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const id = this.safeString (order, 'orderId');
        const price = this.safeString2 (order, 'price', 'executePrice');
        const amount = this.safeString2 (order, 'quantity', 'size');
        const filled = this.safeString2 (order, 'fillQuantity', 'filledQty');
        const cost = this.safeString2 (order, 'fillTotalAmount', 'filledAmount');
        const average = this.safeString2 (order, 'fillPrice', 'priceAvg');
        const type = this.safeString (order, 'orderType');
        const timestamp = this.safeInteger (order, 'cTime');
        let side = this.safeString2 (order, 'side', 'posSide');
        if ((side === 'open_long') || (side === 'close_short')) {
            side = 'buy';
        } else if ((side === 'close_long') || (side === 'open_short')) {
            side = 'sell';
        }
        const clientOrderId = this.safeString2 (order, 'clientOrderId', 'clientOid');
        const fee = undefined;
        const rawStatus = this.safeString2 (order, 'status', 'state');
        const status = this.parseOrderStatus (rawStatus);
        const lastTradeTimestamp = this.safeInteger (order, 'uTime');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': this.safeNumber (order, 'triggerPrice'),
            'triggerPrice': this.safeNumber (order, 'triggerPrice'),
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

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitget#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        const request = {
            'symbol': market['id'],
            'orderType': type,
        };
        const isMarketOrder = type === 'market';
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const isStopLossOrder = stopLossPrice !== undefined;
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        const isStopOrder = isStopLossOrder || isTakeProfitOrder;
        if (this.sum (isTriggerOrder, isStopLossOrder, isTakeProfitOrder) > 1) {
            throw new ExchangeError (this.id + ' createOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice');
        }
        if ((type === 'limit') && (triggerPrice === undefined)) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateSpotPostTradeOrders',
            'swap': 'privateMixPostOrderPlaceOrder',
        });
        const exchangeSpecificParam = this.safeString2 (params, 'force', 'timeInForceValue');
        const postOnly = this.isPostOnly (isMarketOrder, exchangeSpecificParam === 'post_only', params);
        if (marketType === 'spot') {
            if (isStopOrder) {
                throw new InvalidOrder (this.id + ' createOrder() does not support stop orders on spot markets, only swap markets');
            }
            const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
            if (createMarketBuyOrderRequiresPrice && isMarketOrder && (side === 'buy')) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                } else {
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    const cost = this.parseNumber (Precise.stringMul (amountString, priceString));
                    request['quantity'] = this.priceToPrecision (symbol, cost);
                }
            } else {
                request['quantity'] = this.amountToPrecision (symbol, amount);
            }
            if (clientOrderId !== undefined) {
                request['clientOrderId'] = clientOrderId;
            }
            request['side'] = side;
            if (postOnly) {
                request['force'] = 'post_only';
            } else {
                request['force'] = 'gtc';
            }
        } else {
            if (clientOrderId !== undefined) {
                request['clientOid'] = clientOrderId;
            }
            request['size'] = this.amountToPrecision (symbol, amount);
            if (postOnly) {
                request['timeInForceValue'] = 'post_only';
            }
            const reduceOnly = this.safeValue (params, 'reduceOnly', false);
            if (triggerPrice !== undefined) {
                // default triggerType to market price for unification
                const triggerType = this.safeString (params, 'triggerType', 'market_price');
                request['triggerType'] = triggerType;
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                request['executePrice'] = this.priceToPrecision (symbol, price);
                method = 'privateMixPostPlanPlacePlan';
            }
            if (isStopOrder) {
                if (!isMarketOrder) {
                    throw new ExchangeError (this.id + ' createOrder() bitget stopLoss or takeProfit orders must be market orders');
                }
                if (isStopLossOrder) {
                    request['triggerPrice'] = this.priceToPrecision (symbol, stopLossPrice);
                    request['planType'] = 'loss_plan';
                } else if (isTakeProfitOrder) {
                    request['triggerPrice'] = this.priceToPrecision (symbol, takeProfitPrice);
                    request['planType'] = 'profit_plan';
                }
                request['holdSide'] = (side === 'buy') ? 'long' : 'short';
                method = 'privateMixPostPlanPlaceTPSL';
            } else {
                if (reduceOnly) {
                    request['side'] = (side === 'buy') ? 'close_short' : 'close_long';
                } else {
                    request['side'] = (side === 'buy') ? 'open_long' : 'open_short';
                }
            }
            request['marginCoin'] = market['settleId'];
        }
        const omitted = this.omit (query, [ 'stopPrice', 'triggerType', 'stopLossPrice', 'takeProfitPrice', 'postOnly' ]);
        const response = await this[method] (this.extend (request, omitted));
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
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument for spot orders');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateSpotPostTradeCancelOrder',
            'swap': 'privateMixPostOrderCancelOrder',
        });
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const stop = this.safeValue (params, 'stop');
        if (stop) {
            const planType = this.safeString (params, 'planType');
            if (planType === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a planType parameter for stop orders, either normal_plan, profit_plan or loss_plan');
            }
            request['planType'] = planType;
            method = 'privateMixPostPlanCancelPlan';
            params = this.omit (params, [ 'stop', 'planType' ]);
        }
        if (marketType === 'swap') {
            request['marginCoin'] = market['settleId'];
        }
        const response = await this[method] (this.extend (request, query));
        return this.parseOrder (response, market);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const type = this.safeString (params, 'type', market['type']);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " cancelOrders() requires a type parameter (one of 'spot', 'swap').");
        }
        params = this.omit (params, 'type');
        const request = {};
        let method = undefined;
        if (type === 'spot') {
            method = 'apiPostOrderOrdersBatchcancel';
            request['method'] = 'batchcancel';
            const jsonIds = this.json (ids);
            const parts = jsonIds.split ('"');
            request['order_ids'] = parts.join ('');
        } else if (type === 'swap') {
            method = 'privateMixPostOrderCancelBatchOrders';
            request['symbol'] = market['id'];
            request['marginCoin'] = market['quote'];
            request['orderIds'] = ids;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     spot
        //
        //     {
        //         "status": "ok",
        //         "data": {
        //             "success": [
        //                 "673451224205135872",
        //             ],
        //             "failed": [
        //                 {
        //                 "err-msg": "invalid record",
        //                 "order-id": "673451224205135873",
        //                 "err-code": "base record invalid"
        //                 }
        //             ]
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

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelAllOrders
         * @description cancel all open orders
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#cancel-all-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#cancel-all-trigger-order-tpsl
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @param {string} params.code marginCoin unified currency code
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let defaultSubType = this.safeString (this.options, 'defaultSubType');
        if (symbol !== undefined) {
            market = this.market (symbol);
            defaultSubType = (market['linear']) ? 'linear' : 'inverse';
        }
        const productType = (defaultSubType === 'linear') ? 'UMCBL' : 'DMCBL';
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        if (marketType === 'spot') {
            throw new NotSupported (this.id + ' cancelAllOrders () does not support spot markets');
        }
        const request = {
            'productType': productType,
        };
        let method = undefined;
        const stop = this.safeValue (params, 'stop');
        const planType = this.safeString (params, 'planType');
        if (stop !== undefined || planType !== undefined) {
            if (planType === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a planType parameter for stop orders, either normal_plan, profit_plan, loss_plan, pos_profit, pos_loss, moving_plan or track_plan');
            }
            method = 'privateMixPostPlanCancelAllPlan';
            params = this.omit (params, [ 'stop' ]);
        } else {
            const code = this.safeString2 (params, 'code', 'marginCoin');
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelAllOrders () requires a code argument [marginCoin] in the params');
            }
            const currency = this.currency (code);
            request['marginCoin'] = this.safeCurrencyCode (code, currency);
            method = 'privateMixPostOrderCancelAllOrders';
        }
        params = this.omit (query, [ 'code', 'marginCoin' ]);
        const response = await this[method] (this.extend (request, params));
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateSpotPostTradeOrderInfo',
            'swap': 'privateMixGetOrderDetail',
        });
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this[method] (this.extend (request, query));
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
        const data = this.safeValue (response, 'data');
        const first = this.safeValue (data, 0, data);
        return this.parseOrder (first, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const request = {
            'symbol': market['id'],
        };
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateSpotPostTradeOpenOrders',
            'swap': 'privateMixGetOrderCurrent',
        });
        const stop = this.safeValue (params, 'stop');
        if (stop) {
            method = 'privateMixGetPlanCurrentPlan';
            params = this.omit (params, 'stop');
        }
        const response = await this[method] (this.extend (request, query));
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
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        const request = {
            'symbol': market['id'],
        };
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateSpotPostTradeHistory',
            'swap': 'privateMixGetOrderHistory',
        });
        if (marketType === 'swap') {
            if (limit === undefined) {
                limit = 100;
            }
            request['pageSize'] = limit;
            if (since === undefined) {
                since = 0;
            }
            request['startTime'] = since;
            request['endTime'] = this.milliseconds ();
        }
        const response = await this[method] (this.extend (request, query));
        //
        //  spot
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645925335553,
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
        //           status: 'full_fill',
        //           fillPrice: '39000.000000000000',
        //           fillQuantity: '0.000700000000',
        //           fillTotalAmount: '27.300000000000',
        //           cTime: '1645921460972'
        //         }
        //       ]
        //     }
        //
        // swap
        //     {
        //       code: '00000',
        //       msg: 'success',
        //       requestTime: 1645925688701,
        //       data: {
        //         nextFlag: false,
        //         endId: '881640729145409536',
        //         orderList: [
        //           {
        //             symbol: 'BTCUSDT_UMCBL',
        //             size: 0.001,
        //             orderId: '881640729145409536',
        //             clientOid: '881640729204129792',
        //             filledQty: 0.001,
        //             fee: 0,
        //             price: null,
        //             priceAvg: 38429.5,
        //             state: 'filled',
        //             side: 'open_long',
        //             timeInForce: 'normal',
        //             totalProfits: 0,
        //             posSide: 'long',
        //             marginCoin: 'USDT',
        //             filledAmount: 38.4295,
        //             orderType: 'market',
        //             cTime: '1645925450611',
        //             uTime: '1645925450746'
        //           }
        //         ]
        //       }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const orderList = this.safeValue (data, 'orderList', data);
        return this.parseOrders (orderList, market, since, limit);
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['coinId'] = currency['id'];
        }
        const response = await this.privateSpotPostAccountBills (this.extend (request, params));
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
        const data = this.safeValue (response, 'data');
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntry (item, currency = undefined) {
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
        const id = this.safeString (item, 'billId');
        const currencyId = this.safeString (item, 'coinId');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.parseNumber (Precise.stringAbs (this.safeString (item, 'quantity')));
        const timestamp = this.safeInteger (item, 'cTime');
        const bizType = this.safeString (item, 'bizType');
        let direction = undefined;
        if (bizType !== undefined && bizType.indexOf ('-') >= 0) {
            const parts = bizType.split ('-');
            direction = parts[1];
        }
        const type = this.safeString (item, 'groupType');
        const fee = this.safeNumber (item, 'fees');
        const after = this.safeNumber (item, 'balance');
        return {
            'info': item,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['swap']) {
            throw new BadSymbol (this.id + ' fetchMyTrades() only supports spot markets');
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateSpotPostTradeFills (this.extend (request, params));
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
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateSpotPostTradeFills',
            'swap': 'privateMixGetOrderFills',
        });
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this[method] (this.extend (request, query));
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
        const data = this.safeValue (response, 'data');
        return await this.parseTrades (data, market, since, limit);
    }

    async fetchPosition (symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
        };
        const response = await this.privateMixGetPositionSinglePosition (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', []);
        return this.parsePositions (data);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const defaultSubType = this.safeString (this.options, 'defaultSubType');
        const request = {
            'productType': (defaultSubType === 'linear') ? 'UMCBL' : 'DMCBL',
        };
        const response = await this.privateMixGetPositionAllPosition (this.extend (request, params));
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
        const position = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < position.length; i++) {
            result.push (this.parsePosition (position[i]));
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    parsePosition (position, market = undefined) {
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
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (position, 'cTime');
        let marginMode = this.safeString (position, 'marginMode');
        let collateral = undefined;
        let initialMargin = undefined;
        const unrealizedPnl = this.safeString (position, 'unrealizedPL');
        const rawCollateral = this.safeString (position, 'margin');
        if (marginMode === 'fixed') {
            marginMode = 'isolated';
            collateral = Precise.stringAdd (rawCollateral, unrealizedPnl);
        } else if (marginMode === 'crossed') {
            marginMode = 'cross';
            initialMargin = rawCollateral;
        }
        const holdMode = this.safeString (position, 'holdMode');
        let hedged = undefined;
        if (holdMode === 'double_hold') {
            hedged = true;
        } else if (holdMode === 'single_hold') {
            hedged = false;
        }
        const side = this.safeString (position, 'holdSide');
        const leverage = this.safeString (position, 'leverage');
        const contractSizeNumber = this.safeValue (market, 'contractSize');
        const contractSize = this.numberToString (contractSizeNumber);
        const baseAmount = this.safeString (position, 'total');
        const entryPrice = this.safeString (position, 'averageOpenPrice');
        const maintenanceMarginPercentage = this.safeString (position, 'keepMarginRate');
        const openNotional = Precise.stringMul (entryPrice, baseAmount);
        if (initialMargin === undefined) {
            initialMargin = Precise.stringDiv (openNotional, leverage);
        }
        const contracts = this.parseNumber (Precise.stringDiv (baseAmount, contractSize));
        const markPrice = this.safeString (position, 'marketPrice');
        const notional = Precise.stringMul (baseAmount, markPrice);
        const initialMarginPercentage = Precise.stringDiv (initialMargin, notional);
        let liquidationPrice = this.parseNumber (this.omitZero (this.safeString (position, 'liquidationPrice')));
        const calcTakerFeeRate = '0.0006';
        const calcTakerFeeMult = '0.9994';
        if ((liquidationPrice === undefined) && (marginMode === 'isolated') && Precise.stringGt (baseAmount, '0')) {
            let signedMargin = Precise.stringDiv (rawCollateral, baseAmount);
            let signedMmp = maintenanceMarginPercentage;
            if (side === 'short') {
                signedMargin = Precise.stringNeg (signedMargin);
                signedMmp = Precise.stringNeg (signedMmp);
            }
            let mmrMinusOne = Precise.stringSub ('1', signedMmp);
            let numerator = Precise.stringSub (entryPrice, signedMargin);
            if (side === 'long') {
                mmrMinusOne = Precise.stringMul (mmrMinusOne, calcTakerFeeMult);
            } else {
                numerator = Precise.stringMul (numerator, calcTakerFeeMult);
            }
            liquidationPrice = Precise.stringDiv (numerator, mmrMinusOne);
        }
        const feeToClose = Precise.stringMul (notional, calcTakerFeeRate);
        const maintenanceMargin = Precise.stringAdd (Precise.stringMul (maintenanceMarginPercentage, notional), feeToClose);
        const marginRatio = Precise.stringDiv (maintenanceMargin, collateral);
        const percentage = Precise.stringMul (Precise.stringDiv (unrealizedPnl, initialMargin, 4), '100');
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'notional': this.parseNumber (notional),
            'marginMode': marginMode,
            'liquidationPrice': this.parseNumber (liquidationPrice),
            'entryPrice': this.parseNumber (entryPrice),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'percentage': this.parseNumber (percentage),
            'contracts': contracts,
            'contractSize': contractSizeNumber,
            'markPrice': this.parseNumber (markPrice),
            'side': side,
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'maintenanceMargin': this.parseNumber (maintenanceMargin),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentage),
            'collateral': this.parseNumber (collateral),
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'leverage': this.parseNumber (leverage),
            'marginRatio': this.parseNumber (marginRatio),
        };
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'pageSize': limit, // default 20
            // 'pageNo': 1,
            // 'nextPage': false,
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.publicMixGetMarketHistoryFundRate (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId, market);
            const timestamp = this.safeInteger (entry, 'settleTime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeString (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicMixGetMarketCurrentFundRate (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', {});
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "fundingRate": "-0.000182"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
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

    async modifyMarginHelper (symbol, amount, type, params = {}) {
        await this.loadMarkets ();
        const holdSide = this.safeString (params, 'holdSide');
        const market = this.market (symbol);
        const marginCoin = (market['linear']) ? market['quote'] : market['base'];
        const request = {
            'symbol': market['id'],
            'marginCoin': marginCoin,
            'amount': this.amountToPrecision (symbol, amount), // positive value for adding margin, negative for reducing
            'holdSide': holdSide, // long or short
        };
        params = this.omit (params, 'holdSide');
        const response = await this.privateMixPostAccountSetMargin (this.extend (request, params));
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
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
        });
    }

    parseMarginModification (data, market = undefined) {
        const errorCode = this.safeString (data, 'code');
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

    async reduceMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name bitget#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#reduce-margin-structure}
         */
        if (amount > 0) {
            throw new BadRequest (this.id + ' reduceMargin() amount parameter must be a negative value');
        }
        const holdSide = this.safeString (params, 'holdSide');
        if (holdSide === undefined) {
            throw new ArgumentsRequired (this.id + ' reduceMargin() requires a holdSide parameter, either long or short');
        }
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    async addMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name bitget#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#add-margin-structure}
         */
        const holdSide = this.safeString (params, 'holdSide');
        if (holdSide === undefined) {
            throw new ArgumentsRequired (this.id + ' addMargin() requires a holdSide parameter, either long or short');
        }
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async fetchLeverage (symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchLeverage
         * @description fetch the set leverage for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/en/latest/manual.html#leverage-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicMixGetMarketSymbolLeverage (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652347673483,
        //         "data": {
        //             "symbol": "BTCUSDT_UMCBL",
        //             "minLeverage": "1",
        //             "maxLeverage": "125"
        //         }
        //     }
        //
        return response;
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'leverage': leverage,
            // 'holdSide': 'long',
        };
        return await this.privateMixPostAccountSetLeverage (this.extend (request, params));
    }

    async setMarginMode (marginMode, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bitget api endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase ();
        if ((marginMode !== 'fixed') && (marginMode !== 'crossed')) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() marginMode must be "fixed" or "crossed"');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'marginMode': marginMode,
        };
        return await this.privateMixPostAccountSetMarginMode (this.extend (request, params));
    }

    async setPositionMode (hedged, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setPositionMode
         * @description set hedged to true or false for a market
         * @param {bool} hedged set to true to use dualSidePosition
         * @param {string|undefined} symbol not used by binance setPositionMode ()
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} response from the exchange
         *
         */
        const productType = this.safeString (params, 'productType');
        if ((productType === undefined) && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' setPositionMode() requires a symbol or the productType parameter');
        }
        await this.loadMarkets ();
        const holdMode = hedged ? 'double_hold' : 'single_hold';
        const request = {
            'holdMode': holdMode,
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['productType'] = market['linear'] ? 'umcbl' : 'dmcbl';
        }
        const response = await this.privateMixPostAccountSetPositionMode (this.extend (request, params));
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

    async fetchOpenInterest (symbol, params = {}) {
        /**
         * @method
         * @name bitget#fetchOpenInterest
         * @description Retrieves the open interest of a currency
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-open-interest
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/en/latest/manual.html#interest-history-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicMixGetMarketOpenInterest (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', {});
        return this.parseOpenInterest (data, market);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name bitget#transfer
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the bitget api endpoint
         *
         * EXCHANGE SPECIFIC PARAMS
         * @param {string} params.clientOid custom id
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const fromSwap = fromAccount === 'swap';
        const toSwap = toAccount === 'swap';
        const usdt = currency['code'] === 'USDT';
        if (fromSwap) {
            fromAccount = usdt ? 'mix_usdt' : 'mix_usd';
        } else if (toSwap) {
            toAccount = usdt ? 'mix_usdt' : 'mix_usd';
        }
        const request = {
            'fromType': fromAccount,
            'toType': toAccount,
            'amount': amount,
            'coin': currency['info']['coinName'],
        };
        const response = await this.privateSpotPostWalletTransfer (this.extend (request, params));
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": 1668119107154,
        //        "data": "SUCCESS"
        //    }
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": 1668119107154,
        //        "data": "SUCCESS"
        //    }
        //
        const timestamp = this.safeInteger (transfer, 'requestTime');
        const msg = this.safeString (transfer, 'msg');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeString (currency, 'code'),
            'amount': this.safeNumber (transfer, 'size'),
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': (msg === 'success') ? 'ok' : msg,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseOpenInterest (interest, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "amount": "130818.967",
        //         "timestamp": "1663399151127"
        //     }
        //
        const timestamp = this.safeInteger (interest, 'timestamp');
        const id = this.safeString (interest, 'symbol');
        const symbol = this.safeSymbol (id, market);
        const amount = this.safeNumber (interest, 'amount');
        return {
            'symbol': symbol,
            'openInterestAmount': amount,
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
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
        const message = this.safeString (response, 'err_msg');
        const errorCode = this.safeString2 (response, 'code', 'err_code');
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        const nonZeroErrorCode = (errorCode !== undefined) && (errorCode !== '00000');
        if (nonZeroErrorCode) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        if (nonZeroErrorCode || nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const signed = api[0] === 'private';
        const endpoint = api[1];
        const pathPart = (endpoint === 'spot') ? '/api/spot/v1' : '/api/mix/v1';
        const request = '/' + this.implodeParams (path, params);
        const payload = pathPart + request;
        let url = this.implodeHostname (this.urls['api'][endpoint]) + payload;
        const query = this.omit (params, this.extractParams (path));
        if (!signed && (method === 'GET')) {
            const keys = Object.keys (query);
            const keysLength = keys.length;
            if (keysLength > 0) {
                url = url + '?' + this.urlencode (query);
            }
        }
        if (signed) {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + method + payload;
            if (method === 'POST') {
                body = this.json (params);
                auth += body;
            } else {
                if (Object.keys (params).length) {
                    const query = '?' + this.urlencode (this.keysort (params));
                    url += query;
                    auth += query;
                }
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            const broker = this.safeString (this.options, 'broker');
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
};
