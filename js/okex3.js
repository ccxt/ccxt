'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class okex3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex3',
            'name': 'OKEX',
            'countries': [ 'CN', 'US' ],
            'version': 'v3',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false, // see below
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
                'fetchMyTrades': false, // they don't have it
                'fetchDepositAddress': true,
                'fetchOrderTrades': true,
                'fetchTickers': true,
                'fetchLedger': true,
                'withdraw': true,
                'futures': true,
            },
            'timeframes': {
                '1m': '60',
                '3m': '180',
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
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': 'https://www.okex.com',
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/docs/en/',
                'fees': 'https://www.okex.com/pages/products/fees.html',
            },
            'api': {
                'general': {
                    'get': [
                        'time',
                    ],
                },
                'account': {
                    'get': [
                        'currencies',
                        'wallet',
                        'wallet/{currency}',
                        'withdrawal/fee',
                        'withdrawal/history',
                        'withdrawal/history/{currency}',
                        'ledger',
                        'deposit/address',
                        'deposit/history',
                        'deposit/history/{currency}',
                    ],
                    'post': [
                        'transfer',
                        'withdrawal',
                    ],
                },
                'spot': {
                    'get': [
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/ledger',
                        'orders',
                        'orders_pending',
                        'orders/{order_id}',
                        'orders/{client_oid}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/book',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                    ],
                    'post': [
                        'orders',
                        'batch_orders',
                        'cancel_orders/{order_id}',
                        'cancel_orders/{client_oid}',
                        'cancel_batch_orders',
                    ],
                },
                'margin': {
                    'get': [
                        'accounts',
                        'accounts/{instrument_id}',
                        'accounts/{instrument_id}/ledger',
                        'accounts/availability',
                        'accounts/{instrument_id}/availability',
                        'accounts/borrowed',
                        'accounts/{instrument_id}/borrowed',
                        'orders',
                        'orders/{order_id}',
                        'orders/{client_oid}',
                        'orders_pending',
                        'fills',
                    ],
                    'post': [
                        'accounts/borrow',
                        'accounts/repayment',
                        'orders',
                        'batch_orders',
                        'cancel_orders',
                        'cancel_orders/{order_id}',
                        'cancel_orders/{client_oid}',
                        'cancel_batch_orders',
                    ],
                },
                'futures': {
                    'get': [
                        'position',
                        '{instrument_id}/position',
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/leverage',
                        'accounts/{currency}/ledger',
                        'orders/{instrument_id}',
                        'orders/{instrument_id}/{order_id}',
                        'orders/{instrument_id}/{client_oid}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/book',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                        'accounts/{instrument_id}/holds',
                        'instruments/{instrument_id}/index',
                        'rate',
                        'instruments/{instrument_id}/estimated_price',
                        'instruments/{instrument_id}/open_interest',
                        'instruments/{instrument_id}/price_limit',
                        'instruments/{instrument_id}/liquidation',
                        'instruments/{instrument_id}/mark_price',
                    ],
                    'post': [
                        'accounts/{currency}/leverage',
                        'order',
                        'orders',
                        'cancel_order/{instrument_id}/{order_id}',
                        'cancel_order/{instrument_id}/{client_oid}',
                        'cancel_batch_orders/{instrument_id}',
                    ],
                },
                'swap': {
                    'get': [
                        'position',
                        '{instrument_id}/position',
                        'accounts',
                        '{instrument_id}/accounts',
                        'accounts/{instrument_id}/settings',
                        'accounts/{instrument_id}/ledger',
                        'accounts/{instrument_id}/holds',
                        'orders/{instrument_id}',
                        'orders/{instrument_id}/{order_id}',
                        'orders/{instrument_id}/{client_oid}',
                        'fills',
                        // public
                        'instruments',
                        'instruments/{instrument_id}/depth?size=50',
                        'instruments/ticker',
                        'instruments/{instrument_id}/ticker',
                        'instruments/{instrument_id}/trades',
                        'instruments/{instrument_id}/candles',
                        'instruments/{instrument_id}/index',
                        'rate',
                        'instruments/{instrument_id}/open_interest',
                        'instruments/{instrument_id}/price_limit',
                        'instruments/{instrument_id}/liquidation',
                        'instruments/{instrument_id}/funding_time',
                        'instruments/{instrument_id}/mark_price',
                        'instruments/{instrument_id}/historical_funding_rate',
                    ],
                    'post': [
                        'accounts/{instrument_id}/leverage',
                        'order',
                        'orders',
                        'cancel_order/{instrument_id}/{order_id}',
                        'cancel_order/{instrument_id}/{client_oid}',
                        'cancel_batch_orders/{instrument_id}',
                    ],
                },
                // they have removed this part from public
                'ett': {
                    'get': [
                        'accounts',
                        'accounts/{currency}',
                        'accounts/{currency}/ledger',
                        'orders', // fetchOrder, fetchOrders
                        // public
                        'constituents/{ett}',
                        'define-price/{ett}',
                    ],
                    'post': [
                        'orders',
                        'orders/{order_id}',
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
                    'taker': 0.0030,
                    'maker': 0.0020,
                },
                'swap': {
                    'taker': 0.0070,
                    'maker': 0.0020,
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
                    'failure to get a peer from the ring-balancer': ExchangeError, // { "message": "failure to get a peer from the ring-balancer" }
                    '4010': PermissionDenied, // { "code": 4010, "message": "For the security of your funds, withdrawals are not permitted within 24 hours after changing fund password  / mobile number / Google Authenticator settings " }
                    // common
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
                    '30024': BadRequest, // { "code": 30024, "message": "{0} parameter value error" }
                    '30025': BadRequest, // { "code": 30025, "message": "{0} parameter category error" }
                    '30026': DDoSProtection, // { "code": 30026, "message": "requested too frequent" }
                    '30027': AuthenticationError, // { "code": 30027, "message": "login failure" }
                    '30028': PermissionDenied, // { "code": 30028, "message": "unauthorized execution" }
                    '30029': AccountSuspended, // { "code": 30029, "message": "account suspended" }
                    '30030': ExchangeError, // { "code": 30030, "message": "endpoint request failed. Please try again" }
                    '30031': BadRequest, // { "code": 30031, "message": "token does not exist" }
                    '30032': ExchangeError, // { "code": 30032, "message": "pair does not exist" }
                    '30033': BadRequest, // { "code": 30033, "message": "exchange domain does not exist" }
                    '30034': ExchangeError, // { "code": 30034, "message": "exchange ID does not exist" }
                    '30035': ExchangeError, // { "code": 30035, "message": "trading is not supported in this website" }
                    '30036': ExchangeError, // { "code": 30036, "message": "no relevant data" }
                    '30038': AuthenticationError, // { "code": 30038, "message": "user does not exist" }
                    '30037': ExchangeNotAvailable, // { "code": 30037, "message": "endpoint is offline or unavailable" }
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
                    '32029': ExchangeError, // { "code": 32029, "message": "order info does not exist" }
                    '32028': ExchangeError, // { "code": 32028, "message": "account is suspended and liquidated" }
                    '32027': ExchangeError, // { "code": 32027, "message": "cancelled over 20 orders" }
                    '32044': ExchangeError, // { "code": 32044, "message": "The margin ratio after submitting this order is lower than the minimum requirement ({0}) for your tier." }
                    // token and margin trading
                    '33001': PermissionDenied, // { "code": 33001, "message": "margin account for this pair is not enabled yet" }
                    '33002': AccountSuspended, // { "code": 33002, "message": "margin account for this pair is suspended" }
                    '33003': InsufficientFunds, // { "code": 33003, "message": "no loan balance" }
                    '33004': ExchangeError, // { "code": 33004, "message": "loan amount cannot be smaller than the minimum limit" }
                    '33005': ExchangeError, // { "code": 33005, "message": "repayment amount must exceed 0" }
                    '33006': ExchangeError, // { "code": 33006, "message": "loan order not found" }
                    '33007': ExchangeError, // { "code": 33007, "message": "status not found" }
                    '33008': ExchangeError, // { "code": 33008, "message": "loan amount cannot exceed the maximum limit" }
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
                    '33059': BadRequest, // { "code": 33059, "message": "client_oid or order_id is required" }
                    '33060': BadRequest, // { "code": 33060, "message": "Only fill in either parameter client_oid or order_id" }
                    // account
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
                },
                'broad': {
                },
            },
            'options': {
                'fetchMarkets': [ 'spot', 'futures', 'swap' ],
                'defaultType': 'spot', // 'account', 'spot', 'margin', 'futures', 'swap'
                'auth': {
                    'time': 'public',
                    'currencies': 'private',
                    'instruments': 'public',
                    'rate': 'public',
                    'constituents/{ett}': 'public',
                    'define-price/{ett}': 'public',
                },
            },
            'commonCurrencies': {
                // OKEX refers to ERC20 version of Aeternity (AEToken)
                'AE': 'AET', // https://github.com/ccxt/ccxt/issues/4981
                'FAIR': 'FairGame',
                'HOT': 'Hydro Protocol',
                'HSR': 'HC',
                'MAG': 'Maggie',
                'YOYO': 'YOYOW',
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.generalGetTime (params);
        //
        //     {
        //         "iso": "2015-01-07T23:47:25.201Z",
        //         "epoch": 1420674445.201
        //     }
        //
        return this.parse8601 (this.safeString (response, 'iso'));
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
        // spot markets
        //
        //     [ {   base_currency: "EOS",
        //           instrument_id: "EOS-OKB",
        //                min_size: "0.01",
        //              product_id: "EOS-OKB",
        //          quote_currency: "OKB",
        //          size_increment: "0.000001",
        //               tick_size: "0.0001"        },
        //
        //       ..., // the spot endpoint also returns ETT instruments
        //
        //       {   base_currency: "OK06ETT",
        //          base_increment: "0.00000001",
        //           base_min_size: "0.01",
        //           instrument_id: "OK06ETT-USDT",
        //                min_size: "0.01",
        //              product_id: "OK06ETT-USDT",
        //          quote_currency: "USDT",
        //         quote_increment: "0.0001",
        //          size_increment: "0.00000001",
        //               tick_size: "0.0001"        } ]
        //
        // futures markets
        //
        //     [ {    instrument_id: "BTG-USD-190329",
        //         underlying_index: "BTG",
        //           quote_currency: "USD",
        //                tick_size: "0.01",
        //             contract_val: "10",
        //                  listing: "2018-12-14",
        //                 delivery: "2019-03-29",
        //          trade_increment: "1"               }  ]
        //
        // swap markets
        //
        //     [ {    instrument_id: "BTC-USD-SWAP",
        //         underlying_index: "BTC",
        //           quote_currency: "USD",
        //                     coin: "BTC",
        //             contract_val: "100",
        //                  listing: "2018-10-23T20:11:00.443Z",
        //                 delivery: "2018-10-24T20:11:00.443Z",
        //           size_increment: "4",
        //                tick_size: "4"                         }  ]
        //
        const id = this.safeString (market, 'instrument_id');
        let marketType = 'spot';
        let spot = true;
        let future = false;
        let swap = false;
        let baseId = this.safeString (market, 'base_currency');
        if (baseId === undefined) {
            marketType = 'swap';
            spot = false;
            swap = true;
            baseId = this.safeString (market, 'coin');
            if (baseId === undefined) {
                swap = false;
                future = true;
                marketType = 'futures';
                baseId = this.safeString (market, 'underlying_index');
            }
        }
        const quoteId = this.safeString (market, 'quote_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = spot ? (base + '/' + quote) : id;
        let amountPrecision = this.safeString (market, 'size_increment');
        if (amountPrecision !== undefined) {
            amountPrecision = this.precisionFromString (amountPrecision);
        }
        let pricePrecision = this.safeString (market, 'tick_size');
        if (pricePrecision !== undefined) {
            pricePrecision = this.precisionFromString (pricePrecision);
        }
        const precision = {
            'amount': amountPrecision,
            'price': pricePrecision,
        };
        const minAmount = this.safeFloat2 (market, 'min_size', 'base_min_size');
        let minPrice = this.safeFloat (market, 'tick_size');
        if (precision['price'] !== undefined) {
            minPrice = Math.pow (10, -precision['price']);
        }
        let minCost = undefined;
        if (minAmount !== undefined && minPrice !== undefined) {
            minCost = minAmount * minPrice;
        }
        const active = true;
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
            'futures': future,
            'swap': swap,
            'active': active,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': minAmount,
                    'max': undefined,
                },
                'price': {
                    'min': minPrice,
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
        const method = type + 'GetInstruments';
        const response = await this[method] (params);
        //
        // spot markets
        //
        //     [ {   base_currency: "EOS",
        //          base_increment: "0.000001",
        //           base_min_size: "0.01",
        //           instrument_id: "EOS-OKB",
        //                min_size: "0.01",
        //              product_id: "EOS-OKB",
        //          quote_currency: "OKB",
        //         quote_increment: "0.0001",
        //          size_increment: "0.000001",
        //               tick_size: "0.0001"    }      ]
        //
        // futures markets
        //
        //     [ {    instrument_id: "BTG-USD-190329",
        //         underlying_index: "BTG",
        //           quote_currency: "USD",
        //                tick_size: "0.01",
        //             contract_val: "10",
        //                  listing: "2018-12-14",
        //                 delivery: "2019-03-29",
        //          trade_increment: "1"               }  ]
        //
        // swap markets
        //
        //     [ {    instrument_id: "BTC-USD-SWAP",
        //         underlying_index: "BTC",
        //           quote_currency: "USD",
        //                     coin: "BTC",
        //             contract_val: "100",
        //                  listing: "2018-10-23T20:11:00.443Z",
        //                 delivery: "2018-10-24T20:11:00.443Z",
        //           size_increment: "4",
        //                tick_size: "4"                         }  ]
        //
        return this.parseMarkets (response);
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
            const precision = 8; // default precision, todo: fix "magic constants"
            const name = this.safeString (currency, 'name');
            const canDeposit = this.safeInteger (currency, 'can_deposit');
            const canWithdraw = this.safeInteger (currency, 'can_withdraw');
            const active = canDeposit && canWithdraw;
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
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'min_withdrawal'),
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
        let method = market['type'] + 'GetInstrumentsInstrumentId';
        method += (market['type'] === 'swap') ? 'Depth' : 'Book';
        const request = {
            'instrument_id': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // max 200
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {      asks: [ ["0.02685268", "0.242571", "1"],
        //                    ["0.02685493", "0.164085", "1"],
        //                    ...
        //                    ["0.02779", "1.039", "1"],
        //                    ["0.027813", "0.0876", "1"]        ],
        //            bids: [ ["0.02684052", "10.371849", "1"],
        //                    ["0.02684051", "3.707", "4"],
        //                    ...
        //                    ["0.02634963", "0.132934", "1"],
        //                    ["0.02634962", "0.264838", "2"]    ],
        //       timestamp:   "2018-12-17T20:24:16.159Z"            }
        //
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {         best_ask: "0.02665472",
        //               best_bid: "0.02665221",
        //          instrument_id: "ETH-BTC",
        //             product_id: "ETH-BTC",
        //                   last: "0.02665472",
        //                    ask: "0.02665472", // missing in the docs
        //                    bid: "0.02665221", // not mentioned in the docs
        //               open_24h: "0.02645482",
        //               high_24h: "0.02714633",
        //                low_24h: "0.02614109",
        //        base_volume_24h: "572298.901923",
        //              timestamp: "2018-12-17T21:20:07.856Z",
        //       quote_volume_24h: "15094.86831261"            }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'instrument_id');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else if (marketId !== undefined) {
            const parts = marketId.split ('-');
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
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const open = this.safeFloat (ticker, 'open_24h');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_24h'),
            'low': this.safeFloat (ticker, 'low_24h'),
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'base_volume_24h'),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume_24h'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdTicker';
        const request = {
            'instrument_id': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        //
        //     {         best_ask: "0.02665472",
        //               best_bid: "0.02665221",
        //          instrument_id: "ETH-BTC",
        //             product_id: "ETH-BTC",
        //                   last: "0.02665472",
        //                    ask: "0.02665472",
        //                    bid: "0.02665221",
        //               open_24h: "0.02645482",
        //               high_24h: "0.02714633",
        //                low_24h: "0.02614109",
        //        base_volume_24h: "572298.901923",
        //              timestamp: "2018-12-17T21:20:07.856Z",
        //       quote_volume_24h: "15094.86831261"            }
        //
        return this.parseTicker (response);
    }

    async fetchTickersByType (type, symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const method = type + 'GetInstrumentsTicker';
        const response = await this[method] (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
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
        //     spot trades
        //
        //         {
        //             time: "2018-12-17T23:31:08.268Z",
        //             timestamp: "2018-12-17T23:31:08.268Z",
        //             trade_id: "409687906",
        //             price: "0.02677805",
        //             size: "0.923467",
        //             side: "sell"
        //         }
        //
        //     futures trades, swap trades
        //
        //         {
        //             trade_id: "1989230840021013",
        //             side: "buy",
        //             price: "92.42",
        //             qty: "184", // missing in swap markets
        //             size: "5", // missing in futures markets
        //             timestamp: "2018-12-17T23:26:04.613Z"
        //         }
        //
        // fetchOrderTrades (private)
        //
        //     spot trades, margin trades
        //
        //         {
        //             "created_at":"2019-03-15T02:52:56.000Z",
        //             "exec_type":"T", // whether the order is taker or maker
        //             "fee":"0.00000082",
        //             "instrument_id":"BTC-USDT",
        //             "ledger_id":"3963052721",
        //             "liquidity":"T", // whether the order is taker or maker
        //             "order_id":"2482659399697408",
        //             "price":"3888.6",
        //             "product_id":"BTC-USDT",
        //             "side":"buy",
        //             "size":"0.00055306",
        //             "timestamp":"2019-03-15T02:52:56.000Z"
        //         },
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
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString2 (trade, 'timestamp', 'created_at'));
        const price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat2 (trade, 'size', 'qty');
        amount = this.safeFloat (trade, 'order_qty', amount);
        let takerOrMaker = this.safeString2 (trade, 'exec_type', 'liquidity');
        if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        }
        const side = this.safeString (trade, 'side');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        const feeCost = this.safeFloat (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = undefined;
            fee = {
                'cost': feeCost,
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdTrades';
        if ((limit === undefined) || (limit > 100)) {
            limit = 100; // maximum = default = 100
        }
        const request = {
            'instrument_id': market['id'],
            'limit': limit,
            // from: 'id',
            // to: 'id',
        };
        const response = await this[method] (this.extend (request, params));
        //
        // spot markets
        //
        //     [
        //         {
        //             time: "2018-12-17T23:31:08.268Z",
        //             timestamp: "2018-12-17T23:31:08.268Z",
        //             trade_id: "409687906",
        //             price: "0.02677805",
        //             size: "0.923467",
        //             side: "sell"
        //         }
        //     ]
        //
        // futures markets, swap markets
        //
        //     [
        //         {
        //             trade_id: "1989230840021013",
        //             side: "buy",
        //             price: "92.42",
        //             qty: "184", // missing in swap markets
        //             size: "5", // missing in futures markets
        //             timestamp: "2018-12-17T23:26:04.613Z"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        // spot markets
        //
        //     {
        //         close: "0.02684545",
        //         high: "0.02685084",
        //         low: "0.02683312",
        //         open: "0.02683894",
        //         time: "2018-12-17T20:28:00.000Z",
        //         volume: "101.457222"
        //     }
        //
        // futures markets
        //
        //     [
        //         1545072720000,
        //         0.3159,
        //         0.3161,
        //         0.3144,
        //         0.3149,
        //         22886,
        //         725179.26172331,
        //     ]
        //
        if (Array.isArray (ohlcv)) {
            const numElements = ohlcv.length;
            const volumeIndex = (numElements > 6) ? 6 : 5;
            let timestamp = ohlcv[0];
            if (typeof timestamp === 'string') {
                timestamp = this.parse8601 (timestamp);
            }
            return [
                timestamp, // timestamp
                parseFloat (ohlcv[1]),            // Open
                parseFloat (ohlcv[2]),            // High
                parseFloat (ohlcv[3]),            // Low
                parseFloat (ohlcv[4]),            // Close
                // parseFloat (ohlcv[5]),         // Quote Volume
                // parseFloat (ohlcv[6]),         // Base Volume
                parseFloat (ohlcv[volumeIndex]),  // Volume, okex will return base volume in the 7th element for future markets
            ];
        } else {
            return [
                this.parse8601 (this.safeString (ohlcv, 'time')),
                this.safeFloat (ohlcv, 'open'),    // Open
                this.safeFloat (ohlcv, 'high'),    // High
                this.safeFloat (ohlcv, 'low'),     // Low
                this.safeFloat (ohlcv, 'close'),   // Close
                this.safeFloat (ohlcv, 'volume'),  // Base Volume
            ];
        }
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdCandles';
        const request = {
            'instrument_id': market['id'],
            'granularity': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = this.iso8601 (since);
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot markets
        //
        //     [ {  close: "0.02683401",
        //           high: "0.02683401",
        //            low: "0.02683401",
        //           open: "0.02683401",
        //           time: "2018-12-17T23:47:00.000Z",
        //         volume: "0"                         },
        //       ...
        //       {  close: "0.02684545",
        //           high: "0.02685084",
        //            low: "0.02683312",
        //           open: "0.02683894",
        //           time: "2018-12-17T20:28:00.000Z",
        //         volume: "101.457222"                }  ]
        //
        // futures
        //
        //     [ [ 1545090660000,
        //         0.3171,
        //         0.3174,
        //         0.3171,
        //         0.3173,
        //         1648,
        //         51930.38579450868 ],
        //       ...
        //       [ 1545072720000,
        //         0.3159,
        //         0.3161,
        //         0.3144,
        //         0.3149,
        //         22886,
        //         725179.26172331 ]    ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
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
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'hold');
            account['free'] = this.safeFloat (balance, 'available');
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
        const result = { 'info': response };
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
                    account['total'] = this.safeFloat (marketBalance, 'balance');
                    account['used'] = this.safeFloat (marketBalance, 'hold');
                    account['free'] = this.safeFloat (marketBalance, 'available');
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
        const result = { 'info': response };
        const info = this.safeValue (response, 'info', {});
        const ids = Object.keys (info);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.safeCurrencyCode (id);
            const balance = this.safeValue (info, id, {});
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeFloat (balance, 'equity');
            account['free'] = this.safeFloat (balance, 'total_avail_balance');
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
        const info = this.safeValue (response, 'info', []);
        for (let i = 0; i < info.length; i++) {
            const balance = info[i];
            const marketId = this.safeString (balance, 'instrument_id');
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

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchBalance requires a type parameter (one of 'account', 'spot', 'margin', 'futures', 'swap').");
        }
        const suffix = (type === 'account') ? 'Wallet' : 'Accounts';
        const method = type + 'Get' + suffix;
        const query = this.omit (params, 'type');
        const response = await this[method] (query);
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
        // margin
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
        // futures
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
        // swap
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
            // 'order_type': '0', // 0: Normal limit order (Unfilled and 0 represent normal limit order) 1: Post only 2: Fill Or Kill 3: Immediatel Or Cancel
        };
        let method = undefined;
        if (market['futures'] || market['swap']) {
            const size = market['futures'] ? this.numberToString (amount) : this.amountToPrecision (symbol, amount);
            request = this.extend (request, {
                'type': type, // 1:open long 2:open short 3:close long 4:close short for futures
                'size': size,
                'price': this.priceToPrecision (symbol, price),
                // 'match_price': '0', // Order at best counter party price? (0:no 1:yes). The default is 0. If it is set as 1, the price parameter will be ignored. When posting orders at best bid price, order_type can only be 0 (regular order).
            });
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
                    let notional = this.safeFloat (params, 'notional');
                    const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price !== undefined) {
                            if (notional === undefined) {
                                notional = amount * price;
                            }
                        } else if (notional === undefined) {
                            throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'notional' extra parameter (the exchange-specific behaviour)");
                        }
                    }
                    request['notional'] = this.costToPrecision (symbol, notional);
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
        const timestamp = this.milliseconds ();
        const id = this.safeString (response, 'order_id');
        return {
            'info': response,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'cancelOrder', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " cancelOrder requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
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
        let type = this.safeString (order, 'type');
        if ((side !== 'buy') && (side !== 'sell')) {
            side = this.parseOrderSide (type);
        }
        if ((type !== 'limit') && (type !== 'market')) {
            if ('pnl' in order) {
                type = 'futures';
            } else {
                type = 'swap';
            }
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
        let amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat2 (order, 'filled_size', 'filled_qty');
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
        let cost = this.safeFloat2 (order, 'filled_notional', 'funds');
        const price = this.safeFloat (order, 'price');
        let average = this.safeFloat (order, 'price_avg');
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
        const feeCost = this.safeFloat (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchOrder requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
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
            throw new ArgumentsRequired (this.id + ' fetchOrdersByState requires a symbol argument');
        }
        const defaultType = this.safeString2 (this.options, 'fetchOrdersByState', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchOrdersByState requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // '-2': failed,
        // '-1': cancelled,
        //  '0': open ,
        //  '1': partially filled,
        //  '2': fully filled,
        //  '3': submitting,
        //  '4': cancelling,
        //  '6': incomplete（open+partially filled),
        //  '7': complete（cancelled+fully filled),
        const request = {
            'instrument_id': market['id'],
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
        if (market['type'] === 'swap' || market['type'] === 'futures') {
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

    parseDepositAddresses (addresses) {
        const result = [];
        for (let i = 0; i < addresses.length; i++) {
            result.push (this.parseDepositAddress (addresses[i]));
        }
        return result;
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
        const currency = this.currency (code);
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
        const addresses = this.parseDepositAddresses (response);
        const numAddresses = addresses.length;
        if (numAddresses < 1) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress cannot return nonexistent addresses, you should create withdrawal addresses with the exchange website first');
        }
        return addresses[0];
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
            throw new ExchangeError (this.id + " withdraw() requires a `fee` string parameter, network transaction fee must be ≥ 0. Withdrawals to OKCoin or OKEx are fee-free, please set '0'. Withdrawing to external digital asset address requires network transaction fee.");
        }
        const request = {
            'currency': currency['id'],
            'to_address': address,
            'destination': '4', // 2 = OKCoin International, 3 = OKEx 4 = others
            'amount': this.numberToString (amount),
            'fee': fee, // String. Network transaction fee ≥ 0. Withdrawals to OKCoin or OKEx are fee-free, please set as 0. Withdrawal to external digital asset address requires network transaction fee.
        };
        if (this.password) {
            request['trade_pwd'] = this.password;
        } else if ('password' in params) {
            request['trade_pwd'] = params['password'];
        } else if ('trade_pwd' in params) {
            request['trade_pwd'] = params['trade_pwd'];
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
            'id': this.safeString (response, 'withdraw_id'),
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'accountGetDepositHistory';
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['code'] = currency['code'];
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
            request['code'] = currency['code'];
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
            '-2': 'pending',
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
        //         amount: "0.47847546",
        //         txid: "1723573_3_0_0_WALLET",
        //         currency: "BTC",
        //         to: "",
        //         timestamp: "2018-08-16T03:41:10.000Z",
        //         status: "2"
        //     }
        //
        let type = undefined;
        let id = undefined;
        let address = undefined;
        const withdrawalId = this.safeString (transaction, 'withdrawal_id');
        const addressFrom = this.safeString (transaction, 'from');
        const addressTo = this.safeString (transaction, 'to');
        if (withdrawalId !== undefined) {
            type = 'withdrawal';
            id = withdrawalId;
            address = addressTo;
        } else {
            type = 'deposit';
            address = addressFrom;
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeFloat (transaction, 'amount');
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
                    const feeWithoutCurrencyId = feeWithCurrencyId.replace (currencyId, '');
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
            'tag': undefined,
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

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if ((limit === undefined) || (limit > 100)) {
            limit = 100;
        }
        const request = {
            'instrument_id': market['id'],
            'order_id': id,
            // from: '1', // return the page after the specified page number
            // to: '1', // return the page before the specified page number
            'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        const defaultType = this.safeString2 (this.options, 'fetchMyTrades', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = type + 'GetFills';
        const response = await this[method] (this.extend (request, query));
        //
        // spot trades, margin trades
        //
        //     [
        //         [
        //             {
        //                 "created_at":"2019-03-15T02:52:56.000Z",
        //                 "exec_type":"T", // whether the order is taker or maker
        //                 "fee":"0.00000082",
        //                 "instrument_id":"BTC-USDT",
        //                 "ledger_id":"3963052721",
        //                 "liquidity":"T", // whether the order is taker or maker
        //                 "order_id":"2482659399697408",
        //                 "price":"3888.6",
        //                 "product_id":"BTC-USDT",
        //                 "side":"buy",
        //                 "size":"0.00055306",
        //                 "timestamp":"2019-03-15T02:52:56.000Z"
        //             },
        //         ],
        //         {
        //             "before":"3963052722",
        //             "after":"3963052718"
        //         }
        //     ]
        //
        // futures trades, swap trades
        //
        //     [
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
        //     ]
        //
        let trades = undefined;
        if (market['type'] === 'swap' || market['type'] === 'futures') {
            trades = response;
        } else {
            const responseLength = response.length;
            if (responseLength < 1) {
                return [];
            }
            trades = response[0];
        }
        return this.parseTrades (trades, market, since, limit);
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
        if ((type === 'spot') || (type === 'futures')) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + " fetchLedger requires a currency code argument for '" + type + "' markets");
            }
            argument = 'Currency';
            currency = this.currency (code);
            request['currency'] = currency['id'];
        } else if ((type === 'margin') || (type === 'swap')) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + " fetchLedger requires a code argument (a market symbol) for '" + type + "' markets");
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
        const entries = (type === 'margin') ? response[0] : response;
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
        const amount = this.safeFloat (item, 'amount');
        const timestamp = this.parse8601 (this.safeString (item, 'timestamp'));
        const fee = {
            'cost': this.safeFloat (item, 'fee'),
            'currency': code,
        };
        const before = undefined;
        const after = this.safeFloat (item, 'balance');
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
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
        const request = '/api' + '/' + api + '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'] + request;
        const query = this.omit (params, this.extractParams (path));
        const type = this.getPathAuthenticationType (path);
        if (type === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (type === 'private') {
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
                if (Object.keys (query).length) {
                    body = this.json (query);
                    auth += body;
                }
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            headers['OK-ACCESS-SIGN'] = this.decode (signature);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    getPathAuthenticationType (path) {
        const auth = this.safeValue (this.options, 'auth', {});
        const key = this.findBroadlyMatchedKey (auth, path);
        return this.safeString (auth, key, 'private');
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        const feedback = this.id + ' ' + body;
        if (code === 503) {
            throw new ExchangeError (feedback);
        }
        const exact = this.exceptions['exact'];
        const message = this.safeString (response, 'message');
        const errorCode = this.safeString2 (response, 'code', 'error_code');
        if (errorCode in exact) {
            throw new exact[errorCode] (feedback);
        }
        if (message !== undefined) {
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
