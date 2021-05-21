'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, NotSupported, BadSymbol, RateLimitExceeded } = require ('./base/errors');
const { TICK_SIZE, TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class okex5 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex5',
            'name': 'OKEX',
            'countries': [ 'CN', 'US' ],
            'version': 'v5',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'has': {
                'CORS': false,
                'fetchCurrencies': false, // see below
                'fetchMarkets': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '12h': '12H',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
                '3M': '3M',
                '6M': '6M',
                '1y': '1Y',
            },
            'hostname': 'okex.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': {
                    'rest': 'https://www.{hostname}',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/docs/en/',
                'fees': 'https://www.okex.com/pages/products/fees.html',
                'referral': 'https://www.okex.com/join/1888677',
                'test': {
                    'rest': 'https://testnet.okex.com',
                },
            },
            'api': {
                'public': {
                    'get': [
                        'market/tickers',
                        'market/ticker',
                        'market/index-tickers',
                        'market/books',
                        'market/candles',
                        'market/history-candles',
                        'market/index-candles',
                        'market/mark-price-candles',
                        'market/trades',
                        'market/platform-24-volume',
                        'market/oracle',
                        'public/instruments',
                        'public/delivery-exercise-history',
                        'public/open-interest',
                        'public/funding-rate',
                        'public/funding-rate-history',
                        'public/price-limit',
                        'public/opt-summary',
                        'public/estimated-price',
                        'public/discount-rate-interest-free-quota',
                        'public/time',
                        'public/liquidation-orders',
                        'public/mark-price',
                        'public/tier',
                        'system/status',
                    ],
                },
                'private': {
                    'get': [
                        'account/account-position-risk',
                        'account/balance',
                        'account/positions',
                        'account/bills',
                        'account/bills-archive',
                        'account/config',
                        'account/max-size',
                        'account/max-avail-size',
                        'account/leverage-info',
                        'account/max-loan',
                        'account/trade-fee',
                        'account/interest-accrued',
                        'account/interest-rate',
                        'account/max-withdrawal',
                        'asset/deposit-address',
                        'asset/balances',
                        'asset/deposit-history',
                        'asset/withdrawal-history',
                        'asset/currencies',
                        'asset/bills',
                        'trade/order',
                        'trade/orders-pending',
                        'trade/orders-history',
                        'trade/orders-history-archive',
                        'trade/fills',
                        'trade/orders-algo-pending',
                        'trade/orders-algo-history',
                        'account/subaccount/balances',
                        'asset/subaccount/bills',
                        'users/subaccount/list',
                    ],
                    'post': [
                        'account/set-position-mode',
                        'account/set-leverage',
                        'account/position/margin-balance',
                        'account/set-greeks',
                        'asset/transfer',
                        'asset/withdrawal',
                        'asset/purchase_redempt',
                        'trade/order',
                        'trade/batch-orders',
                        'trade/cancel-order',
                        'trade/cancel-batch-orders',
                        'trade/amend-order',
                        'trade/amend-batch-orders',
                        'trade/close-position',
                        'trade/order-algo',
                        'trade/cancel-algos',
                        'users/subaccount/delete-apikey',
                        'users/subaccount/modify-apikey',
                        'users/subaccount/apikey',
                        'asset/subaccount/transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.0015,
                    'maker': 0.0010,
                },
                'spot': {
                    'taker': 0.0015,
                    'maker': 0.0010,
                },
                'futures': {
                    'taker': 0.0005,
                    'maker': 0.0002,
                },
                'swap': {
                    'taker': 0.00075,
                    'maker': 0.00020,
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
                // 429 Client Error: Too Many Requests for url
                // 500 Internal Server Error — We had a problem with our server
                'exact': {
                    '1': ExchangeError, // { "code": 1, "message": "System error" }
                    // undocumented
                    'failure to get a peer from the ring-balancer': ExchangeNotAvailable, // { "message": "failure to get a peer from the ring-balancer" }
                    'Server is busy, please try again.': ExchangeNotAvailable, // { "message": "Server is busy, please try again." }
                    'An unexpected error occurred': ExchangeError, // { "message": "An unexpected error occurred" }
                    'System error': ExchangeError, // {"error_message":"System error","message":"System error"}
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
                    '30030': ExchangeNotAvailable, // { "code": 30030, "message": "endpoint request failed. Please try again" }
                    '30031': BadRequest, // { "code": 30031, "message": "token does not exist" }
                    '30032': BadSymbol, // { "code": 30032, "message": "pair does not exist" }
                    '30033': BadRequest, // { "code": 30033, "message": "exchange domain does not exist" }
                    '30034': ExchangeError, // { "code": 30034, "message": "exchange ID does not exist" }
                    '30035': ExchangeError, // { "code": 30035, "message": "trading is not supported in this website" }
                    '30036': ExchangeError, // { "code": 30036, "message": "no relevant data" }
                    '30037': ExchangeNotAvailable, // { "code": 30037, "message": "endpoint is offline or unavailable" }
                    // '30038': AuthenticationError, // { "code": 30038, "message": "user does not exist" }
                    '30038': OnMaintenance, // {"client_oid":"","code":"30038","error_code":"30038","error_message":"Matching engine is being upgraded. Please try in about 1 minute.","message":"Matching engine is being upgraded. Please try in about 1 minute.","order_id":"-1","result":false}
                    '30044': RequestTimeout, // { "code":30044, "message":"Endpoint request timeout" }
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
                    '33085': InvalidOrder, // The value of the position and buying order has reached the position limit, and no further buying is allowed.
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
                    '34026': RateLimitExceeded, // transfer too frequently(transfer too frequently)
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
                    '35022': BadRequest, // { "code": 35022, "message": "Contract status error" }
                    '35024': BadRequest, // { "code": 35024, "message": "Contract not initialized" }
                    '35025': InsufficientFunds, // { "code": 35025, "message": "No account balance" }
                    '35026': BadRequest, // { "code": 35026, "message": "Contract settings not initialized" }
                    '35029': OrderNotFound, // { "code": 35029, "message": "Order does not exist" }
                    '35030': InvalidOrder, // { "code": 35030, "message": "Order size too large" }
                    '35031': InvalidOrder, // { "code": 35031, "message": "Cancel order size too large" }
                    '35032': ExchangeError, // { "code": 35032, "message": "Invalid user status" }
                    '35037': ExchangeError, // No last traded price in cache
                    '35039': InsufficientFunds, // { "code": 35039, "message": "Open order quantity exceeds limit" }
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
                    '35102': RateLimitExceeded, // {"error_message":"The operation that close all at market price is too frequent","result":"true","error_code":"35102","order_id":"-1"}
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
                'fetchOHLCV': {
                    'type': 'Candles', // Candles or HistoryCandles, IndexCandles, MarkPriceCandles
                },
                'createMarketBuyOrderRequiresPrice': true,
                'fetchMarkets': [ 'spot', 'futures', 'swap', 'option' ], // spot, futures, swap, option
                'defaultType': 'spot', // 'account', 'spot', 'margin', 'futures', 'swap', 'option'
                'auth': {
                    'time': 'public',
                    'currencies': 'private',
                    'instruments': 'public',
                    'rate': 'public',
                    '{instrument_id}/constituents': 'public',
                },
            },
            'commonCurrencies': {
                // OKEX refers to ERC20 version of Aeternity (AEToken)
                'AE': 'AET', // https://github.com/ccxt/ccxt/issues/4981
                'BOX': 'DefiBox',
                'HOT': 'Hydro Protocol',
                'HSR': 'HC',
                'MAG': 'Maggie',
                'SBTC': 'Super Bitcoin',
                'YOYO': 'YOYOW',
                'WIN': 'WinToken', // https://github.com/ccxt/ccxt/issues/5701
            },
        });
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetSystemStatus (params);
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "begin":"1621328400000",
        //                 "end":"1621329000000",
        //                 "href":"https://www.okex.com/support/hc/en-us/articles/360060882172",
        //                 "scheDesc":"",
        //                 "serviceType":"1", // 0 WebSocket, 1 Spot/Margin, 2 Futures, 3 Perpetual, 4 Options, 5 Trading service
        //                 "state":"scheduled", // ongoing, completed, canceled
        //                 "system":"classic", // classic, unified
        //                 "title":"Classic Spot System Upgrade"
        //             },
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const timestamp = this.milliseconds ();
        const update = {
            'info': response,
            'updated': timestamp,
            'status': 'ok',
            'eta': undefined,
        };
        for (let i = 0; i < data.length; i++) {
            const event = data[i];
            const state = this.safeString (event, 'state');
            if (state === 'ongoing') {
                update['eta'] = this.safeInteger (event, 'end');
                update['status'] = 'maintenance';
            }
        }
        this.status = this.extend (this.status, update);
        return this.status;
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetPublicTime (params);
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {"ts":"1621247923668"}
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        return this.safeInteger (first, 'ts');
    }

    async fetchMarkets (params = {}) {
        const types = this.safeValue (this.options, 'fetchMarkets');
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
        //     {
        //         "alias":"", // this_week, next_week, quarter, next_quarter
        //         "baseCcy":"BTC",
        //         "category":"1",
        //         "ctMult":"",
        //         "ctType":"", // inverse, linear
        //         "ctVal":"",
        //         "ctValCcy":"",
        //         "expTime":"",
        //         "instId":"BTC-USDT", // BTC-USD-210521, CSPR-USDT-SWAP, BTC-USD-210517-44000-C
        //         "instType":"SPOT", // SPOT, FUTURES, SWAP, OPTION
        //         "lever":"10",
        //         "listTime":"1548133413000",
        //         "lotSz":"0.00000001",
        //         "minSz":"0.00001",
        //         "optType":"",
        //         "quoteCcy":"USDT",
        //         "settleCcy":"",
        //         "state":"live",
        //         "stk":"",
        //         "tickSz":"0.1",
        //         "uly":""
        //     }
        //
        const id = this.safeString (market, 'instId');
        const type = this.safeStringLower (market, 'instType');
        const spot = (type === 'spot');
        const futures = (type === 'futures');
        const swap = (type === 'swap');
        const option = (type === 'option');
        let baseId = this.safeString (market, 'baseCcy');
        let quoteId = this.safeString (market, 'quoteCcy');
        const underlying = this.safeString (market, 'uly');
        if ((underlying !== undefined) && !spot) {
            const parts = underlying.split ('-');
            baseId = this.safeString (parts, 0);
            quoteId = this.safeString (parts, 1);
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = spot ? (base + '/' + quote) : id;
        const tickSize = this.safeString (market, 'tickSz');
        const precision = {
            'amount': this.safeNumber (market, 'lotSz'),
            'price': this.parseNumber (tickSize),
        };
        const minAmountString = this.safeString (market, 'minSz');
        const minAmount = this.parseNumber (minAmountString);
        let minCost = undefined;
        if ((minAmount !== undefined) && (tickSize !== undefined)) {
            minCost = this.parseNumber (Precise.stringMul (tickSize, minAmountString));
        }
        const active = true;
        const fees = this.safeValue2 (this.fees, type, 'trading', {});
        return this.extend (fees, {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'type': type,
            'spot': spot,
            'futures': futures,
            'swap': swap,
            'option': option,
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
                    'min': minCost,
                    'max': undefined,
                },
            },
        });
    }

    async fetchMarketsByType (type, params = {}) {
        const uppercaseType = type.toUpperCase ();
        const request = {
            'instType': uppercaseType,
        };
        if (uppercaseType === 'OPTION') {
            const defaultUnderlying = this.safeValue (this.options, 'defaultUnderlying', 'BTC-USD');
            const currencyId = this.safeString2 (params, 'uly', 'marketId', defaultUnderlying);
            if (currencyId === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMarketsByType requires an underlying uly or marketId parameter for options markets');
            } else {
                request['uly'] = currencyId;
            }
        }
        const response = await this.publicGetPublicInstruments (this.extend (request, params));
        //
        // spot, futures, swaps, options
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "alias":"", // this_week, next_week, quarter, next_quarter
        //                 "baseCcy":"BTC",
        //                 "category":"1",
        //                 "ctMult":"",
        //                 "ctType":"", // inverse, linear
        //                 "ctVal":"",
        //                 "ctValCcy":"",
        //                 "expTime":"",
        //                 "instId":"BTC-USDT", // BTC-USD-210521, CSPR-USDT-SWAP, BTC-USD-210517-44000-C
        //                 "instType":"SPOT", // SPOT, FUTURES, SWAP, OPTION
        //                 "lever":"10",
        //                 "listTime":"1548133413000",
        //                 "lotSz":"0.00000001",
        //                 "minSz":"0.00001",
        //                 "optType":"",
        //                 "quoteCcy":"USDT",
        //                 "settleCcy":"",
        //                 "state":"live",
        //                 "stk":"",
        //                 "tickSz":"0.1",
        //                 "uly":""
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseMarkets (data);
    }

    async fetchCurrencies (params = {}) {
        // has['fetchCurrencies'] is currently set to false
        // despite that their docs say these endpoints are public:
        //     https://www.okex.com/api/account/v3/withdrawal/fee
        //     https://www.okex.com/api/account/v3/currencies
        // it will still reply with { "code":30001, "message": "OK-ACCESS-KEY header is required" }
        // if you attempt to access it without authentication
        const response = await this.accountGetCurrencies (params);
        //
        //     [
        //         {
        //             name: '',
        //             currency: 'BTC',
        //             can_withdraw: '1',
        //             can_deposit: '1',
        //             min_withdrawal: '0.0100000000000000'
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const precision = 0.00000001; // default precision, todo: fix "magic constants"
            const name = this.safeString (currency, 'name');
            const canDeposit = this.safeInteger (currency, 'can_deposit');
            const canWithdraw = this.safeInteger (currency, 'can_withdraw');
            const active = (canDeposit && canWithdraw) ? true : false;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': name,
                'active': active,
                'fee': undefined, // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'min_withdrawal'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        limit = (limit === undefined) ? 20 : limit;
        if (limit !== undefined) {
            request['sz'] = limit; // max 400
        }
        const response = await this.publicGetMarketBooks (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "msg":"",
        //         "data":[
        //             {
        //                 "asks":[
        //                     ["0.07228","4.211619","0","2"], // price, amount, liquidated orders, total open orders
        //                     ["0.0723","299.880364","0","2"],
        //                     ["0.07231","3.72832","0","1"],
        //                 ],
        //                 "bids":[
        //                     ["0.07221","18.5","0","1"],
        //                     ["0.0722","18.5","0","1"],
        //                     ["0.07219","0.505407","0","1"],
        //                 ],
        //                 "ts":"1621438475342"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        const timestamp = this.safeInteger (first, 'ts');
        return this.parseOrderBook (first, symbol, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "instType":"SPOT",
        //         "instId":"ETH-BTC",
        //         "last":"0.07319",
        //         "lastSz":"0.044378",
        //         "askPx":"0.07322",
        //         "askSz":"4.2",
        //         "bidPx":"0.0732",
        //         "bidSz":"6.050058",
        //         "open24h":"0.07801",
        //         "high24h":"0.07975",
        //         "low24h":"0.06019",
        //         "volCcy24h":"11788.887619",
        //         "vol24h":"167493.829229",
        //         "ts":"1621440583784",
        //         "sodUtc0":"0.07872",
        //         "sodUtc8":"0.07345"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'ts');
        const marketId = this.safeString (ticker, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const last = this.safeNumber (ticker, 'last');
        const open = this.safeNumber (ticker, 'open24h');
        const baseVolume = this.safeNumber (ticker, 'volCcy24h');
        const quoteVolume = this.safeNumber (ticker, 'vol24h');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high24h'),
            'low': this.safeNumber (ticker, 'low24h'),
            'bid': this.safeNumber (ticker, 'bidPx'),
            'bidVolume': this.safeNumber (ticker, 'bidSz'),
            'ask': this.safeNumber (ticker, 'askPx'),
            'askVolume': this.safeNumber (ticker, 'askSz'),
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "msg":"",
        //         "data":[
        //             {
        //                 "instType":"SPOT",
        //                 "instId":"ETH-BTC",
        //                 "last":"0.07319",
        //                 "lastSz":"0.044378",
        //                 "askPx":"0.07322",
        //                 "askSz":"4.2",
        //                 "bidPx":"0.0732",
        //                 "bidSz":"6.050058",
        //                 "open24h":"0.07801",
        //                 "high24h":"0.07975",
        //                 "low24h":"0.06019",
        //                 "volCcy24h":"11788.887619",
        //                 "vol24h":"167493.829229",
        //                 "ts":"1621440583784",
        //                 "sodUtc0":"0.07872",
        //                 "sodUtc8":"0.07345"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        return this.parseTicker (first, market);
    }

    async fetchTickersByType (type, symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const uppercaseType = type.toUpperCase ();
        const request = {
            'instType': type.toUpperCase (),
        };
        if (uppercaseType === 'OPTION') {
            const defaultUnderlying = this.safeValue (this.options, 'defaultUnderlying', 'BTC-USD');
            const currencyId = this.safeString2 (params, 'uly', 'marketId', defaultUnderlying);
            if (currencyId === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchTickersByType requires an underlying uly or marketId parameter for options markets');
            } else {
                request['uly'] = currencyId;
            }
        }
        const response = await this.publicGetMarketTickers (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "msg":"",
        //         "data":[
        //             {
        //                 "instType":"SPOT",
        //                 "instId":"BCD-BTC",
        //                 "last":"0.0000769",
        //                 "lastSz":"5.4788",
        //                 "askPx":"0.0000777",
        //                 "askSz":"3.2197",
        //                 "bidPx":"0.0000757",
        //                 "bidSz":"4.7509",
        //                 "open24h":"0.0000885",
        //                 "high24h":"0.0000917",
        //                 "low24h":"0.0000596",
        //                 "volCcy24h":"9.2877",
        //                 "vol24h":"124824.1985",
        //                 "ts":"1621441741434",
        //                 "sodUtc0":"0.0000905",
        //                 "sodUtc8":"0.0000729"
        //             },
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'data', []);
        return this.parseTickers (tickers, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        return await this.fetchTickersByType (type, symbols, this.omit (params, 'type'));
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         "instId":"ETH-BTC",
        //         "side":"sell",
        //         "sz":"0.119501",
        //         "px":"0.07065",
        //         "tradeId":"15826757",
        //         "ts":"1621446178316"
        //     }
        //
        const id = this.safeString (trade, 'tradeId');
        const marketId = this.safeString (trade, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'ts');
        const priceString = this.safeString (trade, 'px');
        const amountString = this.safeString (trade, 'sz');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const side = this.safeString (trade, 'side');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "msg":"",
        //         "data":[
        //             {"instId":"ETH-BTC","side":"sell","sz":"0.119501","px":"0.07065","tradeId":"15826757","ts":"1621446178316"},
        //             {"instId":"ETH-BTC","side":"sell","sz":"0.03","px":"0.07068","tradeId":"15826756","ts":"1621446178066"},
        //             {"instId":"ETH-BTC","side":"buy","sz":"0.507","px":"0.07069","tradeId":"15826755","ts":"1621446175085"},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         "1621447080000", // timestamp
        //         "0.07073", // open
        //         "0.07073", // high
        //         "0.07064", // low
        //         "0.07064", // close
        //         "12.08863", // base volume
        //         "0.854309" // quote volume
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            'bar': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const defaultType = this.safeString (options, 'type', 'Candles'); // Candles or HistoryCandles
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const method = 'publicGetMarket' + type;
        if (since !== undefined) {
            request['after'] = since;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "msg":"",
        //         "data":[
        //             ["1621447080000","0.07073","0.07073","0.07064","0.07064","12.08863","0.854309"],
        //             ["1621447020000","0.0708","0.0709","0.0707","0.07072","58.517435","4.143309"],
        //             ["1621446960000","0.0707","0.07082","0.0707","0.07076","53.850841","3.810921"],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseAccountBalance (response) {
        //
        // account
        //
        //     [
        //         {
        //             balance:  0,
        //             available:  0,
        //             currency: "BTC",
        //             hold:  0
        //         },
        //         {
        //             balance:  0,
        //             available:  0,
        //             currency: "ETH",
        //             hold:  0
        //         }
        //     ]
        //
        // spot
        //
        //     [
        //         {
        //             frozen: "0",
        //             hold: "0",
        //             id: "2149632",
        //             currency: "BTC",
        //             balance: "0.0000000497717339",
        //             available: "0.0000000497717339",
        //             holds: "0"
        //         },
        //         {
        //             frozen: "0",
        //             hold: "0",
        //             id: "2149632",
        //             currency: "ICN",
        //             balance: "0.00000000925",
        //             available: "0.00000000925",
        //             holds: "0"
        //         }
        //     ]
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeNumber (balance, 'balance');
            account['used'] = this.safeNumber (balance, 'hold');
            account['free'] = this.safeNumber (balance, 'available');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseMarginBalance (response) {
        //
        //     [
        //         {
        //             "currency:BTC": {
        //                 "available":"0",
        //                 "balance":"0",
        //                 "borrowed":"0",
        //                 "can_withdraw":"0",
        //                 "frozen":"0",
        //                 "hold":"0",
        //                 "holds":"0",
        //                 "lending_fee":"0"
        //             },
        //             "currency:USDT": {
        //                 "available":"100",
        //                 "balance":"100",
        //                 "borrowed":"0",
        //                 "can_withdraw":"100",
        //                 "frozen":"0",
        //                 "hold":"0",
        //                 "holds":"0",
        //                 "lending_fee":"0"
        //             },
        //             "instrument_id":"BTC-USDT",
        //             "liquidation_price":"0",
        //             "product_id":"BTC-USDT",
        //             "risk_rate":""
        //         },
        //     ]
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const marketId = this.safeString (balance, 'instrument_id');
            const market = this.safeValue (this.markets_by_id, marketId);
            let symbol = undefined;
            if (market === undefined) {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            } else {
                symbol = market['symbol'];
            }
            const omittedBalance = this.omit (balance, [
                'instrument_id',
                'liquidation_price',
                'product_id',
                'risk_rate',
                'margin_ratio',
                'maint_margin_ratio',
                'tiers',
            ]);
            const keys = Object.keys (omittedBalance);
            const accounts = {};
            for (let k = 0; k < keys.length; k++) {
                const key = keys[k];
                const marketBalance = balance[key];
                if (key.indexOf (':') >= 0) {
                    const parts = key.split (':');
                    const currencyId = parts[1];
                    const code = this.safeCurrencyCode (currencyId);
                    const account = this.account ();
                    account['total'] = this.safeNumber (marketBalance, 'balance');
                    account['used'] = this.safeNumber (marketBalance, 'hold');
                    account['free'] = this.safeNumber (marketBalance, 'available');
                    accounts[code] = account;
                } else {
                    throw new NotSupported (this.id + ' margin balance response format has changed!');
                }
            }
            result[symbol] = this.parseBalance (accounts);
        }
        return result;
    }

    parseFuturesBalance (response) {
        //
        //     {
        //         "info":{
        //             "eos":{
        //                 "auto_margin":"0",
        //                 "contracts": [
        //                     {
        //                         "available_qty":"40.37069445",
        //                         "fixed_balance":"0",
        //                         "instrument_id":"EOS-USD-190329",
        //                         "margin_for_unfilled":"0",
        //                         "margin_frozen":"0",
        //                         "realized_pnl":"0",
        //                         "unrealized_pnl":"0"
        //                     },
        //                     {
        //                         "available_qty":"40.37069445",
        //                         "fixed_balance":"14.54895721",
        //                         "instrument_id":"EOS-USD-190628",
        //                         "margin_for_unfilled":"0",
        //                         "margin_frozen":"10.64042157",
        //                         "realized_pnl":"-3.90853564",
        //                         "unrealized_pnl":"-0.259"
        //                     },
        //                 ],
        //                 "equity":"50.75220665",
        //                 "margin_mode":"fixed",
        //                 "total_avail_balance":"40.37069445"
        //             },
        //         }
        //     }
        //
        // their root field name is "info", so our info will contain their info
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const info = this.safeValue (response, 'info', {});
        const ids = Object.keys (info);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.safeCurrencyCode (id);
            const balance = this.safeValue (info, id, {});
            const account = this.account ();
            const totalAvailBalance = this.safeNumber (balance, 'total_avail_balance');
            if (this.safeString (balance, 'margin_mode') === 'fixed') {
                const contracts = this.safeValue (balance, 'contracts', []);
                let free = totalAvailBalance;
                for (let i = 0; i < contracts.length; i++) {
                    const contract = contracts[i];
                    const fixedBalance = this.safeNumber (contract, 'fixed_balance');
                    const realizedPnl = this.safeNumber (contract, 'realized_pnl');
                    const marginFrozen = this.safeNumber (contract, 'margin_frozen');
                    const marginForUnfilled = this.safeNumber (contract, 'margin_for_unfilled');
                    const margin = this.sum (fixedBalance, realizedPnl) - marginFrozen - marginForUnfilled;
                    free = this.sum (free, margin);
                }
                account['free'] = free;
            } else {
                const realizedPnl = this.safeNumber (balance, 'realized_pnl');
                const unrealizedPnl = this.safeNumber (balance, 'unrealized_pnl');
                const marginFrozen = this.safeNumber (balance, 'margin_frozen');
                const marginForUnfilled = this.safeNumber (balance, 'margin_for_unfilled');
                account['free'] = this.sum (totalAvailBalance, realizedPnl, unrealizedPnl) - marginFrozen - marginForUnfilled;
            }
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeNumber (balance, 'equity');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseSwapBalance (response) {
        //
        //     {
        //         "info": [
        //             {
        //                 "equity":"3.0139",
        //                 "fixed_balance":"0.0000",
        //                 "instrument_id":"EOS-USD-SWAP",
        //                 "margin":"0.5523",
        //                 "margin_frozen":"0.0000",
        //                 "margin_mode":"crossed",
        //                 "margin_ratio":"1.0913",
        //                 "realized_pnl":"-0.0006",
        //                 "timestamp":"2019-03-25T03:46:10.336Z",
        //                 "total_avail_balance":"3.0000",
        //                 "unrealized_pnl":"0.0145"
        //             }
        //         ]
        //     }
        //
        // their root field name is "info", so our info will contain their info
        const result = { 'info': response };
        let timestamp = undefined;
        const info = this.safeValue (response, 'info', []);
        for (let i = 0; i < info.length; i++) {
            const balance = info[i];
            const marketId = this.safeString (balance, 'instrument_id');
            let symbol = marketId;
            if (marketId in this.markets_by_id) {
                symbol = this.markets_by_id[marketId]['symbol'];
            }
            const balanceTimestamp = this.parse8601 (this.safeString (balance, 'timestamp'));
            timestamp = (timestamp === undefined) ? balanceTimestamp : Math.max (timestamp, balanceTimestamp);
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeNumber (balance, 'equity');
            account['free'] = this.safeNumber (balance, 'total_avail_balance');
            result[symbol] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.parseBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'ccy': 'BTC,ETH', // comma-separated list of currency ids
        };
        const response = await this.privateGetAccountBalance (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "adjEq":"",
        //                 "details":[
        //                     {
        //                         "availBal":"",
        //                         "availEq":"28.21006347",
        //                         "cashBal":"28.21006347",
        //                         "ccy":"USDT",
        //                         "crossLiab":"",
        //                         "disEq":"28.2687404020176",
        //                         "eq":"28.21006347",
        //                         "eqUsd":"28.2687404020176",
        //                         "frozenBal":"0",
        //                         "interest":"",
        //                         "isoEq":"0",
        //                         "isoLiab":"",
        //                         "liab":"",
        //                         "maxLoan":"",
        //                         "mgnRatio":"",
        //                         "notionalLever":"0",
        //                         "ordFrozen":"0",
        //                         "twap":"0",
        //                         "uTime":"1621556539861",
        //                         "upl":"0",
        //                         "uplLiab":""
        //                     }
        //                 ],
        //                 "imr":"",
        //                 "isoEq":"0",
        //                 "mgnRatio":"",
        //                 "mmr":"",
        //                 "notionalUsd":"",
        //                 "ordFroz":"",
        //                 "totalEq":"28.2687404020176",
        //                 "uTime":"1621556553510"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        const result = { 'info': response };
        let timestamp = undefined;
        // const info = this.safeValue (response, 'info', []);
        // for (let i = 0; i < info.length; i++) {
        //     const balance = info[i];
        //     const marketId = this.safeString (balance, 'instrument_id');
        //     let symbol = marketId;
        //     if (marketId in this.markets_by_id) {
        //         symbol = this.markets_by_id[marketId]['symbol'];
        //     }
        //     const balanceTimestamp = this.parse8601 (this.safeString (balance, 'timestamp'));
        //     timestamp = (timestamp === undefined) ? balanceTimestamp : Math.max (timestamp, balanceTimestamp);
        //     const account = this.account ();
        //     // it may be incorrect to use total, free and used for swap accounts
        //     account['total'] = this.safeString (balance, 'equity');
        //     account['free'] = this.safeString (balance, 'total_avail_balance');
        //     result[symbol] = account;
        // }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.parseBalance (result, false);
    }

    parseBalanceByType (type, response) {
        if ((type === 'account') || (type === 'spot')) {
            return this.parseAccountBalance (response);
        } else if (type === 'margin') {
            return this.parseMarginBalance (response);
        } else if (type === 'futures') {
            return this.parseFuturesBalance (response);
        } else if (type === 'swap') {
            return this.parseSwapBalance (response);
        }
        throw new NotSupported (this.id + " fetchBalance does not support the '" + type + "' type (the type must be one of 'account', 'spot', 'margin', 'futures', 'swap')");
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'instrument_id': market['id'],
            // 'client_oid': 'abcdef1234567890', // [a-z0-9]{1,32}
            // 'order_type': '0', // 0 = Normal limit order, 1 = Post only, 2 = Fill Or Kill, 3 = Immediatel Or Cancel, 4 = Market for futures only
        };
        const clientOrderId = this.safeString2 (params, 'client_oid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_oid'] = clientOrderId;
            params = this.omit (params, [ 'client_oid', 'clientOrderId' ]);
        }
        let method = undefined;
        if (market['futures'] || market['swap']) {
            const size = market['futures'] ? this.numberToString (amount) : this.amountToPrecision (symbol, amount);
            request = this.extend (request, {
                'type': type, // 1:open long 2:open short 3:close long 4:close short for futures
                'size': size,
                // 'match_price': '0', // Order at best counter party price? (0:no 1:yes). The default is 0. If it is set as 1, the price parameter will be ignored. When posting orders at best bid price, order_type can only be 0 (regular order).
            });
            const orderType = this.safeString (params, 'order_type');
            // order_type === '4' means a market order
            const isMarketOrder = (type === 'market') || (orderType === '4');
            if (isMarketOrder) {
                request['order_type'] = '4';
            } else {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (market['futures']) {
                request['leverage'] = '10'; // or '20'
            }
            method = market['type'] + 'PostOrder';
        } else {
            const marginTrading = this.safeString (params, 'margin_trading', '1');  // 1 = spot, 2 = margin
            request = this.extend (request, {
                'side': side,
                'type': type, // limit/market
                'margin_trading': marginTrading, // 1 = spot, 2 = margin
            });
            if (type === 'limit') {
                request['price'] = this.priceToPrecision (symbol, price);
                request['size'] = this.amountToPrecision (symbol, amount);
            } else if (type === 'market') {
                // for market buy it requires the amount of quote currency to spend
                if (side === 'buy') {
                    let notional = this.safeNumber (params, 'notional');
                    const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price !== undefined) {
                            if (notional === undefined) {
                                notional = amount * price;
                            }
                        } else if (notional === undefined) {
                            throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'notional' extra parameter (the exchange-specific behaviour)");
                        }
                    } else {
                        notional = (notional === undefined) ? amount : notional;
                    }
                    const precision = market['precision']['price'];
                    request['notional'] = this.decimalToPrecision (notional, TRUNCATE, precision, this.precisionMode);
                } else {
                    request['size'] = this.amountToPrecision (symbol, amount);
                }
            }
            method = (marginTrading === '2') ? 'marginPostOrders' : 'spotPostOrders';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "client_oid":"oktspot79",
        //         "error_code":"",
        //         "error_message":"",
        //         "order_id":"2510789768709120",
        //         "result":true
        //     }
        //
        const order = this.parseOrder (response, market);
        return this.extend (order, {
            'type': type,
            'side': side,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        if (market['futures'] || market['swap']) {
            type = market['type'];
        } else {
            const defaultType = this.safeString2 (this.options, 'cancelOrder', 'defaultType', market['type']);
            type = this.safeString (params, 'type', defaultType);
        }
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " cancelOrder() requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
        }
        let method = type + 'PostCancelOrder';
        const request = {
            'instrument_id': market['id'],
        };
        if (market['futures'] || market['swap']) {
            method += 'InstrumentId';
        } else {
            method += 's';
        }
        const clientOrderId = this.safeString2 (params, 'client_oid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            method += 'ClientOid';
            request['client_oid'] = clientOrderId;
        } else {
            method += 'OrderId';
            request['order_id'] = id;
        }
        const query = this.omit (params, [ 'type', 'client_oid', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, query));
        const result = ('result' in response) ? response : this.safeValue (response, market['id'], {});
        //
        // spot, margin
        //
        //     {
        //         "btc-usdt": [
        //             {
        //                 "result":true,
        //                 "client_oid":"a123",
        //                 "order_id": "2510832677225473"
        //             }
        //         ]
        //     }
        //
        // futures, swap
        //
        //     {
        //         "result": true,
        //         "client_oid": "oktfuture10", // missing if requested by order_id
        //         "order_id": "2517535534836736",
        //         "instrument_id": "EOS-USD-190628"
        //     }
        //
        return this.parseOrder (result, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            '-2': 'failed',
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderSide (side) {
        const sides = {
            '1': 'buy', // open long
            '2': 'sell', // open short
            '3': 'sell', // close long
            '4': 'buy', // close short
        };
        return this.safeString (sides, side, side);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "client_oid":"oktspot79",
        //         "error_code":"",
        //         "error_message":"",
        //         "order_id":"2510789768709120",
        //         "result":true
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "result": true,
        //         "client_oid": "oktfuture10", // missing if requested by order_id
        //         "order_id": "2517535534836736",
        //         // instrument_id is missing for spot/margin orders
        //         // available in futures and swap orders only
        //         "instrument_id": "EOS-USD-190628",
        //     }
        //
        // fetchOrder, fetchOrdersByState, fetchOpenOrders, fetchClosedOrders
        //
        //     // spot and margin orders
        //
        //     {
        //         "client_oid":"oktspot76",
        //         "created_at":"2019-03-18T07:26:49.000Z",
        //         "filled_notional":"3.9734",
        //         "filled_size":"0.001", // filled_qty in futures and swap orders
        //         "funds":"", // this is most likely the same as notional
        //         "instrument_id":"BTC-USDT",
        //         "notional":"",
        //         "order_id":"2500723297813504",
        //         "order_type":"0",
        //         "price":"4013",
        //         "product_id":"BTC-USDT", // missing in futures and swap orders
        //         "side":"buy",
        //         "size":"0.001",
        //         "status":"filled",
        //         "state": "2",
        //         "timestamp":"2019-03-18T07:26:49.000Z",
        //         "type":"limit"
        //     }
        //
        //     // futures and swap orders
        //
        //     {
        //         "instrument_id":"EOS-USD-190628",
        //         "size":"10",
        //         "timestamp":"2019-03-20T10:04:55.000Z",
        //         "filled_qty":"10", // filled_size in spot and margin orders
        //         "fee":"-0.00841043",
        //         "order_id":"2512669605501952",
        //         "price":"3.668",
        //         "price_avg":"3.567", // missing in spot and margin orders
        //         "status":"2",
        //         "state": "2",
        //         "type":"4",
        //         "contract_val":"10",
        //         "leverage":"10", // missing in swap, spot and margin orders
        //         "client_oid":"",
        //         "pnl":"1.09510794", // missing in swap, spo and margin orders
        //         "order_type":"0"
        //     }
        //
        const id = this.safeString (order, 'order_id');
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        let side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        if ((side !== 'buy') && (side !== 'sell')) {
            side = this.parseOrderSide (type);
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'instrument_id');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        } else {
            symbol = marketId;
        }
        if (market !== undefined) {
            if (symbol === undefined) {
                symbol = market['symbol'];
            }
        }
        let amount = this.safeNumber (order, 'size');
        const filled = this.safeNumber2 (order, 'filled_size', 'filled_qty');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                amount = Math.max (amount, filled);
                remaining = Math.max (0, amount - filled);
            }
        }
        if (type === 'market') {
            remaining = 0;
        }
        let cost = this.safeNumber2 (order, 'filled_notional', 'funds');
        const price = this.safeNumber (order, 'price');
        let average = this.safeNumber (order, 'price_avg');
        if (cost === undefined) {
            if (filled !== undefined && average !== undefined) {
                cost = average * filled;
            }
        } else {
            if ((average === undefined) && (filled !== undefined) && (filled > 0)) {
                average = cost / filled;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const feeCost = this.safeNumber (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let clientOrderId = this.safeString (order, 'client_oid');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined; // fix empty clientOrderId string
        }
        const stopPrice = this.safeNumber (order, 'trigger_price');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchOrder() requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
        }
        const instrumentId = (market['futures'] || market['swap']) ? 'InstrumentId' : '';
        let method = type + 'GetOrders' + instrumentId;
        const request = {
            'instrument_id': market['id'],
            // 'client_oid': 'abcdef12345', // optional, [a-z0-9]{1,32}
            // 'order_id': id,
        };
        const clientOid = this.safeString (params, 'client_oid');
        if (clientOid !== undefined) {
            method += 'ClientOid';
            request['client_oid'] = clientOid;
        } else {
            method += 'OrderId';
            request['order_id'] = id;
        }
        const query = this.omit (params, 'type');
        const response = await this[method] (this.extend (request, query));
        //
        // spot, margin
        //
        //     {
        //         "client_oid":"oktspot70",
        //         "created_at":"2019-03-15T02:52:56.000Z",
        //         "filled_notional":"3.8886",
        //         "filled_size":"0.001",
        //         "funds":"",
        //         "instrument_id":"BTC-USDT",
        //         "notional":"",
        //         "order_id":"2482659399697408",
        //         "order_type":"0",
        //         "price":"3927.3",
        //         "product_id":"BTC-USDT",
        //         "side":"buy",
        //         "size":"0.001",
        //         "status":"filled",
        //         "state": "2",
        //         "timestamp":"2019-03-15T02:52:56.000Z",
        //         "type":"limit"
        //     }
        //
        // futures, swap
        //
        //     {
        //         "instrument_id":"EOS-USD-190628",
        //         "size":"10",
        //         "timestamp":"2019-03-20T02:46:38.000Z",
        //         "filled_qty":"10",
        //         "fee":"-0.0080819",
        //         "order_id":"2510946213248000",
        //         "price":"3.712",
        //         "price_avg":"3.712",
        //         "status":"2",
        //         "state": "2",
        //         "type":"2",
        //         "contract_val":"10",
        //         "leverage":"10",
        //         "client_oid":"", // missing in swap orders
        //         "pnl":"0", // missing in swap orders
        //         "order_type":"0"
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOrdersByState (state, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByState() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        if (market['futures'] || market['swap']) {
            type = market['type'];
        } else {
            const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', market['type']);
            type = this.safeString (params, 'type', defaultType);
        }
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchOrdersByState() requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
        }
        const request = {
            'instrument_id': market['id'],
            // '-2': failed,
            // '-1': cancelled,
            //  '0': open ,
            //  '1': partially filled,
            //  '2': fully filled,
            //  '3': submitting,
            //  '4': cancelling,
            //  '6': incomplete（open+partially filled),
            //  '7': complete（cancelled+fully filled),
            'state': state,
        };
        let method = type + 'GetOrders';
        if (market['futures'] || market['swap']) {
            method += 'InstrumentId';
        }
        const query = this.omit (params, 'type');
        const response = await this[method] (this.extend (request, query));
        //
        // spot, margin
        //
        //     [
        //         // in fact, this documented API response does not correspond
        //         // to their actual API response for spot markets
        //         // OKEX v3 API returns a plain array of orders (see below)
        //         [
        //             {
        //                 "client_oid":"oktspot76",
        //                 "created_at":"2019-03-18T07:26:49.000Z",
        //                 "filled_notional":"3.9734",
        //                 "filled_size":"0.001",
        //                 "funds":"",
        //                 "instrument_id":"BTC-USDT",
        //                 "notional":"",
        //                 "order_id":"2500723297813504",
        //                 "order_type":"0",
        //                 "price":"4013",
        //                 "product_id":"BTC-USDT",
        //                 "side":"buy",
        //                 "size":"0.001",
        //                 "status":"filled",
        //                 "state": "2",
        //                 "timestamp":"2019-03-18T07:26:49.000Z",
        //                 "type":"limit"
        //             },
        //         ],
        //         {
        //             "before":"2500723297813504",
        //             "after":"2500650881647616"
        //         }
        //     ]
        //
        // futures, swap
        //
        //     {
        //         "result":true,  // missing in swap orders
        //         "order_info": [
        //             {
        //                 "instrument_id":"EOS-USD-190628",
        //                 "size":"10",
        //                 "timestamp":"2019-03-20T10:04:55.000Z",
        //                 "filled_qty":"10",
        //                 "fee":"-0.00841043",
        //                 "order_id":"2512669605501952",
        //                 "price":"3.668",
        //                 "price_avg":"3.567",
        //                 "status":"2",
        //                 "state": "2",
        //                 "type":"4",
        //                 "contract_val":"10",
        //                 "leverage":"10", // missing in swap orders
        //                 "client_oid":"",
        //                 "pnl":"1.09510794", // missing in swap orders
        //                 "order_type":"0"
        //             },
        //         ]
        //     }
        //
        let orders = undefined;
        if (market['swap'] || market['futures']) {
            orders = this.safeValue (response, 'order_info', []);
        } else {
            orders = response;
            const responseLength = response.length;
            if (responseLength < 1) {
                return [];
            }
            // in fact, this documented API response does not correspond
            // to their actual API response for spot markets
            // OKEX v3 API returns a plain array of orders
            if (responseLength > 1) {
                const before = this.safeValue (response[1], 'before');
                if (before !== undefined) {
                    orders = response[0];
                }
            }
        }
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // '-2': failed,
        // '-1': cancelled,
        //  '0': open ,
        //  '1': partially filled,
        //  '2': fully filled,
        //  '3': submitting,
        //  '4': cancelling,
        //  '6': incomplete（open+partially filled),
        //  '7': complete（cancelled+fully filled),
        return await this.fetchOrdersByState ('6', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // '-2': failed,
        // '-1': cancelled,
        //  '0': open ,
        //  '1': partially filled,
        //  '2': fully filled,
        //  '3': submitting,
        //  '4': cancelling,
        //  '6': incomplete（open+partially filled),
        //  '7': complete（cancelled+fully filled),
        return await this.fetchOrdersByState ('7', symbol, since, limit, params);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         address: '0x696abb81974a8793352cbd33aadcf78eda3cfdfa',
        //         currency: 'eth'
        //         tag: 'abcde12345', // will be missing if the token does not require a deposit tag
        //         payment_id: 'abcde12345', // will not be returned if the token does not require a payment_id
        //         // can_deposit: 1, // 0 or 1, documented but missing
        //         // can_withdraw: 1, // 0 or 1, documented but missing
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        let tag = this.safeString2 (depositAddress, 'tag', 'payment_id');
        tag = this.safeString (depositAddress, 'memo', tag);
        const currencyId = this.safeString (depositAddress, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const parts = code.split ('-');
        const currency = this.currency (parts[0]);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.accountGetDepositAddress (this.extend (request, params));
        //
        //     [
        //         {
        //             address: '0x696abb81974a8793352cbd33aadcf78eda3cfdfa',
        //             currency: 'eth'
        //         }
        //     ]
        //
        const addressesByCode = this.parseDepositAddresses (response);
        const address = this.safeValue (addressesByCode, code);
        if (address === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress cannot return nonexistent addresses, you should create withdrawal addresses with the exchange website first');
        }
        return address;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag) {
            address = address + ':' + tag;
        }
        const fee = this.safeString (params, 'fee');
        if (fee === undefined) {
            throw new ArgumentsRequired (this.id + " withdraw() requires a `fee` string parameter, network transaction fee must be ≥ 0. Withdrawals to OKCoin or OKEx are fee-free, please set '0'. Withdrawing to external digital asset address requires network transaction fee.");
        }
        const request = {
            'currency': currency['id'],
            'to_address': address,
            'destination': '4', // 2 = OKCoin International, 3 = OKEx 4 = others
            'amount': this.numberToString (amount),
            'fee': fee, // String. Network transaction fee ≥ 0. Withdrawals to OKCoin or OKEx are fee-free, please set as 0. Withdrawal to external digital asset address requires network transaction fee.
        };
        if ('password' in params) {
            request['trade_pwd'] = params['password'];
        } else if ('trade_pwd' in params) {
            request['trade_pwd'] = params['trade_pwd'];
        } else if (this.password) {
            request['trade_pwd'] = this.password;
        }
        const query = this.omit (params, [ 'fee', 'password', 'trade_pwd' ]);
        if (!('trade_pwd' in request)) {
            throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a password / trade_pwd parameter');
        }
        const response = await this.accountPostWithdrawal (this.extend (request, query));
        //
        //     {
        //         "amount":"0.1",
        //         "withdrawal_id":"67485",
        //         "currency":"btc",
        //         "result":true
        //     }
        //
        return {
            'info': response,
            'id': this.safeString (response, 'withdrawal_id'),
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'accountGetDepositHistory';
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
            method += 'Currency';
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'accountGetWithdrawalHistory';
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
            method += 'Currency';
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit, params);
    }

    parseTransactionStatus (status) {
        //
        // deposit statuses
        //
        //     {
        //         '0': 'waiting for confirmation',
        //         '1': 'confirmation account',
        //         '2': 'recharge success'
        //     }
        //
        // withdrawal statues
        //
        //     {
        //        '-3': 'pending cancel',
        //        '-2': 'cancelled',
        //        '-1': 'failed',
        //         '0': 'pending',
        //         '1': 'sending',
        //         '2': 'sent',
        //         '3': 'email confirmation',
        //         '4': 'manual confirmation',
        //         '5': 'awaiting identity confirmation'
        //     }
        //
        const statuses = {
            '-3': 'pending',
            '-2': 'canceled',
            '-1': 'failed',
            '0': 'pending',
            '1': 'pending',
            '2': 'ok',
            '3': 'pending',
            '4': 'pending',
            '5': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "amount":"0.1",
        //         "withdrawal_id":"67485",
        //         "currency":"btc",
        //         "result":true
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         amount: "4.72100000",
        //         withdrawal_id: "1729116",
        //         fee: "0.01000000eth",
        //         txid: "0xf653125bbf090bcfe4b5e8e7b8f586a9d87aa7de94598702758c0802b…",
        //         currency: "ETH",
        //         from: "7147338839",
        //         to: "0x26a3CB49578F07000575405a57888681249c35Fd",
        //         timestamp: "2018-08-17T07:03:42.000Z",
        //         status: "2"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "amount": "4.19511659",
        //         "txid": "14c9a8c925647cdb7e5b2937ea9aefe2b29b2c273150ad3f44b3b8a4635ed437",
        //         "currency": "XMR",
        //         "from": "",
        //         "to": "48PjH3ksv1fiXniKvKvyH5UtFs5WhfS2Vf7U3TwzdRJtCc7HJWvCQe56dRahyhQyTAViXZ8Nzk4gQg6o4BJBMUoxNy8y8g7",
        //         "tag": "1234567",
        //         "deposit_id": 11571659, <-- we can use this
        //         "timestamp": "2019-10-01T14:54:19.000Z",
        //         "status": "2"
        //     }
        //
        let type = undefined;
        let id = undefined;
        let address = undefined;
        const withdrawalId = this.safeString (transaction, 'withdrawal_id');
        const addressFrom = this.safeString (transaction, 'from');
        const addressTo = this.safeString (transaction, 'to');
        const tagTo = this.safeString (transaction, 'tag');
        if (withdrawalId !== undefined) {
            type = 'withdrawal';
            id = withdrawalId;
            address = addressTo;
        } else {
            // the payment_id will appear on new deposits but appears to be removed from the response after 2 months
            id = this.safeString2 (transaction, 'payment_id', 'deposit_id');
            type = 'deposit';
            address = addressTo;
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeNumber (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const txid = this.safeString (transaction, 'txid');
        const timestamp = this.parse8601 (this.safeString (transaction, 'timestamp'));
        let feeCost = undefined;
        if (type === 'deposit') {
            feeCost = 0;
        } else {
            if (currencyId !== undefined) {
                const feeWithCurrencyId = this.safeString (transaction, 'fee');
                if (feeWithCurrencyId !== undefined) {
                    // https://github.com/ccxt/ccxt/pull/5748
                    const lowercaseCurrencyId = currencyId.toLowerCase ();
                    const feeWithoutCurrencyId = feeWithCurrencyId.replace (lowercaseCurrencyId, '');
                    feeCost = parseFloat (feeWithoutCurrencyId);
                }
            }
        }
        // todo parse tags
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'address': address,
            'tagFrom': undefined,
            'tagTo': tagTo,
            'tag': tagTo,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseMyTrade (pair, market = undefined) {
        // check that trading symbols match in both entries
        const userTrade = this.safeValue (pair, 1);
        const otherTrade = this.safeValue (pair, 0);
        const firstMarketId = this.safeString (otherTrade, 'instrument_id');
        const secondMarketId = this.safeString (userTrade, 'instrument_id');
        if (firstMarketId !== secondMarketId) {
            throw new NotSupported (this.id + ' parseMyTrade() received unrecognized response format, differing instrument_ids in one fill, the exchange API might have changed, paste your verbose output: https://github.com/ccxt/ccxt/wiki/FAQ#what-is-required-to-get-help');
        }
        const marketId = firstMarketId;
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const quoteId = market['quoteId'];
        let side = undefined;
        let amount = undefined;
        let cost = undefined;
        const receivedCurrencyId = this.safeString (userTrade, 'currency');
        let feeCurrencyId = undefined;
        if (receivedCurrencyId === quoteId) {
            side = this.safeString (otherTrade, 'side');
            amount = this.safeNumber (otherTrade, 'size');
            cost = this.safeNumber (userTrade, 'size');
            feeCurrencyId = this.safeString (otherTrade, 'currency');
        } else {
            side = this.safeString (userTrade, 'side');
            amount = this.safeNumber (userTrade, 'size');
            cost = this.safeNumber (otherTrade, 'size');
            feeCurrencyId = this.safeString (userTrade, 'currency');
        }
        const id = this.safeString (userTrade, 'trade_id');
        const price = this.safeNumber (userTrade, 'price');
        const feeCostFirst = this.safeNumber (otherTrade, 'fee');
        const feeCostSecond = this.safeNumber (userTrade, 'fee');
        const feeCurrencyCodeFirst = this.safeCurrencyCode (this.safeString (otherTrade, 'currency'));
        const feeCurrencyCodeSecond = this.safeCurrencyCode (this.safeString (userTrade, 'currency'));
        let fee = undefined;
        let fees = undefined;
        // fee is either a positive number (invitation rebate)
        // or a negative number (transaction fee deduction)
        // therefore we need to invert the fee
        // more about it https://github.com/ccxt/ccxt/issues/5909
        if ((feeCostFirst !== undefined) && (feeCostFirst !== 0)) {
            if ((feeCostSecond !== undefined) && (feeCostSecond !== 0)) {
                fees = [
                    {
                        'cost': -feeCostFirst,
                        'currency': feeCurrencyCodeFirst,
                    },
                    {
                        'cost': -feeCostSecond,
                        'currency': feeCurrencyCodeSecond,
                    },
                ];
            } else {
                fee = {
                    'cost': -feeCostFirst,
                    'currency': feeCurrencyCodeFirst,
                };
            }
        } else if ((feeCostSecond !== undefined) && (feeCostSecond !== 0)) {
            fee = {
                'cost': -feeCostSecond,
                'currency': feeCurrencyCodeSecond,
            };
        } else {
            fee = {
                'cost': 0,
                'currency': this.safeCurrencyCode (feeCurrencyId),
            };
        }
        //
        // simplified structures to show the underlying semantics
        //
        //     // market/limit sell
        //
        //     {
        //         "currency":"USDT",
        //         "fee":"-0.04647925", // ←--- fee in received quote currency
        //         "price":"129.13", // ←------ price
        //         "size":"30.98616393", // ←-- cost
        //     },
        //     {
        //         "currency":"ETH",
        //         "fee":"0",
        //         "price":"129.13",
        //         "size":"0.23996099", // ←--- amount
        //     },
        //
        //     // market/limit buy
        //
        //     {
        //         "currency":"ETH",
        //         "fee":"-0.00036049", // ←--- fee in received base currency
        //         "price":"129.16", // ←------ price
        //         "size":"0.240322", // ←----- amount
        //     },
        //     {
        //         "currency":"USDT",
        //         "fee":"0",
        //         "price":"129.16",
        //         "size":"31.03998952", // ←-- cost
        //     }
        //
        const timestamp = this.parse8601 (this.safeString2 (userTrade, 'timestamp', 'created_at'));
        let takerOrMaker = this.safeString2 (userTrade, 'exec_type', 'liquidity');
        if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        }
        const orderId = this.safeString (userTrade, 'order_id');
        const result = {
            'info': pair,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
        if (fees !== undefined) {
            result['fees'] = fees;
        }
        return result;
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        const grouped = this.groupBy (trades, 'trade_id');
        const tradeIds = Object.keys (grouped);
        const result = [];
        for (let i = 0; i < tradeIds.length; i++) {
            const tradeId = tradeIds[i];
            const pair = grouped[tradeId];
            // make sure it has exactly 2 trades, no more, no less
            const numTradesInPair = pair.length;
            if (numTradesInPair === 2) {
                const trade = this.parseMyTrade (pair);
                result.push (trade);
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // okex actually returns ledger entries instead of fills here, so each fill in the order
        // is represented by two trades with opposite buy/sell sides, not one :\
        // this aspect renders the 'fills' endpoint unusable for fetchOrderTrades
        // until either OKEX fixes the API or we workaround this on our side somehow
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if ((limit !== undefined) && (limit > 100)) {
            limit = 100;
        }
        const request = {
            'instrument_id': market['id'],
            // 'order_id': id, // string
            // 'after': '1', // pagination of data to return records earlier than the requested ledger_id
            // 'before': '1', // P=pagination of data to return records newer than the requested ledger_id
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        const defaultType = this.safeString2 (this.options, 'fetchMyTrades', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = type + 'GetFills';
        const response = await this[method] (this.extend (request, query));
        //
        //     [
        //         // sell
        //         {
        //             "created_at":"2020-03-29T11:55:25.000Z",
        //             "currency":"USDT",
        //             "exec_type":"T",
        //             "fee":"-0.04647925",
        //             "instrument_id":"ETH-USDT",
        //             "ledger_id":"10562924353",
        //             "liquidity":"T",
        //             "order_id":"4636470489136128",
        //             "price":"129.13",
        //             "product_id":"ETH-USDT",
        //             "side":"buy",
        //             "size":"30.98616393",
        //             "timestamp":"2020-03-29T11:55:25.000Z",
        //             "trade_id":"18551601"
        //         },
        //         {
        //             "created_at":"2020-03-29T11:55:25.000Z",
        //             "currency":"ETH",
        //             "exec_type":"T",
        //             "fee":"0",
        //             "instrument_id":"ETH-USDT",
        //             "ledger_id":"10562924352",
        //             "liquidity":"T",
        //             "order_id":"4636470489136128",
        //             "price":"129.13",
        //             "product_id":"ETH-USDT",
        //             "side":"sell",
        //             "size":"0.23996099",
        //             "timestamp":"2020-03-29T11:55:25.000Z",
        //             "trade_id":"18551601"
        //         },
        //         // buy
        //         {
        //             "created_at":"2020-03-29T11:55:16.000Z",
        //             "currency":"ETH",
        //             "exec_type":"T",
        //             "fee":"-0.00036049",
        //             "instrument_id":"ETH-USDT",
        //             "ledger_id":"10562922669",
        //             "liquidity":"T",
        //             "order_id": "4636469894136832",
        //             "price":"129.16",
        //             "product_id":"ETH-USDT",
        //             "side":"buy",
        //             "size":"0.240322",
        //             "timestamp":"2020-03-29T11:55:16.000Z",
        //             "trade_id":"18551600"
        //         },
        //         {
        //             "created_at":"2020-03-29T11:55:16.000Z",
        //             "currency":"USDT",
        //             "exec_type":"T",
        //             "fee":"0",
        //             "instrument_id":"ETH-USDT",
        //             "ledger_id":"10562922668",
        //             "liquidity":"T",
        //             "order_id":"4636469894136832",
        //             "price":"129.16",
        //             "product_id":"ETH-USDT",
        //             "side":"sell",
        //             "size":"31.03998952",
        //             "timestamp":"2020-03-29T11:55:16.000Z",
        //             "trade_id":"18551600"
        //         }
        //     ]
        //
        return this.parseMyTrades (response, market, since, limit, params);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            // 'instrument_id': market['id'],
            'order_id': id,
            // 'after': '1', // return the page after the specified page number
            // 'before': '1', // return the page before the specified page number
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        const request = {
            'instrument_id': market['id'],
            // 'order_id': id, // string
            // 'after': '1', // pagination of data to return records earlier than the requested ledger_id
            // 'before': '1', // P=pagination of data to return records newer than the requested ledger_id
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        const type = market['type'];
        if ((type === 'futures') || (type === 'swap')) {
            method = type + 'GetInstrumentIdPosition';
        } else if (type === 'option') {
            const underlying = this.safeString (params, 'underlying');
            if (underlying === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchPosition() requires an underlying parameter for ' + type + ' market ' + symbol);
            }
            method = type + 'GetUnderlyingPosition';
        } else {
            throw new NotSupported (this.id + ' fetchPosition() does not support ' + type + ' market ' + symbol + ', supported market types are futures, swap or option');
        }
        const response = await this[method] (this.extend (request, params));
        //
        // futures
        //
        //     crossed margin mode
        //
        //     {
        //         "result": true,
        //         "holding": [
        //             {
        //                 "long_qty": "2",
        //                 "long_avail_qty": "2",
        //                 "long_avg_cost": "8260",
        //                 "long_settlement_price": "8260",
        //                 "realised_pnl": "0.00020928",
        //                 "short_qty": "2",
        //                 "short_avail_qty": "2",
        //                 "short_avg_cost": "8259.99",
        //                 "short_settlement_price": "8259.99",
        //                 "liquidation_price": "113.81",
        //                 "instrument_id": "BTC-USD-191227",
        //                 "leverage": "10",
        //                 "created_at": "2019-09-25T07:58:42.129Z",
        //                 "updated_at": "2019-10-08T14:02:51.029Z",
        //                 "margin_mode": "crossed",
        //                 "short_margin": "0.00242197",
        //                 "short_pnl": "6.63E-6",
        //                 "short_pnl_ratio": "0.002477997",
        //                 "short_unrealised_pnl": "6.63E-6",
        //                 "long_margin": "0.00242197",
        //                 "long_pnl": "-6.65E-6",
        //                 "long_pnl_ratio": "-0.002478",
        //                 "long_unrealised_pnl": "-6.65E-6",
        //                 "long_settled_pnl": "0",
        //                 "short_settled_pnl": "0",
        //                 "last": "8257.57"
        //             }
        //         ],
        //         "margin_mode": "crossed"
        //     }
        //
        //     fixed margin mode
        //
        //     {
        //         "result": true,
        //         "holding": [
        //             {
        //                 "long_qty": "4",
        //                 "long_avail_qty": "4",
        //                 "long_margin": "0.00323844",
        //                 "long_liqui_price": "7762.09",
        //                 "long_pnl_ratio": "0.06052306",
        //                 "long_avg_cost": "8234.43",
        //                 "long_settlement_price": "8234.43",
        //                 "realised_pnl": "-0.00000296",
        //                 "short_qty": "2",
        //                 "short_avail_qty": "2",
        //                 "short_margin": "0.00241105",
        //                 "short_liqui_price": "9166.74",
        //                 "short_pnl_ratio": "0.03318052",
        //                 "short_avg_cost": "8295.13",
        //                 "short_settlement_price": "8295.13",
        //                 "instrument_id": "BTC-USD-191227",
        //                 "long_leverage": "15",
        //                 "short_leverage": "10",
        //                 "created_at": "2019-09-25T07:58:42.129Z",
        //                 "updated_at": "2019-10-08T13:12:09.438Z",
        //                 "margin_mode": "fixed",
        //                 "short_margin_ratio": "0.10292507",
        //                 "short_maint_margin_ratio": "0.005",
        //                 "short_pnl": "7.853E-5",
        //                 "short_unrealised_pnl": "7.853E-5",
        //                 "long_margin_ratio": "0.07103743",
        //                 "long_maint_margin_ratio": "0.005",
        //                 "long_pnl": "1.9841E-4",
        //                 "long_unrealised_pnl": "1.9841E-4",
        //                 "long_settled_pnl": "0",
        //                 "short_settled_pnl": "0",
        //                 "last": "8266.99"
        //             }
        //         ],
        //         "margin_mode": "fixed"
        //     }
        //
        // swap
        //
        //     crossed margin mode
        //
        //     {
        //         "margin_mode": "crossed",
        //         "timestamp": "2019-09-27T03:49:02.018Z",
        //         "holding": [
        //             {
        //                 "avail_position": "3",
        //                 "avg_cost": "59.49",
        //                 "instrument_id": "LTC-USD-SWAP",
        //                 "last": "55.98",
        //                 "leverage": "10.00",
        //                 "liquidation_price": "4.37",
        //                 "maint_margin_ratio": "0.0100",
        //                 "margin": "0.0536",
        //                 "position": "3",
        //                 "realized_pnl": "0.0000",
        //                 "unrealized_pnl": "0",
        //                 "settled_pnl": "-0.0330",
        //                 "settlement_price": "55.84",
        //                 "side": "long",
        //                 "timestamp": "2019-09-27T03:49:02.018Z"
        //             },
        //         ]
        //     }
        //
        //     fixed margin mode
        //
        //     {
        //         "margin_mode": "fixed",
        //         "timestamp": "2019-09-27T03:47:37.230Z",
        //         "holding": [
        //             {
        //                 "avail_position": "20",
        //                 "avg_cost": "8025.0",
        //                 "instrument_id": "BTC-USD-SWAP",
        //                 "last": "8113.1",
        //                 "leverage": "15.00",
        //                 "liquidation_price": "7002.6",
        //                 "maint_margin_ratio": "0.0050",
        //                 "margin": "0.0454",
        //                 "position": "20",
        //                 "realized_pnl": "-0.0001",
        //                 "unrealized_pnl": "0",
        //                 "settled_pnl": "0.0076",
        //                 "settlement_price": "8279.2",
        //                 "side": "long",
        //                 "timestamp": "2019-09-27T03:47:37.230Z"
        //             }
        //         ]
        //     }
        //
        // option
        //
        //     {
        //         "holding":[
        //             {
        //                 "instrument_id":"BTC-USD-190927-12500-C",
        //                 "position":"20",
        //                 "avg_cost":"3.26",
        //                 "avail_position":"20",
        //                 "settlement_price":"0.017",
        //                 "total_pnl":"50",
        //                 "pnl_ratio":"0.3",
        //                 "realized_pnl":"40",
        //                 "unrealized_pnl":"10",
        //                 "pos_margin":"100",
        //                 "option_value":"70",
        //                 "created_at":"2019-08-30T03:09:20.315Z",
        //                 "updated_at":"2019-08-30T03:40:18.318Z"
        //             },
        //             {
        //                 "instrument_id":"BTC-USD-190927-12500-P",
        //                 "position":"20",
        //                 "avg_cost":"3.26",
        //                 "avail_position":"20",
        //                 "settlement_price":"0.019",
        //                 "total_pnl":"50",
        //                 "pnl_ratio":"0.3",
        //                 "realized_pnl":"40",
        //                 "unrealized_pnl":"10",
        //                 "pos_margin":"100",
        //                 "option_value":"70",
        //                 "created_at":"2019-08-30T03:09:20.315Z",
        //                 "updated_at":"2019-08-30T03:40:18.318Z"
        //             }
        //         ]
        //     }
        //
        // todo unify parsePosition/parsePositions
        return response;
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let method = undefined;
        const defaultType = this.safeString2 (this.options, 'fetchPositions', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        if ((type === 'futures') || (type === 'swap')) {
            method = type + 'GetPosition';
        } else if (type === 'option') {
            const underlying = this.safeString (params, 'underlying');
            if (underlying === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() requires an underlying parameter for ' + type + ' markets');
            }
            method = type + 'GetUnderlyingPosition';
        } else {
            throw new NotSupported (this.id + ' fetchPositions() does not support ' + type + ' markets, supported market types are futures, swap or option');
        }
        params = this.omit (params, 'type');
        const response = await this[method] (params);
        //
        // futures
        //
        //     ...
        //
        //
        // swap
        //
        //     ...
        //
        // option
        //
        //     {
        //         "holding":[
        //             {
        //                 "instrument_id":"BTC-USD-190927-12500-C",
        //                 "position":"20",
        //                 "avg_cost":"3.26",
        //                 "avail_position":"20",
        //                 "settlement_price":"0.017",
        //                 "total_pnl":"50",
        //                 "pnl_ratio":"0.3",
        //                 "realized_pnl":"40",
        //                 "unrealized_pnl":"10",
        //                 "pos_margin":"100",
        //                 "option_value":"70",
        //                 "created_at":"2019-08-30T03:09:20.315Z",
        //                 "updated_at":"2019-08-30T03:40:18.318Z"
        //             },
        //             {
        //                 "instrument_id":"BTC-USD-190927-12500-P",
        //                 "position":"20",
        //                 "avg_cost":"3.26",
        //                 "avail_position":"20",
        //                 "settlement_price":"0.019",
        //                 "total_pnl":"50",
        //                 "pnl_ratio":"0.3",
        //                 "realized_pnl":"40",
        //                 "unrealized_pnl":"10",
        //                 "pos_margin":"100",
        //                 "option_value":"70",
        //                 "created_at":"2019-08-30T03:09:20.315Z",
        //                 "updated_at":"2019-08-30T03:40:18.318Z"
        //             }
        //         ]
        //     }
        //
        // todo unify parsePosition/parsePositions
        return response;
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchLedger', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const suffix = (type === 'account') ? '' : 'Accounts';
        let argument = '';
        const request = {
            // 'from': 'id',
            // 'to': 'id',
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if (type === 'spot') {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + " fetchLedger() requires a currency code argument for '" + type + "' markets");
            }
            argument = 'Currency';
            currency = this.currency (code);
            request['currency'] = currency['id'];
        } else if (type === 'futures') {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + " fetchLedger() requires an underlying symbol for '" + type + "' markets");
            }
            argument = 'Underlying';
            const market = this.market (code); // we intentionally put a market inside here for the margin and swap ledgers
            const marketInfo = this.safeValue (market, 'info', {});
            const settlementCurrencyId = this.safeString (marketInfo, 'settlement_currency');
            const settlementCurrencyСode = this.safeCurrencyCode (settlementCurrencyId);
            currency = this.currency (settlementCurrencyСode);
            const underlyingId = this.safeString (marketInfo, 'underlying');
            request['underlying'] = underlyingId;
        } else if ((type === 'margin') || (type === 'swap')) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + " fetchLedger() requires a code argument (a market symbol) for '" + type + "' markets");
            }
            argument = 'InstrumentId';
            const market = this.market (code); // we intentionally put a market inside here for the margin and swap ledgers
            currency = this.currency (market['base']);
            request['instrument_id'] = market['id'];
            //
            //     if (type === 'margin') {
            //         //
            //         //      3. Borrow
            //         //      4. Repayment
            //         //      5. Interest
            //         //      7. Buy
            //         //      8. Sell
            //         //      9. From capital account
            //         //     10. From C2C
            //         //     11. From Futures
            //         //     12. From Spot
            //         //     13. From ETT
            //         //     14. To capital account
            //         //     15. To C2C
            //         //     16. To Spot
            //         //     17. To Futures
            //         //     18. To ETT
            //         //     19. Mandatory Repayment
            //         //     20. From Piggybank
            //         //     21. To Piggybank
            //         //     22. From Perpetual
            //         //     23. To Perpetual
            //         //     24. Liquidation Fee
            //         //     54. Clawback
            //         //     59. Airdrop Return.
            //         //
            //         request['type'] = 'number'; // All types will be returned if this filed is left blank
            //     }
            //
        } else if (type === 'account') {
            if (code !== undefined) {
                currency = this.currency (code);
                request['currency'] = currency['id'];
            }
            //
            //     //
            //     //      1. deposit
            //     //      2. withdrawal
            //     //     13. cancel withdrawal
            //     //     18. into futures account
            //     //     19. out of futures account
            //     //     20. into sub account
            //     //     21. out of sub account
            //     //     28. claim
            //     //     29. into ETT account
            //     //     30. out of ETT account
            //     //     31. into C2C account
            //     //     32. out of C2C account
            //     //     33. into margin account
            //     //     34. out of margin account
            //     //     37. into spot account
            //     //     38. out of spot account
            //     //
            //     request['type'] = 'number';
            //
        } else {
            throw new NotSupported (this.id + " fetchLedger does not support the '" + type + "' type (the type must be one of 'account', 'spot', 'margin', 'futures', 'swap')");
        }
        const method = type + 'Get' + suffix + argument + 'Ledger';
        const response = await this[method] (this.extend (request, query));
        //
        // transfer     funds transfer in/out
        // trade        funds moved as a result of a trade, spot and margin accounts only
        // rebate       fee rebate as per fee schedule, spot and margin accounts only
        // match        open long/open short/close long/close short (futures) or a change in the amount because of trades (swap)
        // fee          fee, futures only
        // settlement   settlement/clawback/settle long/settle short
        // liquidation  force close long/force close short/deliver close long/deliver close short
        // funding      funding fee, swap only
        // margin       a change in the amount after adjusting margin, swap only
        //
        // account
        //
        //     [
        //         {
        //             "amount":0.00051843,
        //             "balance":0.00100941,
        //             "currency":"BTC",
        //             "fee":0,
        //             "ledger_id":8987285,
        //             "timestamp":"2018-10-12T11:01:14.000Z",
        //             "typename":"Get from activity"
        //         }
        //     ]
        //
        // spot
        //
        //     [
        //         {
        //             "timestamp":"2019-03-18T07:08:25.000Z",
        //             "ledger_id":"3995334780",
        //             "created_at":"2019-03-18T07:08:25.000Z",
        //             "currency":"BTC",
        //             "amount":"0.0009985",
        //             "balance":"0.0029955",
        //             "type":"trade",
        //             "details":{
        //                 "instrument_id":"BTC-USDT",
        //                 "order_id":"2500650881647616",
        //                 "product_id":"BTC-USDT"
        //             }
        //         }
        //     ]
        //
        // margin
        //
        //     [
        //         [
        //             {
        //                 "created_at":"2019-03-20T03:45:05.000Z",
        //                 "ledger_id":"78918186",
        //                 "timestamp":"2019-03-20T03:45:05.000Z",
        //                 "currency":"EOS",
        //                 "amount":"0", // ?
        //                 "balance":"0.59957711",
        //                 "type":"transfer",
        //                 "details":{
        //                     "instrument_id":"EOS-USDT",
        //                     "order_id":"787057",
        //                     "product_id":"EOS-USDT"
        //                 }
        //             }
        //         ],
        //         {
        //             "before":"78965766",
        //             "after":"78918186"
        //         }
        //     ]
        //
        // futures
        //
        //     [
        //         {
        //             "ledger_id":"2508090544914461",
        //             "timestamp":"2019-03-19T14:40:24.000Z",
        //             "amount":"-0.00529521",
        //             "balance":"0",
        //             "currency":"EOS",
        //             "type":"fee",
        //             "details":{
        //                 "order_id":"2506982456445952",
        //                 "instrument_id":"EOS-USD-190628"
        //             }
        //         }
        //     ]
        //
        // swap
        //
        //     [
        //         {
        //             "amount":"0.004742",
        //             "fee":"-0.000551",
        //             "type":"match",
        //             "instrument_id":"EOS-USD-SWAP",
        //             "ledger_id":"197429674941902848",
        //             "timestamp":"2019-03-25T05:56:31.286Z"
        //         },
        //     ]
        //
        const responseLength = response.length;
        if (responseLength < 1) {
            return [];
        }
        const isArray = Array.isArray (response[0]);
        const isMargin = (type === 'margin');
        const entries = (isMargin && isArray) ? response[0] : response;
        if (type === 'swap') {
            const ledgerEntries = this.parseLedger (entries);
            return this.filterBySymbolSinceLimit (ledgerEntries, code, since, limit);
        }
        return this.parseLedger (entries, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            'transfer': 'transfer', // // funds transfer in/out
            'trade': 'trade', // funds moved as a result of a trade, spot and margin accounts only
            'rebate': 'rebate', // fee rebate as per fee schedule, spot and margin accounts only
            'match': 'trade', // open long/open short/close long/close short (futures) or a change in the amount because of trades (swap)
            'fee': 'fee', // fee, futures only
            'settlement': 'trade', // settlement/clawback/settle long/settle short
            'liquidation': 'trade', // force close long/force close short/deliver close long/deliver close short
            'funding': 'fee', // funding fee, swap only
            'margin': 'margin', // a change in the amount after adjusting margin, swap only
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //
        // account
        //
        //     {
        //         "amount":0.00051843,
        //         "balance":0.00100941,
        //         "currency":"BTC",
        //         "fee":0,
        //         "ledger_id":8987285,
        //         "timestamp":"2018-10-12T11:01:14.000Z",
        //         "typename":"Get from activity"
        //     }
        //
        // spot
        //
        //     {
        //         "timestamp":"2019-03-18T07:08:25.000Z",
        //         "ledger_id":"3995334780",
        //         "created_at":"2019-03-18T07:08:25.000Z",
        //         "currency":"BTC",
        //         "amount":"0.0009985",
        //         "balance":"0.0029955",
        //         "type":"trade",
        //         "details":{
        //             "instrument_id":"BTC-USDT",
        //             "order_id":"2500650881647616",
        //             "product_id":"BTC-USDT"
        //         }
        //     }
        //
        // margin
        //
        //     {
        //         "created_at":"2019-03-20T03:45:05.000Z",
        //         "ledger_id":"78918186",
        //         "timestamp":"2019-03-20T03:45:05.000Z",
        //         "currency":"EOS",
        //         "amount":"0", // ?
        //         "balance":"0.59957711",
        //         "type":"transfer",
        //         "details":{
        //             "instrument_id":"EOS-USDT",
        //             "order_id":"787057",
        //             "product_id":"EOS-USDT"
        //         }
        //     }
        //
        // futures
        //
        //     {
        //         "ledger_id":"2508090544914461",
        //         "timestamp":"2019-03-19T14:40:24.000Z",
        //         "amount":"-0.00529521",
        //         "balance":"0",
        //         "currency":"EOS",
        //         "type":"fee",
        //         "details":{
        //             "order_id":"2506982456445952",
        //             "instrument_id":"EOS-USD-190628"
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "amount":"0.004742",
        //         "fee":"-0.000551",
        //         "type":"match",
        //         "instrument_id":"EOS-USD-SWAP",
        //         "ledger_id":"197429674941902848",
        //         "timestamp":"2019-03-25T05:56:31.286Z"
        //     },
        //
        const id = this.safeString (item, 'ledger_id');
        const account = undefined;
        const details = this.safeValue (item, 'details', {});
        const referenceId = this.safeString (details, 'order_id');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'currency'), currency);
        const amount = this.safeNumber (item, 'amount');
        const timestamp = this.parse8601 (this.safeString (item, 'timestamp'));
        const fee = {
            'cost': this.safeNumber (item, 'fee'),
            'currency': code,
        };
        const before = undefined;
        const after = this.safeNumber (item, 'balance');
        const status = 'ok';
        const marketId = this.safeString (item, 'instrument_id');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        return {
            'info': item,
            'id': id,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'symbol': symbol,
            'amount': amount,
            'before': before, // balance before
            'after': after, // balance after
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isArray = Array.isArray (params);
        const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeParams (this.urls['api']['rest'], { 'hostname': this.hostname }) + request;
        // const type = this.getPathAuthenticationType (path);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.iso8601 (this.milliseconds ());
            headers = {
                'OK-ACCESS-KEY': this.apiKey,
                'OK-ACCESS-PASSPHRASE': this.password,
                'OK-ACCESS-TIMESTAMP': timestamp,
                // 'OK-FROM': '',
                // 'OK-TO': '',
                // 'OK-LIMIT': '',
            };
            let auth = timestamp + method + request;
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    const urlencodedQuery = '?' + this.urlencode (query);
                    url += urlencodedQuery;
                    auth += urlencodedQuery;
                }
            } else {
                if (isArray || Object.keys (query).length) {
                    body = this.json (query);
                    auth += body;
                }
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            headers['OK-ACCESS-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        const feedback = this.id + ' ' + body;
        if (code === 503) {
            // {"message":"name resolution failed"}
            throw new ExchangeNotAvailable (feedback);
        }
        //
        //     {"error_message":"Order does not exist","result":"true","error_code":"35029","order_id":"-1"}
        //
        const message = this.safeString (response, 'message');
        const errorCode = this.safeString2 (response, 'code', 'error_code');
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        const nonZeroErrorCode = (errorCode !== undefined) && (errorCode !== '0');
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        if (nonZeroErrorCode) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        if (nonZeroErrorCode || nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
