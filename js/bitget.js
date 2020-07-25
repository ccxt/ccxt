'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, NotSupported, BadSymbol } = require ('./base/errors');
const { TICK_SIZE, DECIMAL_PLACES, TRUNCATE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitget extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitget',
            'name': 'BITGET',
            'countries': [ 'SG' ],
            'version': 'v3',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'pro': false,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'hostname': 'bitget.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/88317935-a8a21c80-cd22-11ea-8e2b-4b9fac5975eb.jpg',
                'api': {
                    'data': 'https://api.{hostname}',
                    'api': 'https://api.{hostname}',
                    'capi': 'https://capi.{hostname}',
                    'swap': 'https://capi.{hostname}',
                },
                'www': 'https://www.bitget.com',
                'doc': [
                    'https://bitgetlimited.github.io/apidoc/en/swap',
                    'https://bitgetlimited.github.io/apidoc/en/spot',
                ],
                'fees': 'https://www.bitget.cc/zh-CN/rate?tab=1',
                'test': {
                    'rest': 'https://testnet.bitget.com',
                },
            },
            'api': {
                'data': {
                    'get': [
                        'market/history/kline', // Kline data
                        'market/detail/merged', // Get aggregated ticker
                        'market/tickers', // Get all trading tickers
                        'market/allticker', // Get all trading market method 2
                        'market/depth', // Get Market Depth Data
                        'market/trade', // Get Trade Detail Data
                        'market/history/trade', // Get record of trading
                        'market/detail', // Get Market Detail 24h Volume
                        'common/symbols', // Query all trading pairs and accuracy supported in the station
                        'common/currencys', // Query all currencies supported in the station
                        'common/timestamp', // Query system current time
                    ],
                },
                'api': {
                    'get': [
                        'account/accounts', // Get all accounts of current user(即account_id)。
                        'accounts/{account_id}/balance', // Get the balance of the specified account
                        'order/orders', // Query current order, history order
                        'order/deposit_withdraw', // Query assets history
                    ],
                    'post': [
                        'order/orders/place', // Place order
                        'order/orders/{order_id}/submitcancel', // Request to cancel an order request
                        'order/orders/batchcancel', // Bulk order cancellation
                        'order/orders/{order_id}', // Query an order details
                        'order/orders/{order_id}/matchresults', // Query the transaction details of an order
                        'order/matchresults', // Query current order, order history
                    ],
                },
                'capi': {
                    'get': [
                        'market/time',
                        'market/contracts',
                        'market/depth',
                        'market/tickers',
                        'market/ticker',
                        'market/trades',
                        'market/candles',
                        'market/index',
                        'market/open_interest',
                        'market/price_limit',
                        'market/funding_time',
                        'market/historical_funding_rate',
                        'market/mark_price',
                        'market/open_count',
                    ],
                },
                'swap': {
                    'get': [
                        'account/accounts',
                        'account/account',
                        'account/settings',
                        'position/allPosition',
                        'position/singlePosition',
                        'position/holds',
                        'order/detail',
                        'order/orders',
                        'order/fills',
                        'order/currentPlan',
                        'order/historyPlan',
                    ],
                    'post': [
                        'account/leverage',
                        'account/adjustMargin',
                        'account/modifyAutoAppendMargin',
                        'order/placeOrder',
                        'order/batchOrders',
                        'order/cancel_order',
                        'order/cancel_batch_orders',
                        'order/plan_order',
                        'order/cancel_plan',
                    ],
                },
            },
            'fees': {
                'spot': {
                    'taker': 0.002,
                    'maker': 0.002,
                },
                'swap': {
                    'taker': 0.0006,
                    'maker': 0.0004,
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
                    '32028': ExchangeError, // { "code": 32028, "message": "account is suspended and liquidated" }
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
                    '36103': PermissionDenied, // Account is suspended due to ongoing liquidation.
                    '36104': PermissionDenied, // Account is not enabled for options trading.
                    '36105': PermissionDenied, // Please enable the account for option contract.
                    '36106': PermissionDenied, // Funds cannot be transferred in or out, as account is suspended.
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
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'fetchMarkets': [
                    'spot',
                    'swap',
                ],
                'parseOHLCV': {
                    'volume': {
                        'spot': 'amount',
                        'swap': 5,
                    },
                },
                'defaultType': 'swap', // 'spot', 'swap'
                'accountId': undefined, // '1012838157',
                'timeframes': {
                    'spot': {
                        '1m': '1min',
                        '5m': '5min',
                        '15m': '15min',
                        '30m': '30min',
                        '1h': '60min',
                        '2h': '120min',
                        '4h': '240min',
                        '6h': '360min',
                        '12h': '720min',
                        '1d': '1day',
                        '1w': '1week',
                    },
                    'swap': {
                        '1m': '60',
                        '5m': '300',
                        '15m': '900',
                        '30m': '1800',
                        '1h': '3600',
                        '2h': '7200',
                        '4h': '14400',
                        '6h': '21600',
                        '12h': '43200',
                        '1d': '86400',
                        '1w': '604800',
                    },
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.dataGetCommonTimestamp (params);
        //
        //     {
        //         "status":"ok",
        //         "data":"1595525139400"
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchMarkets (params = {}) {
        let types = this.safeValue (this.options, 'fetchMarkets');
        if (!types.length) {
            types = [
                this.options['defaultType'],
            ];
        }
        let result = [];
        for (let i = 0; i < types.length; i++) {
            const markets = await this.fetchMarketsByType (types[i], params);
            result = this.arrayConcat (result, markets);
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
        //     {
        //         "base_currency":"btc",
        //         "quote_currency":"usdt",
        //         "symbol":"btc_usdt",
        //         "tick_size":"2",
        //         "size_increment":"4",
        //         "status":"1",
        //         "base_asset_precision":"8"
        //     }
        //
        //
        // swap
        //
        //     {
        //         "symbol":"btcusd",
        //         "underlying_index":"BTC",
        //         "quote_currency":"USD",
        //         "coin":"BTC",
        //         "contract_val":"1",
        //         "listing":null,
        //         "delivery":["07:00:00","15:00:00","23:00:00"],
        //         "size_increment":"0",
        //         "tick_size":"1",
        //         "forwardContractFlag":false,
        //         "priceEndStep":5
        //     }
        //
        const id = this.safeString (market, 'symbol');
        let marketType = 'spot';
        let spot = true;
        let swap = false;
        const baseId = this.safeString2 (market, 'base_currency', 'coin');
        const quoteId = this.safeString (market, 'quote_currency');
        const contractVal = this.safeFloat (market, 'contract_val');
        if (contractVal !== undefined) {
            marketType = 'swap';
            spot = false;
            swap = true;
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = id.toUpperCase ();
        if (spot) {
            symbol = base + '/' + quote;
        }
        const lotSize = this.safeFloat2 (market, 'lot_size', 'trade_increment');
        const tick_size = this.safeFloat (market, 'tick_size');
        const newtick_size = parseFloat ('1e-' + this.numberToString (tick_size));
        const precision = {
            'amount': this.safeFloat (market, 'size_increment', lotSize),
            'price': newtick_size,
        };
        const minAmount = this.safeFloat2 (market, 'min_size', 'base_min_size');
        const status = this.safeString (market, 'status');
        let active = undefined;
        if (status !== undefined) {
            active = (status === '1');
        }
        const fees = this.safeValue2 (this.fees, marketType, 'trading', {});
        return this.extend (fees, {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'type': marketType,
            'spot': spot,
            'swap': swap,
            'active': active,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': minAmount,
                    'max': undefined,
                },
                'price': {
                    'min': precision['price'],
                    'max': undefined,
                },
                'cost': {
                    'min': precision['price'],
                    'max': undefined,
                },
            },
        });
    }

    amountToPrecision (symbol, amount) {
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    async fetchMarketsByType (type, params = {}) {
        if (type === 'spot') {
            const response = await this.dataGetCommonSymbols (params);
            //
            //     {
            //         "status":"ok",
            //         "ts":1595526622408,
            //         "data":[
            //             {
            //                 "base_currency":"btc",
            //                 "quote_currency":"usdt",
            //                 "symbol":"btc_usdt",
            //                 "tick_size":"2",
            //                 "size_increment":"4",
            //                 "status":"1",
            //                 "base_asset_precision":"8"
            //             },
            //         ]
            //     }
            //
            const data = this.safeValue (response, 'data', []);
            return this.parseMarkets (data);
        } else if (type === 'swap') {
            const response = await this.capiGetMarketContracts (params);
            //
            //     {
            //         "data":{
            //             "contractApis":[
            //                 {
            //                     "instrument_id":"btcusd",
            //                     "underlying_index":"BTC",
            //                     "quote_currency":"USD",
            //                     "coin":"BTC",
            //                     "contract_val":"1",
            //                     "delivery":["07:00:00","15:00:00","23:00:00"],
            //                     "size_increment":"0",
            //                     "tick_size":"1",
            //                     "forwardContractFlag":false,
            //                     "priceEndStep":"5"
            //                 },
            //             ]
            //         },
            //         "status":"ok",
            //         "err_code":"00000"
            //     }
            //
            return this.parseMarkets (response);
        } else {
            throw new NotSupported (this.id + ' fetchMarketsByType does not support market type ' + type);
        }
    }

    async fetchCurrencies (params = {}) {
        const response = await this.dataGetCommonCurrencys (params);
        //
        //     {
        //         "status":"ok",
        //         "ts":1595537740466,
        //         "data":[
        //             "btc",
        //             "bft",
        //             "usdt",
        //             "usdt-omni",
        //             "usdt-erc20"
        //         ]
        //     }
        //
        const result = {};
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': id,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'fee': undefined, // todo: redesign
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'dataGetMarketDepth';
            request['type'] = 'step0'; // step0, step1, step2, step3, step4, step5, do not merge depth if step0
        } else if (market['swap']) {
            method = 'capiGetMarketDepth';
            request['limit'] = (limit === undefined) ? 100 : limit; // max 100
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "ch":"market.btc_usdt.depth.step0",
        //         "ts":1595607628197,
        //         "data":{
        //             "id":"1595607628197",
        //             "ts":"1595607628197",
        //             "bids":[
        //                 ["9534.99","15.36160000000000000000"],
        //                 ["9534.85","0.14580000000000000000"],
        //                 ["9534.73","0.02100000000000000000"],
        //             ],
        //             "asks":[
        //                 ["9535.02","7.37160000000000000000"],
        //                 ["9535.03","0.09040000000000000000"],
        //                 ["9535.05","0.02180000000000000000"],
        //             ]
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "asks":[
        //             ["9579.0","119865",1],
        //             ["9579.5","90069",1],
        //             ["9580.0","256673",1],
        //         ],
        //         "bids":[
        //             ["9578.5","2417",1],
        //             ["9577.5","3024",1],
        //             ["9577.0","21548",1],
        //         ],
        //         "timestamp":"1595664767349"
        //     }
        //
        const data = this.safeValue (response, 'data', response);
        const timestamp = this.safeInteger2 (data, 'timestamp', 'ts');
        const nonce = this.safeInteger (data, 'id');
        const orderbook = this.parseOrderBook (data, timestamp);
        orderbook['nonce'] = nonce;
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        //
        // spot
        //
        //     fetchTicker
        //
        //     {
        //         "id":"1595538241113",
        //         "bid":["0.028474000000","1.139400000000"],
        //         "ask":["0.028482000000","0.353100000000"],
        //         "amount":"2850.6649",
        //         "count":"818",
        //         "open":"0.02821",
        //         "close":"0.028474",
        //         "low":"0.02821",
        //         "high":"0.029091",
        //         "vol":"79.4548693404"
        //     }
        //
        //     fetchTickers
        //
        //     {
        //         "amount":"30086.8095",
        //         "count":"22450",
        //         "open":"9525.11",
        //         "close":"9591.81",
        //         "low":"9510.68",
        //         "high":"9659.7",
        //         "vol":"286239092.250461",
        //         "symbol":"btc_usdt"
        //     }
        //
        // swap
        //
        //     {
        //         "instrument_id":"btcusd",
        //         "last":"9574.5",
        //         "best_ask":"9575.0",
        //         "best_bid":"9574.0",
        //         "high_24h":"9672",
        //         "low_24h":"9512",
        //         "volume_24h":"567697050",
        //         "timestamp":"1595538450096"
        //     }
        //
        const timestamp = this.safeInteger2 (ticker, 'timestamp', 'id');
        let symbol = undefined;
        const marketId = this.safeString2 (ticker, 'instrument_id', 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        } else if (marketId !== undefined) {
            const parts = marketId.split ('_');
            const numParts = parts.length;
            if (numParts === 2) {
                const [ baseId, quoteId ] = parts;
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            } else {
                symbol = marketId;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat2 (ticker, 'last', 'close');
        const open = this.safeFloat (ticker, 'open');
        let bidVolume = undefined;
        let askVolume = undefined;
        let bid = this.safeValue (ticker, 'bid');
        if (bid === undefined) {
            bid = this.safeFloat (ticker, 'best_bid');
        } else {
            bidVolume = this.safeFloat (bid, 1);
            bid = this.safeFloat (bid, 0);
        }
        let ask = this.safeValue (ticker, 'ask');
        if (ask === undefined) {
            ask = this.safeFloat (ticker, 'best_ask');
        } else {
            askVolume = this.safeFloat (ask, 1);
            ask = this.safeFloat (ask, 0);
        }
        const baseVolume = this.safeFloat2 (ticker, 'amount', 'volume_24h');
        const quoteVolume = this.safeFloat (ticker, 'vol');
        let vwap = undefined;
        if ((baseVolume !== undefined) && (quoteVolume !== undefined)) {
            vwap = quoteVolume / baseVolume;
        }
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if ((last !== undefined) && (open !== undefined)) {
            change = last - open;
            percentage = change / open * 100;
            average = this.sum (open, last) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat2 (ticker, 'high', 'high_24h'),
            'low': this.safeFloat2 (ticker, 'low', 'low_24h'),
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        if (market['spot']) {
            method = 'dataGetMarketDetailMerged';
        } else if (market['swap']) {
            method = 'capiGetMarketTicker';
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "ch":"market.eth_btc.detail.merged",
        //         "ts":1595538241474,
        //         "data":{
        //             "id":"1595538241113",
        //             "bid":["0.028474000000","1.139400000000"],
        //             "ask":["0.028482000000","0.353100000000"],
        //             "amount":"2850.6649",
        //             "count":"818",
        //             "open":"0.02821",
        //             "close":"0.028474",
        //             "low":"0.02821",
        //             "high":"0.029091",
        //             "vol":"79.4548693404"
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "symbol":"btcusd",
        //         "last":"9575.5",
        //         "best_ask":"9576.0",
        //         "best_bid":"9575.0",
        //         "high_24h":"9646",
        //         "low_24h":"9516",
        //         "volume_24h":"516656839",
        //         "timestamp":"1595664217405"
        //     }
        //
        const data = this.safeValue (response, 'data', response);
        return this.parseTicker (data, market);
    }

    async fetchTickersByType (type, symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let method = undefined;
        if (type === 'spot') {
            method = 'dataGetMarketTickers';
        } else if (type === 'swap') {
            method = 'capiGetMarketTickers';
        }
        const response = await this[method] (params);
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "ts":1595542893250,
        //         "data":[
        //             {
        //                 "amount":"30086.8095",
        //                 "count":"22450",
        //                 "open":"9525.11",
        //                 "close":"9591.81",
        //                 "low":"9510.68",
        //                 "high":"9659.7",
        //                 "vol":"286239092.250461",
        //                 "symbol":"btc_usdt"
        //             }
        //         ]
        //     }
        //
        // swap
        //
        //     [
        //         {
        //             "symbol":"btcusd",
        //             "last":"9572",
        //             "best_ask":"9571.5",
        //             "best_bid":"9570.5",
        //             "high_24h":"9646",
        //             "low_24h":"9516",
        //             "volume_24h":"515401635",
        //             "timestamp":"1595664479952"
        //         }
        //     ]
        //
        const data = this.safeValue (response, 'data', response);
        let timestamp = undefined;
        if (!Array.isArray (response)) {
            timestamp = this.safeInteger (response, 'ts');
        }
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (this.extend ({
                'timestamp': timestamp,
            }, data[i]));
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        return await this.fetchTickersByType (type, symbols, this.omit (params, 'type'));
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     spot
        //
        //     {
        //         "id":"1",
        //         "price":"9533.81",
        //         "amount":"0.7326",
        //         "direction":"sell",
        //         "ts":"1595604964000"
        //     }
        //
        //     swap
        //
        //     {
        //         "trade_id":"670581881367954915",
        //         "price":"9553.00",
        //         "size":"20",
        //         "side":"sell",
        //         "timestamp":"1595605100004",
        //         "symbol":"btcusd"
        //     }
        //
        // fetchOrderTrades (private)
        //
        //     futures trades, swap trades
        //
        //         {
        //             "trade_id":"197429674631450625",
        //             "instrument_id":"EOS-USD-SWAP",
        //             "order_id":"6a-7-54d663a28-0",
        //             "price":"3.633",
        //             "order_qty":"1.0000",
        //             "fee":"-0.000551",
        //             "created_at":"2019-03-21T04:41:58.0Z", // missing in swap trades
        //             "timestamp":"2019-03-25T05:56:31.287Z", // missing in futures trades
        //             "exec_type":"M", // whether the order is taker or maker
        //             "side":"short", // "buy" in futures trades
        //         }
        //
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        let base = undefined;
        let quote = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        } else if (marketId !== undefined) {
            const parts = marketId.split ('-');
            const numParts = parts.length;
            if (numParts === 2) {
                const [ baseId, quoteId ] = parts;
                base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            } else {
                symbol = marketId.toUpperCase ();
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        const timestamp = this.safeInteger2 (trade, 'timestamp', 'ts');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat2 (trade, 'size', 'amount');
        let takerOrMaker = this.safeString2 (trade, 'exec_type', 'liquidity');
        if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        }
        const side = this.safeString2 (trade, 'side', 'direction');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        const feeCost = this.safeFloat (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = (side === 'buy') ? base : quote;
            fee = {
                // fee is either a positive number (invitation rebate)
                // or a negative number (transaction fee deduction)
                // therefore we need to invert the fee
                // more about it https://github.com/ccxt/ccxt/issues/5909
                'cost': -feeCost,
                'currency': feeCurrency,
            };
        }
        const orderId = this.safeString (trade, 'order_id');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'trade_id'),
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, limit = undefined, since = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'dataGetMarketHistoryTrade';
        } else if (market['swap']) {
            method = 'capiGetMarketTrades';
        }
        if (market['spot']) {
            if (limit !== undefined) {
                request['size'] = limit; // default 1, max 2000
            }
        } else if (market['swap']) {
            if (limit === undefined) {
                limit = 100; // default 20, max 100
            }
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "ch":"market.btc_usdt.trade.detail",
        //         "ts":1595604968430,
        //         "data":{
        //             "ts":"1595604964000",
        //             "data":[
        //                 {"id":"1","price":"9533.81","amount":"0.7326","direction":"sell","ts":"1595604964000"},
        //                 {"id":"2","price":"9533.67","amount":"1.1591","direction":"buy","ts":"1595604961000"},
        //                 {"id":"3","price":"9533.67","amount":"1.5022","direction":"sell","ts":"1595604959000"},
        //             ]
        //         }
        //     }
        //
        // swap
        //
        //     [
        //         {"trade_id":"670833198971748613","price":"9578.50","size":"5412","side":"sell","timestamp":"1595665018790","symbol":"btcusd"},
        //         {"trade_id":"670833194240574915","price":"9579.00","size":"3972","side":"buy","timestamp":"1595665017662","symbol":"btcusd"},
        //         {"trade_id":"670833194240573915","price":"9579.00","size":"1227","side":"buy","timestamp":"1595665017662","symbol":"btcusd"},
        //     ]
        //
        let trades = undefined;
        if (Array.isArray (response)) {
            trades = response;
        } else {
            const data = this.safeValue (response, 'data', {});
            trades = this.safeValue2 (data, 'data', []);
        }
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m') {
        //
        // spot
        //
        //     {
        //         "id":"1594694700000",
        //         "amount":"283.6811",
        //         "count":"234",
        //         "open":"9230.00",
        //         "close":"9227.15",
        //         "low":"9206.66",
        //         "high":"9232.33",
        //         "vol":"2618015.032504000000"
        //     }
        //
        // swap
        //
        //     [
        //         "1594693800000",
        //         "9240",
        //         "9241",
        //         "9222",
        //         "9228.5",
        //         "3913370",
        //         "424.003616350563"
        //     ]
        //
        const options = this.safeValue (this.options, 'parseOHLCV', {});
        const volume = this.safeValue (options, 'volume', {});
        if (Array.isArray (ohlcv)) {
            const volumeIndex = this.safeString (volume, market['type'], 'amount');
            return [
                this.safeInteger (ohlcv, 0),         // timestamp
                this.safeFloat (ohlcv, 1),           // Open
                this.safeFloat (ohlcv, 2),           // High
                this.safeFloat (ohlcv, 3),           // Low
                this.safeFloat (ohlcv, 4),           // Close
                // this.safeFloat (ohlcv, 5),        // Quote Volume
                // this.safeFloat (ohlcv, 6),        // Base Volume
                this.safeFloat (ohlcv, volumeIndex), // Volume, bitget will return base volume in the 7th element for future markets
            ];
        } else {
            const volumeIndex = this.safeValue (volume, market['type'], 6);
            return [
                this.safeInteger (ohlcv, 'id'),
                this.safeFloat (ohlcv, 'open'),      // Open
                this.safeFloat (ohlcv, 'high'),      // High
                this.safeFloat (ohlcv, 'low'),       // Low
                this.safeFloat (ohlcv, 'close'),     // Close
                this.safeFloat (ohlcv, volumeIndex), // Base Volume
            ];
        }
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        const type = market['type'];
        const options = this.safeValue (this.options, 'timeframes', {});
        const intervals = this.safeValue (options, type, {});
        const interval = this.safeValue (intervals, this.timeframes[timeframe]);
        if (market['spot']) {
            method = 'dataGetMarketHistoryKline';
            request['period'] = interval;
            if (limit !== undefined) {
                request['size'] = limit; // default 150, max 1000
            }
        } else if (market['swap']) {
            const duration = this.parseTimeframe (timeframe);
            method = 'capiGetMarketCandles';
            request['granularity'] = interval;
            const now = this.milliseconds ();
            if (since === undefined) {
                if (limit === undefined) {
                    limit = 1000;
                }
                request['start'] = this.iso8601 (now - limit * duration * 1000);
                request['end'] = this.iso8601 (now);
            } else {
                request['start'] = this.iso8601 (since);
                if (limit === undefined) {
                    request['end'] = this.iso8601 (now);
                } else {
                    request['end'] = this.iso8601 (this.sum (since, limit * duration * 1000));
                }
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "ch":"market.btc_usdt.kline.15min",
        //         "ts":1595594183874,
        //         "data":[
        //             {"id":"1594694700000","amount":"283.6811","count":"234","open":"9230.00","close":"9227.15","low":"9206.66","high":"9232.33","vol":"2618015.032504000000"},
        //             {"id":"1594695600000","amount":"457.2904","count":"238","open":"9227.15","close":"9229.46","low":"9223.80","high":"9235.14","vol":"4220734.684570000000"},
        //             {"id":"1594696500000","amount":"501.2353","count":"255","open":"9229.46","close":"9227.78","low":"9222.69","high":"9230.74","vol":"4625779.185006000000"},
        //         ]
        //     }
        //
        // swap
        //
        //     [
        //         ["1594764900000","9255.5","9261","9251","9255.5","3958946","427.742307964305"],
        //         ["1594765800000","9255.5","9264","9252","9258","3609496","389.832756058107"],
        //         ["1594766700000","9258","9260","9244.5","9250.5","3738600","403.97870345085"],
        //     ]
        //
        let candles = response;
        if (!Array.isArray (response)) {
            candles = this.safeValue (response, 'data', []);
        }
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseSpotBalance (response) {
        //
        //     {
        //         "status":"ok",
        //         "ts":1595681450932,
        //         "data":{
        //             "list":[
        //                 {"balance":"0.0000000000000000","currency":"BTC","type":"trade"},
        //                 {"balance":"0.0000000000000000","currency":"BTC","type":"frozen"},
        //                 {"balance":"0.0000000000000000","currency":"BTC","type":"lock"},
        //             ],
        //             "id":"7420922606",
        //             "type":"spot",
        //             "state":"working"
        //         }
        //     }
        //
        const result = { 'info': response };
        const data = this.safeValue (response, 'data');
        const balances = this.safeValue (data, 'list');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            if (!(code in result)) {
                const account = this.account ();
                result[code] = account;
            }
            const type = this.safeValue (balance, 'type');
            if (type === 'trade') {
                result[code]['free'] = this.safeFloat (balance, 'balance');
            } else if ((type === 'frozen') || (type === 'lock')) {
                const used = this.safeFloat (result[code], 'used');
                result[code]['used'] = this.sum (used, this.safeFloat (balance, 'balance'));
            }
        }
        return this.parseBalance (result);
    }

    parseSwapBalance (response) {
        //
        // swap
        //
        //     [
        //         {"equity":"0","fixed_balance":"0","total_avail_balance":"0","margin":"0","realized_pnl":"0","unrealized_pnl":"0","symbol":"bchusd","margin_frozen":"0","timestamp":"1595673431547","margin_mode":"fixed","forwardContractFlag":false},
        //         {"equity":"0","fixed_balance":"0","total_avail_balance":"0","margin":"0","realized_pnl":"0","unrealized_pnl":"0","symbol":"ethusd","margin_frozen":"0","timestamp":"1595673431573","margin_mode":"fixed","forwardContractFlag":false},
        //         {"equity":"0","fixed_balance":"0","total_avail_balance":"0","margin":"0","realized_pnl":"0","unrealized_pnl":"0","symbol":"cmt_btcsusdt","margin_frozen":"0","timestamp":"1595673431577","margin_mode":"fixed","forwardContractFlag":true},
        //     ]
        //
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const marketId = this.safeString (balance, 'symbol');
            let symbol = marketId;
            if (marketId in this.markets_by_id) {
                symbol = this.markets_by_id[marketId]['symbol'];
            }
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeFloat (balance, 'equity');
            account['free'] = this.safeFloat (balance, 'total_avail_balance');
            result[symbol] = account;
        }
        return this.parseBalance (result);
    }

    async fetchAccounts (params = {}) {
        const request = {
            'method': 'accounts',
        };
        const response = await this.apiGetAccountAccounts (this.extend (request, params));
        //
        //     {
        //         "status":"ok",
        //         "ts":1595679591824,
        //         "data":[
        //             {"id":"7420922606","type":"spot","state":"working"}
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const accountId = this.safeString (account, 'id');
            const type = this.safeStringLower (account, 'type');
            result.push ({
                'id': accountId,
                'type': type,
                'currency': undefined,
                'info': account,
            });
        }
        return result;
    }

    async findAccountByType (type) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountsByType = this.groupBy (this.accounts, 'type');
        const accounts = this.safeValue (accountsByType, type);
        if (accounts === undefined) {
            throw new ExchangeError (this.id + " findAccountByType() could not find an accountId with type '" + type + "', specify the 'accountId' parameter instead"); // eslint-disable-line quotes
        }
        const numAccounts = accounts.length;
        if (numAccounts > 1) {
            throw new ExchangeError (this.id + " findAccountByType() found more than one accountId with type '" + type + "', specify the 'accountId' parameter instead"); // eslint-disable-line quotes
        }
        return accounts[0];
    }

    async getAccountId (params) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeString (this.options, 'accountId');
        const accountId = this.safeString (params, 'accountId', defaultAccountId);
        if (accountId !== undefined) {
            return accountId;
        }
        const defaultType = this.safeString (this.options, 'defaultType', 'margin');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " requires an 'accountId' parameter");
        }
        const account = await this.findAccountByType (type);
        return account['id'];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchBalance requires a 'type' parameter, one of 'spot', 'swap'");
        }
        let method = undefined;
        const query = this.omit (params, 'type');
        if (type === 'spot') {
            const accountId = await this.getAccountId (params);
            method = 'apiGetAccountsAccountIdBalance';
            query['account_id'] = accountId;
            query['method'] = 'balance';
        } else if (type === 'swap') {
            method = 'swapGetAccountAccounts';
        }
        const response = await this[method] (query);
        //
        // spot
        //
        //     {
        //         "status":"ok",
        //         "ts":1595681450932,
        //         "data":{
        //             "list":[
        //                 {"balance":"0.0000000000000000","currency":"BTC","type":"trade"},
        //                 {"balance":"0.0000000000000000","currency":"BTC","type":"frozen"},
        //                 {"balance":"0.0000000000000000","currency":"BTC","type":"lock"},
        //             ],
        //             "id":"7420922606",
        //             "type":"spot",
        //             "state":"working"
        //         }
        //     }
        //
        // swap
        //
        //     [
        //         {"equity":"0","fixed_balance":"0","total_avail_balance":"0","margin":"0","realized_pnl":"0","unrealized_pnl":"0","symbol":"bchusd","margin_frozen":"0","timestamp":"1595673431547","margin_mode":"fixed","forwardContractFlag":false},
        //         {"equity":"0","fixed_balance":"0","total_avail_balance":"0","margin":"0","realized_pnl":"0","unrealized_pnl":"0","symbol":"ethusd","margin_frozen":"0","timestamp":"1595673431573","margin_mode":"fixed","forwardContractFlag":false},
        //         {"equity":"0","fixed_balance":"0","total_avail_balance":"0","margin":"0","realized_pnl":"0","unrealized_pnl":"0","symbol":"cmt_btcsusdt","margin_frozen":"0","timestamp":"1595673431577","margin_mode":"fixed","forwardContractFlag":true},
        //     ]
        //
        return this.parseBalanceByType (type, response);
    }

    parseBalanceByType (type, response) {
        if (type === 'spot') {
            return this.parseSpotBalance (response);
        } else if (type === 'swap') {
            return this.parseSwapBalance (response);
        }
        throw new NotSupported (this.id + " fetchBalance does not support the '" + type + "' type (the type must be one of 'account', 'spot', 'margin', 'futures', 'swap')");
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        //
        // spot
        //
        //     account_id true string Account ID, obtained using the accounts method. Currency transactions use the accountid of the'spot' account; for loan asset transactions, please use the accountid of the'margin' account
        //     amount true string A limit order indicates the quantity of the order, when a market price buy order indicates how much money to buy, and when a market price sell order indicates how much currency to sell
        //     price false string Order price, market order does not pass this parameter
        //     source false string Order source api
        //     symbol true string Trading pair  btc_usdt, eth_btc ...
        //     type true string Order Type  buy-market: buy at market price, sell-market: sell at market price, buy-limit: buy at limit price, sell-limit: sell at limit price
        //
        // swap
        //
        //     symbol String Yes Contract ID
        //     client_oid String Yes customize order IDs to identify your orders. (Less than 50 characters without special characters,
        //     size String Yes Quantity to buy or sell (value not equal to 0 or negative)
        //     type String Yes 1 Open long 2Open short 3 Close long 4 Close short
        //     order_type String Yes 0: Normal order (Unfilled and 0 imply normal limit order) 1: Post only 2: Fill or Kill 3: Immediate Or Cancel
        //     match_price String Yes 0 Limit price 1 market price
        //     price String No Price of each contract
        //
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'client_oid', 'clientOrderId', this.uuid ());
        params = this.omit (params, [ 'client_oid', 'clientOrderId' ]);
        let method = undefined;
        if (market['spot']) {
            const accountId = await this.getAccountId ({
                'type': market['type'],
            });
            method = 'apiPostOrderOrdersPlace';
            request['account_id'] = accountId;
            request['method'] = 'place';
            request['type'] = side + '-' + type;
            if (type === 'limit') {
                request['amount'] = this.amountToPrecision (symbol, amount);
                request['price'] = this.priceToPrecision (symbol, price);
            } else if (type === 'market') {
                request['price'] = this.priceToPrecision (symbol, 0);
                // for market buy it requires the amount of quote currency to spend
                if (side === 'buy') {
                    let cost = this.safeFloat (params, 'amount');
                    const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price !== undefined) {
                            if (cost === undefined) {
                                cost = amount * price;
                            }
                        } else if (cost === undefined) {
                            throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'amount' extra parameter (the exchange-specific behaviour)");
                        }
                    } else {
                        cost = (cost === undefined) ? amount : cost;
                    }
                    request['amount'] = this.costToPrecision (symbol, cost);
                } else if (side === 'sell') {
                    request['amount'] = this.amountToPrecision (symbol, amount);
                }
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            // ...
        } else if (market['swap']) {
            request['order_type'] = '0'; // '0' = Normal order, undefined and 0 imply a normal limit order, '1' = Post only, '2' = Fill or Kill, '3' = Immediate Or Cancel
            request['client_oid'] = clientOrderId;
            const orderType = this.safeString (params, 'type');
            if (orderType === undefined) {
                throw new ArgumentsRequired (this.id + " createOrder requires a type parameter, '1' = open long, '2' = open short, '3' = close long, '4' = close short");
            }
            request['size'] = this.amountToPrecision (symbol, amount);
            request['type'] = orderType;
            // if match_price is set to '1', the price parameter will be ignored for market orders
            if (type === 'limit') {
                request['match_price'] = '0';
                request['price'] = this.priceToPrecision (symbol, price);
            } else if (type === 'market') {
                if (side === 'buy') {
                    request['match_price'] = '0';
                } else if (side === 'sell') {
                    request['match_price'] = '1';
                }
            }
            method = 'swapPostOrderPlaceOrder';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "status": "ok",
        //         "data": "59378",
        //     }
        //
        //     {
        //         "client_oid":"oktspot79",
        //         "error_code":"",
        //         "error_message":"",
        //         "order_id":"2510789768709120",
        //         "result":true
        //     }
        //
        // swap
        //
        //     {
        //         "client_oid":"bitget#123456",
        //         "order_id":"513466539039522813"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let type = undefined;
        if (symbol === undefined) {
            const defaultType = this.safeString2 (this.options, 'cancelOrder', 'defaultType');
            const type = this.safeString (params, 'type', defaultType);
            if (type === 'spot') {
                if (symbol === undefined) {
                    throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument for spot orders');
                }
            }
        } else {
            market = this.market (symbol);
            type = market['type'];
        }
        const query = this.omit (params, 'type');
        let method = undefined;
        const request = {};
        if (type === 'spot') {
            method = 'apiPostOrderOrdersOrderIdSubmitcancel';
            request['symbol'] = market['id'];
            request['order_id'] = id;
            request['method'] = 'submitcancel';
        } else if (type === 'swap') {
            method = 'swapPostOrderCancelOrder';
            request['orderId'] = id;
            request['symbol'] = market['id'];
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     ...
        //
        // swap
        //
        //     ...
        //
        return this.parseOrder (response, market);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'method': 'deposit_withdraw',
            'type': 'deposit',
            'size': 12,
        };
        const response = await this.apiGetOrderDepositWithdraw (this.extend (request, params));
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "id": 1171,
        //                 "type": "deposit",
        //                 "currency": "usdt",
        //                 "tx_hash": "ed03094b84eafbe4bc16e7ef766ee959885ee5bcb265872baaa9c64e1cf86c2b",
        //                 "amount": 7.457467,
        //                 "address": "rae93V8d2mdoUQHwBDBdM4NHCMehRJAsbm",
        //                 "address_tag": "100040",
        //                 "fee": 0,
        //                 "state": "safe",
        //                 "created_at": 1510912472199,
        //                 "updated_at": 1511145876575
        //             },
        //         ]
        //     }
        //
        return this.parseTransactions (response, currency, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'method': 'deposit_withdraw',
            'type': 'withdraw',
            'size': 12,
        };
        const response = await this.apiGetOrderDepositWithdraw (this.extend (request, params));
        //
        //     {
        //         "status": "ok",
        //         "data": [
        //             {
        //                 "id": 1171,
        //                 "type": "withdraw",
        //                 "currency": "usdt",
        //                 "tx_hash": "ed03094b84eafbe4bc16e7ef766ee959885ee5bcb265872baaa9c64e1cf86c2b",
        //                 "amount": 7.457467,
        //                 "address": "rae93V8d2mdoUQHwBDBdM4NHCMehRJAsbm",
        //                 "address_tag": "100040",
        //                 "fee": 0,
        //                 "state": "safe",
        //                 "created_at": 1510912472199,
        //                 "updated_at": 1511145876575
        //             },
        //         ]
        //     }
        //
        return this.parseTransactions (response, currency, since, limit, params);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        if ((api === 'capi') || (api === 'swap')) {
            request = '/api/swap/' + this.version + request;
        } else {
            request = '/' + api + '/v1' + request;
        }
        let query = this.omit (params, this.extractParams (path));
        let url = this.implodeParams (this.urls['api'][api], { 'hostname': this.hostname }) + request;
        if ((api === 'data') || (api === 'capi')) {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'swap') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + method + request;
            if (method === 'POST') {
                body = this.json (params);
                auth += body;
            } else {
                if (Object.keys (params).length) {
                    const query = this.urlencode (this.keysort (params));
                    url += '?' + query;
                    auth += '?' + query;
                }
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': this.decode (signature),
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': this.password,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        } else if (api === 'api') {
            const timestamp = this.milliseconds ().toString ();
            let auth = '';
            query = this.keysort (query);
            auth = this.rawencode (query);
            const hash = this.hash (this.encode (this.secret), 'sha1');
            let signed = auth;
            const signature = this.hmac (this.encode (auth), this.encode (hash), 'md5');
            if (auth.length > 0) {
                signed += '&';
            }
            signed += 'sign=' + signature + '&req_time=' + timestamp + '&accesskey=' + this.apiKey;
            if (Object.keys (query).length) {
                url += '?' + signed;
            }
            if (method === 'POST') {
                body = auth;
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
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
        //
        //
        // swap
        //
        //     {"code":"40015","msg":"","requestTime":1595698564931,"data":null}
        //     {"code":"40017","msg":"Order id must not be blank","requestTime":1595702477835,"data":null}
        //     {"code":"40017","msg":"Order Type must not be blank","requestTime":1595698516162,"data":null}
        //     {"code":"40301","msg":"","requestTime":1595667662503,"data":null}
        //     {"code":"40017","msg":"Contract code must not be blank","requestTime":1595703151651,"data":null}
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
};
