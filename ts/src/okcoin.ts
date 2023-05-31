
//  ---------------------------------------------------------------------------

import Exchange from './abstract/okcoin.js';
import { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, NotSupported, BadSymbol, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class okcoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okcoin',
            'name': 'OKCoin',
            'countries': [ 'CN', 'US' ],
            'version': 'v5',
            // cheapest endpoint is 100 requests per 2 seconds
            // 50 requests per second => 1000 / 50 = 20ms
            'rateLimit': 20,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': undefined,
                'future': true,
                'option': undefined,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true, // see below
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': undefined,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': undefined,
                'fetchWithdrawals': true,
                'transfer': true,
                'withdraw': true,
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
                '1M': '2678400',
                '3M': '8035200',
                '6M': '16070400',
                '1y': '31536000',
            },
            'hostname': 'okcoin.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295551-102fbf00-c50e-11ea-90a9-462eebba5829.jpg',
                'api': {
                    'rest': 'https://www.{hostname}',
                },
                'www': 'https://www.okcoin.com',
                'doc': 'https://www.okcoin.com/docs-v5/en/',
                'fees': 'https://www.okcoin.com/coin-fees',
                'referral': 'https://www.okcoin.com/account/register?flag=activity&channelId=600001513',
                'test': {
                    'rest': 'https://testnet.okex.com',
                },
            },
            'api': {
                'public': {
                    'get': [
                        'market/tickers',
                        'market/ticker',
                        'market/books',
                        'market/books-lite',
                        'market/candles',
                        'market/history-candles',
                        'market/trades',
                        'market/history-trades',
                        'market/platform-24-volume',
                        'market/open-oracle',
                        'market/exchange-rate',
                        'public/instruments',
                        'public/time',
                        'system/status',
                    ],
                },
                'private': {
                    'get': [
                        'trade/order',
                        'trade/orders-pending',
                        'trade/orders-history',
                        'trade/orders-history-archive',
                        'trade/fills',
                        'trade/fills-history',
                        'trade/orders-algo-pending',
                        'trade/orders-algo-history',
                        'asset/currencies',
                        'asset/balances',
                        'asset/asset-valuation',
                        'asset/transfer-state',
                        'asset/bills',
                        'asset/deposit-lightning',
                        'asset/deposit-address',
                        'asset/deposit-history',
                        'asset/withdrawal-history',
                        'account/balance',
                        'account/bills',
                        'account/bills-archive',
                        'account/config',
                        'account/max-size',
                        'account/max-avail-size',
                        'account/trade-fee',
                        'account/max-withdrawal',
                        'otc/rfq/instruments',
                        'otc/rfq/trade',
                        'otc/rfq/history',
                        'fiat/deposit-history',
                        'fiat/withdrawal-history',
                        'fiat/channel',
                        'users/subaccount/list',
                        'users/subaccount/apikey',
                        'account/subaccount/balances',
                        'asset/subaccount/balances',
                        'asset/subaccount/bills',
                    ],
                    'post': [
                        'trade/order',
                        'trade/batch-orders',
                        'trade/cancel-order',
                        'trade/cancel-batch-orders',
                        'trade/amend-order',
                        'trade/amend-batch-orders',
                        'trade/order-algo',
                        'trade/cancel-algos',
                        'trade/cancel-advance-algos',
                        'asset/transfer',
                        'asset/withdrawal',
                        'asset/withdrawal-lightning',
                        'asset/cancel-withdrawal',
                        'otc/rfq/quote',
                        'otc/rfq/trade',
                        'fiat/deposit',
                        'fiat/cancel-deposit',
                        'fiat/withdrawal',
                        'fiat/cancel-withdrawal',
                        'asset/subaccount/transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.002,
                    'maker': 0.001,
                },
                'spot': {
                    'taker': 0.0015,
                    'maker': 0.0010,
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
                    'type': 'Candles', // Candles or HistoryCandles
                },
                'createMarketBuyOrderRequiresPrice': true,
                'fetchMarkets': [ 'spot' ],
                'defaultType': 'spot', // 'account', 'spot', 'futures', 'swap', 'option'
                'accountsByType': {
                    'spot': '1',
                    'funding': '6',
                    'main': '18',
                },
                'accountsById': {
                    '1': 'spot',
                    '6': 'funding',
                    '18': 'main',
                },
                'auth': {
                    'time': 'public',
                    'currencies': 'private',
                    'instruments': 'public',
                    'rate': 'public',
                    '{instrument_id}/constituents': 'public',
                },
                'warnOnFetchCurrenciesWithoutAuthorization': false,
            },
            'commonCurrencies': {
                // OKEX refers to ERC20 version of Aeternity (AEToken)
                'AE': 'AET', // https://github.com/ccxt/ccxt/issues/4981
                'BOX': 'DefiBox',
                'HOT': 'Hydro Protocol',
                'HSR': 'HC',
                'MAG': 'Maggie',
                'SBTC': 'Super Bitcoin',
                'TRADE': 'Unitrade',
                'YOYO': 'YOYOW',
                'WIN': 'WinToken', // https://github.com/ccxt/ccxt/issues/5701
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name okcoin#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-public-data-get-system-time
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetPublicTime (params);
        //
        //     {
        //         "iso": "2015-01-07T23:47:25.201Z",
        //         "epoch": 1420674445.201
        //     }
        //
        return this.parse8601 (this.safeString (response, 'iso'));
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name okcoin#fetchMarkets
         * @description retrieves data on all markets for okcoin
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-public-data-get-instruments
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
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
        //         "alias": "",
        //         "baseCcy": "BTC",
        //         "category": "1",
        //         "ctMult": "",
        //         "ctType": "",
        //         "ctVal": "",
        //         "ctValCcy": "",
        //         "expTime": "",
        //         "instFamily": "",
        //         "instId": "BTC-USD",
        //         "instType": "SPOT",
        //         "lever": "",
        //         "listTime": "1671521075000",
        //         "lotSz": "0.0001",
        //         "maxIcebergSz": "99999999999999",
        //         "maxLmtSz": "99999999999999",
        //         "maxMktSz": "1000000",
        //         "maxStopSz": "1000000",
        //         "maxTriggerSz": "99999999999999",
        //         "maxTwapSz": "99999999999999",
        //         "minSz": "0.0001",
        //         "optType": "",
        //         "quoteCcy": "USD",
        //         "settleCcy": "",
        //         "state": "live",
        //         "stk": "",
        //         "tickSz": "0.01",
        //         "uly": ""
        //     }
        //
        const id = this.safeString2 (market, 'instrument_id', 'instId');
        let optionType = this.safeValue2 (market, 'option_type', 'optType');
        const contractVal = this.safeNumber2 (market, 'contract_val', 'ctVal');
        const contract = contractVal !== undefined;
        const futuresAlias = this.safeString (market, 'alias');
        let marketType = 'spot';
        const spot = !contract;
        const option = (optionType !== undefined);
        const future = !option && (futuresAlias !== undefined);
        const swap = contract && !future && !option;
        let baseId = this.safeString2 (market, 'base_currency', 'baseCcy');
        let quoteId = this.safeString2 (market, 'quote_currency', 'quoteCcy');
        const settleId = this.safeString2 (market, 'settlement_currency', 'settleCcy');
        if (option) {
            const underlying = this.safeString2 (market, 'underlying', 'uly');
            const parts = underlying.split ('-');
            baseId = this.safeString (parts, 0);
            quoteId = this.safeString (parts, 1);
            marketType = 'option';
        } else if (future) {
            baseId = this.safeString (market, 'underlying_index');
            marketType = 'futures';
        } else if (swap) {
            marketType = 'swap';
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        const expiry = this.safeFloat (market, 'expTime');
        const strike = this.safeValue (market, 'strike');
        if (contract) {
            symbol = symbol + ':' + settle;
            if (future || option) {
                symbol = symbol + '-' + this.yymmdd (expiry);
                if (option) {
                    symbol = symbol + ':' + strike + ':' + optionType;
                    optionType = (optionType === 'C') ? 'call' : 'put';
                }
            }
        }
        const lotSize = this.safeNumberN (market, [ 'lot_size', 'trade_increment', 'lotSz' ]);
        const minPrice = this.safeString2 (market, 'tick_size', 'tickSz');
        const minAmountString = this.safeStringN (market, [ 'min_size', 'base_min_size', 'minSz' ]);
        const minAmount = this.parseNumber (minAmountString);
        let minCost = undefined;
        if ((minAmount !== undefined) && (minPrice !== undefined)) {
            minCost = this.parseNumber (Precise.stringMul (minPrice, minAmountString));
        }
        const fees = this.safeValue2 (this.fees, marketType, 'trading', {});
        const maxLeverageString = this.safeString2 (market, 'max_leverage', 'lever', '1');
        const maxLeverage = this.parseNumber (Precise.stringMax (maxLeverageString, '1'));
        const precisionPrice = this.parseNumber (minPrice);
        return this.extend (fees, {
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
            'margin': false,
            'swap': swap,
            'future': future,
            'futures': future, // deprecated
            'option': option,
            'active': true,
            'contract': contract,
            'linear': contract ? (quote === settle) : undefined,
            'inverse': contract ? (base === settle) : undefined,
            'contractSize': contractVal,
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': strike,
            'optionType': optionType,
            'precision': {
                'amount': this.safeNumber (market, 'size_increment', lotSize),
                'price': precisionPrice,
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.parseNumber (maxLeverage),
                },
                'amount': {
                    'min': minAmount,
                    'max': undefined,
                },
                'price': {
                    'min': precisionPrice,
                    'max': undefined,
                },
                'cost': {
                    'min': minCost,
                    'max': undefined,
                },
            },
            'info': market,
        });
    }

    async fetchMarketsByType (type, params = {}) {
        if ((type === 'spot') || (type === 'futures') || (type === 'swap')) {
            params['instType'] = type.toUpperCase ();
            const response = await this.publicGetPublicInstruments (params);
            //
            //     [
            //         {
            //             "alias": "",
            //             "baseCcy": "BTC",
            //             "category": "1",
            //             "ctMult": "",
            //             "ctType": "",
            //             "ctVal": "",
            //             "ctValCcy": "",
            //             "expTime": "",
            //             "instFamily": "",
            //             "instId": "BTC-USD",
            //             "instType": "SPOT",
            //             "lever": "",
            //             "listTime": "1671521075000",
            //             "lotSz": "0.0001",
            //             "maxIcebergSz": "99999999999999",
            //             "maxLmtSz": "99999999999999",
            //             "maxMktSz": "1000000",
            //             "maxStopSz": "1000000",
            //             "maxTriggerSz": "99999999999999",
            //             "maxTwapSz": "99999999999999",
            //             "minSz": "0.0001",
            //            "optType": "",
            //             "quoteCcy": "USD",
            //             "settleCcy": "",
            //             "state": "live",
            //             "stk": "",
            //             "tickSz": "0.01",
            //             "uly": ""
            //         }
            //     ]
            //
            return this.parseMarkets (response['data']);
        } else {
            throw new NotSupported (this.id + ' fetchMarketsByType() does not support market type ' + type);
        }
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name okcoin#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-currencies
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.privateGetAssetCurrencies (params);
        // [
        //     {
        //         "canDep": true,
        //         "canInternal": false,
        //         "canWd": true,
        //         "ccy": "EUR",
        //         "chain": "EUR-fiat",
        //         "depQuotaFixed": "",
        //         "depQuoteDailyLayer2": "",
        //         "logoLink": "https://static.okcoin.com/cdn/assets/imgs/218/3CE0A0023386E9EA.png",
        //         "mainNet": true,
        //         "maxFee": "0",
        //         "maxWd": "1586886",
        //         "minDep": "0.00000001",
        //         "minDepArrivalConfirm": "0",
        //         "minFee": "0",
        //         "minWd": "0",
        //         "minWdUnlockConfirm": "0",
        //         "name": "Euro",
        //         "needTag": false,
        //         "usedDepQuotaFixed": "",
        //         "usedWdQuota": "0",
        //         "wdQuota": "1000000",
        //         "wdTickSz": "4"
        //     }
        // ]
        const result = {};
        const data = response['data'];
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'ccy');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const canDeposit = this.safeValue (currency, 'canDep');
            const canWithdraw = this.safeValue (currency, 'canWd');
            const active = (canDeposit && canWithdraw) ? true : false;
            result[code] = {
                'info': currency,
                'id': id,
                'code': code,
                'networks': undefined,
                'type': undefined,
                'name': name,
                'active': active,
                'deposit': canDeposit,
                'withdraw': canWithdraw,
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'minWd'),
                        'max': this.safeNumber (currency, 'maxWd'),
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        if (limit !== undefined) {
            request['sz'] = limit; // max 200
        }
        const response = await this.publicGetMarketBooks (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //         {
        //             "asks": [
        //                 [
        //                     "41006.8",
        //                     "0.60038921",
        //                     "0",
        //                     "1"
        //                 ]
        //             ],
        //             "bids": [
        //                 [
        //                     "41006.3",
        //                     "0.30178218",
        //                     "0",
        //                     "2"
        //                 ]
        //             ],
        //             "ts": "1629966436396"
        //         }
        //     ]
        // }
        //
        const data = response['data'][0];
        const timestamp = this.safeFloat (data, 'ts');
        return this.parseOrderBook (data, symbol, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "instType": "SPOT",
        //     "instId": "BTC-USD",
        //     "last": "16838.49",
        //     "lastSz": "0.237",
        //     "askPx": "16836.62",
        //     "askSz": "0.0431",
        //     "bidPx": "16835.97",
        //     "bidSz": "0.2",
        //     "open24h": "16764.37",
        //     "high24h": "16943.44",
        //     "low24h": "16629.04",
        //     "volCcy24h": "2991370.9916",
        //     "vol24h": "178.1375",
        //     "ts": "1672841618814",
        //     "sodUtc0": "16688.74",
        //     "sodUtc8": "16700.35"
        // }
        //
        const timestamp = this.safeFloat (ticker, 'ts');
        const marketId = this.safeString (ticker, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last');
        const open = this.safeString (ticker, 'open24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': this.safeString (ticker, 'bidPx'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString (ticker, 'askPx'),
            'askVolume': this.safeString (ticker, 'askSz'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol24h'),
            'quoteVolume': this.safeString (ticker, 'volCcy24h'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name okcoin#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //         {
        //             "instType": "SPOT",
        //             "instId": "BTC-USD",
        //             "last": "16838.49",
        //             "lastSz": "0.237",
        //             "askPx": "16836.62",
        //             "askSz": "0.0431",
        //             "bidPx": "16835.97",
        //             "bidSz": "0.2",
        //             "open24h": "16764.37",
        //             "high24h": "16943.44",
        //             "low24h": "16629.04",
        //             "volCcy24h": "2991370.9916",
        //             "vol24h": "178.1375",
        //             "ts": "1672841618814",
        //             "sodUtc0": "16688.74",
        //             "sodUtc8": "16700.35"
        //         }
        //     ]
        // }
        //
        return this.parseTicker (response['data'][0]);
    }

    async fetchTickersByType (type, symbols: string[] = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        params['instType'] = type.toUpperCase ();
        const response = await this.publicGetMarketTickers (params);
        const data = response['data'];
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-tickers
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        symbols = this.marketSymbols (symbols);
        const first = this.safeString (symbols, 0);
        let market = undefined;
        if (first !== undefined) {
            market = this.market (first);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        return await this.fetchTickersByType (type, symbols, this.omit (params, 'type'));
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        // {
        //     "instId": "BTC-USD",
        //     "side": "sell",
        //     "sz": "0.00001",
        //     "px": "29963.2",
        //     "tradeId": "242720720",
        //     "ts": "1654161646974"
        // }
        //
        // orderTrades (private)
        //
        // {
        //     "instType": "SPOT",
        //     "instId": "BTC-USD",
        //     "tradeId": "123",
        //     "ordId": "312269865356374016",
        //     "clOrdId": "b16",
        //     "billId": "1111",
        //     "tag": "",
        //     "fillPx": "999",
        //     "fillSz": "3",
        //     "side": "buy",
        //     "posSide": "net",
        //     "execType": "M",
        //     "feeCcy": "",
        //     "fee": "",
        //     "ts": "1597026383085"
        // }
        //
        const marketId = this.safeString (trade, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeFloat (trade, 'ts');
        const priceString = this.safeString (trade, 'px');
        let amountString = this.safeString (trade, 'sz');
        amountString = this.safeString (trade, 'fillSz', amountString);
        let takerOrMaker = this.safeString (trade, 'execType');
        if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        }
        const side = this.safeString (trade, 'side');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrency = (side === 'buy') ? market['base'] : market['quote'];
            fee = {
                // fee is either a positive number (invitation rebate)
                // or a negative number (transaction fee deduction)
                // therefore we need to invert the fee
                // more about it https://github.com/ccxt/ccxt/issues/5909
                'cost': Precise.stringNeg (feeCostString),
                'currency': feeCurrency,
            };
        }
        const orderId = this.safeString (trade, 'ordId');
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tradeId'),
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit > 500) {
            limit = 500; // maximum = 500, default = 100
        }
        const request = {
            'instId': market['id'],
            'limit': limit,
        };
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //         {
        //             "instId": "BTC-USD",
        //             "side": "sell",
        //             "sz": "0.00001",
        //             "px": "29963.2",
        //             "tradeId": "242720720",
        //             "ts": "1654161646974"
        //         },
        //         {
        //             "instId": "BTC-USD",
        //             "side": "sell",
        //             "sz": "0.00001",
        //             "px": "29964.1",
        //             "tradeId": "242720719",
        //             "ts": "1654161641568"
        //         }
        //     ]
        // }
        //
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // [
        //     "1597026383085",
        //     "3.721",
        //     "3.743",
        //     "3.677",
        //     "3.708",
        //     "8422410",
        //     "22698348.04828491",
        //     "12698348.04828491",
        //     "0"
        // ],
        //
        if (Array.isArray (ohlcv)) {
            return [
                this.safeFloat (ohlcv, 0),             // timestamp
                this.safeNumber (ohlcv, 1),            // Open
                this.safeNumber (ohlcv, 2),            // High
                this.safeNumber (ohlcv, 3),            // Low
                this.safeNumber (ohlcv, 4),            // Close
                this.safeNumber (ohlcv, 5),            // Base Volume
                // this.safeNumber (ohlcv, 6),           // Quote Volume
            ];
        }
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-candlesticks
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit > 300) {
            limit = 300; // maximum = 300, default = 100
        }
        const request = {
            'instId': market['id'],
            'bar': timeframe,
            'limit': limit,
            'before': since,
        };
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const defaultType = this.safeString (options, 'type', 'Candles'); // Candles or HistoryCandles
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        let method = 'publicGetMarketCandles';
        if (type === 'HistoryCandles') {
            method = 'publicGetMarketHistoryCandles';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "code":"0",
        //     "msg":"",
        //     "data":[
        //         [
        //             "1597026383085",
        //             "3.721",
        //             "3.743",
        //             "3.677",
        //             "3.708",
        //             "8422410",
        //             "22698348.04828491",
        //             "12698348.04828491",
        //             "0"
        //         ],
        //         [
        //             "1597026383085",
        //             "3.731",
        //             "3.799",
        //             "3.494",
        //             "3.72",
        //             "24912403",
        //             "67632347.24399722",
        //             "37632347.24399722",
        //             "1"
        //         ]
        //     ]
        // }
        //
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    parseBalance (balance) {
        const result = {
            'info': balance,
            'timestamp': undefined,
            'datetime': undefined,
        };
        //
        // [
        //     {
        //         "availBal": "37.11827078",
        //         "bal": "37.11827078",
        //         "ccy": "ETH",
        //         "frozenBal": "0"
        //     }
        // ]
        //
        for (let i = 0; i < balance.length; i++) {
            const entry = balance[i];
            const marketId = this.safeString (entry, 'ccy');
            const code = this.safeSymbol (marketId);
            const account = this.account ();
            account['total'] = this.safeString (entry, 'bal');
            account['free'] = this.safeString (entry, 'availBal');
            account['used'] = this.safeString (entry, 'frozenBal');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name okcoin#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-balance
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetAssetBalances (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [{
        //             "availBal": "37.11827078",
        //             "bal": "37.11827078",
        //             "ccy": "ETH",
        //             "frozenBal": "0"
        //         }
        //     ]
        // }
        //
        const data = this.safeValue (response, 'data');
        return this.parseBalance (data);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#createOrder
         * @description create a trade order
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            'ordType': type,
            'side': side,
            'sz': this.amountToPrecision (symbol, amount),
        };
        if (price !== undefined) {
            request['px'] = this.priceToPrecision (symbol, price);
        }
        const tradeMode = this.safeValue2 (params, 'tdMode', 'tradeMode', 'cash');
        request['tdMode'] = tradeMode;
        params = this.omit (params, [ 'tdMode', 'tradeMode' ]);
        const clientOrderId = this.safeStringN (params, [ 'client_oid', 'clientOrderId', 'clOrdId' ]);
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
            params = this.omit (params, [ 'client_oid', 'clientOrderId', 'clOrdId' ]);
        }
        const response = await this.privatePostTradeOrder (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //         {
        //             "clOrdId": "oktswap6",
        //             "ordId": "312269865356374016",
        //             "tag": "",
        //             "sCode": "0",
        //             "sMsg": ""
        //         }
        //     ]
        // }
        //
        const result = this.safeValue (response, 'data');
        const data = this.safeValue (result, 0);
        const order = this.parseOrder (data, market);
        return this.extend (order, {
            'type': type,
            'side': side,
        });
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#cancelOrder
         * @description cancels an open order
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'ordId': id,
            'instId': market['id'],
        };
        const clientOrderId = this.safeStringN (params, [ 'client_oid', 'clientOrderId', 'clOrdId' ]);
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
            params = this.omit (params, [ 'client_oid', 'clientOrderId', 'clOrdId' ]);
        }
        const response = await this.privatePostTradeCancelOrder (this.extend (request, params));
        //
        // {
        //     "code":"0",
        //     "msg":"",
        //     "data":[
        //         {
        //             "clOrdId":"oktswap6",
        //             "ordId":"12345689",
        //             "sCode":"0",
        //             "sMsg":""
        //         }
        //     ]
        // }
        //
        const result = this.safeValue (response, 'data');
        const data = this.safeValue (result, 0);
        return this.parseOrder (data, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'canceled': 'canceled',
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        // {
        //     "clOrdId": "oktswap6",
        //     "ordId": "312269865356374016",
        //     "tag": "",
        //     "sCode": "0",
        //     "sMsg": ""
        // }
        //
        // cancelOrder
        //
        // {
        //     "clOrdId":"oktswap6",
        //     "ordId":"12345689",
        //     "sCode":"0",
        //     "sMsg":""
        // }
        //
        // fetchOrder
        //
        // {
        //     "accFillSz": "1.6342",
        //     "avgPx": "0.9995",
        //     "cTime": "1672814726198",
        //     "category": "normal",
        //     "ccy": "",
        //     "clOrdId": "",
        //     "fee": "-0.00245007435",
        //     "feeCcy": "USD",
        //     "fillPx": "0.9995",
        //     "fillSz": "1.6342",
        //     "fillTime": "1672814726201",
        //     "instId": "USDT-USD",
        //     "instType": "SPOT",
        //     "lever": "",
        //     "ordId": "530758662663180288",
        //     "ordType": "market",
        //     "pnl": "0",
        //     "posSide": "net",
        //     "px": "",
        //     "rebate": "0",
        //     "rebateCcy": "USDT",
        //     "reduceOnly": "false",
        //     "side": "sell",
        //     "slOrdPx": "",
        //     "slTriggerPx": "",
        //     "slTriggerPxType": "",
        //     "source": "",
        //     "state": "filled",
        //     "sz": "1.6342",
        //     "tag": "",
        //     "tdMode": "cash",
        //     "tgtCcy": "base_ccy",
        //     "tpOrdPx": "",
        //     "tpTriggerPx": "",
        //     "tpTriggerPxType": "",
        //     "tradeId": "3225651",
        //     "uTime": "1672814726203"
        // }
        //
        const id = this.safeString (order, 'ordId');
        const timestamp = this.safeFloat (order, 'cTime');
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'ordType');
        const marketId = this.safeString (order, 'instId');
        market = this.safeMarket (marketId, market);
        let amount = this.safeString (order, 'sz');
        const filled = this.safeString (order, 'accFillSz');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                amount = Precise.stringMax (amount, filled);
                remaining = Precise.stringMax ('0', Precise.stringSub (amount, filled));
            }
        }
        if (type === 'market') {
            remaining = '0';
        }
        let cost = this.safeString (order, 'fillPx');
        const price = this.safeString (order, 'px');
        let average = this.safeString (order, 'avgPx');
        if (cost === undefined) {
            if (filled !== undefined && average !== undefined) {
                cost = Precise.stringMul (average, filled);
            }
        } else {
            if ((average === undefined) && (filled !== undefined) && Precise.stringGt (filled, '0')) {
                average = Precise.stringDiv (cost, filled);
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const feeCost = this.safeNumber (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = this.safeString (order, 'feeCcy');
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let clientOrderId = this.safeString (order, 'clOrdId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined; // fix empty clientOrderId string
        }
        const stopPrice = this.safeNumber (order, 'tpTriggerPx');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeFloat (order, 'fillTime'),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-details
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'ordId': id,
            'instId': market['id'],
        };
        const clientOrderId = this.safeStringN (params, [ 'client_oid', 'clientOrderId', 'clOrdId' ]);
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
            params = this.omit (params, [ 'client_oid', 'clientOrderId', 'clOrdId' ]);
        }
        const response = await this.privateGetTradeOrder (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": [
        //         {
        //             "accFillSz": "1.6342",
        //             "avgPx": "0.9995",
        //             "cTime": "1672814726198",
        //             "category": "normal",
        //             "ccy": "",
        //             "clOrdId": "",
        //             "fee": "-0.00245007435",
        //             "feeCcy": "USD",
        //             "fillPx": "0.9995",
        //             "fillSz": "1.6342",
        //             "fillTime": "1672814726201",
        //             "instId": "USDT-USD",
        //             "instType": "SPOT",
        //             "lever": "",
        //             "ordId": "530758662663180288",
        //             "ordType": "market",
        //             "pnl": "0",
        //             "posSide": "net",
        //             "px": "",
        //             "rebate": "0",
        //             "rebateCcy": "USDT",
        //             "reduceOnly": "false",
        //             "side": "sell",
        //             "slOrdPx": "",
        //             "slTriggerPx": "",
        //             "slTriggerPxType": "",
        //             "source": "",
        //             "state": "filled",
        //             "sz": "1.6342",
        //             "tag": "",
        //             "tdMode": "cash",
        //             "tgtCcy": "base_ccy",
        //             "tpOrdPx": "",
        //             "tpTriggerPx": "",
        //             "tpTriggerPxType": "",
        //             "tradeId": "3225651",
        //             "uTime": "1672814726203"
        //         }
        //     ],
        //     "msg": ""
        // }
        //
        const result = this.safeValue (response, 'data');
        const data = this.safeValue (result, 0);
        return this.parseOrder (data);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-list
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit > 100) {
            limit = 100; // maximum = 100, default = 100
        }
        const request = {
            'instId': market['id'],
            'limit': limit,
            'before': since,
        };
        const response = await this.privateGetTradeOrdersPending (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //         {
        //             "accFillSz": "0",
        //             "avgPx": "",
        //             "cTime": "1618235248028",
        //             "category": "normal",
        //             "ccy": "",
        //             "clOrdId": "",
        //             "fee": "0",
        //             "feeCcy": "BTC",
        //             "fillPx": "",
        //             "fillSz": "0",
        //             "fillTime": "",
        //             "instId": "BTC-USDT",
        //             "instType": "SPOT",
        //             "lever": "5.6",
        //             "ordId": "301835739059335168",
        //             "ordType": "limit",
        //             "pnl": "0",
        //             "posSide": "net",
        //             "px": "59200",
        //             "rebate": "0",
        //             "rebateCcy": "USDT",
        //             "side": "buy",
        //             "slOrdPx": "",
        //             "slTriggerPx": "",
        //             "slTriggerPxType": "last",
        //             "state": "live",
        //             "sz": "1",
        //             "tag": "",
        //             "tgtCcy": "",
        //             "tdMode": "cross",
        //             "source":"",
        //             "tpOrdPx": "",
        //             "tpTriggerPx": "",
        //             "tpTriggerPxType": "last",
        //             "tradeId": "",
        //             "uTime": "1618235248028"
        //         }
        //     ]
        // }
        //
        const orders = this.safeValue (response, 'data');
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-history-last-3-months
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit > 100) {
            limit = 100; // maximum = 100, default = 100
        }
        const request = {
            'instId': market['id'],
            'limit': limit,
            'before': since,
        };
        const defaultType = this.safeString2 (this.options, 'fetchClosedOrders', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        request['instType'] = type.toUpperCase ();
        const response = await this.privateGetTradeOrdersHistoryArchive (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": [
        //         {
        //             "accFillSz": "1.6342",
        //             "avgPx": "0.9995",
        //             "cTime": "1672814726198",
        //             "category": "normal",
        //             "ccy": "",
        //             "clOrdId": "",
        //             "fee": "-0.00245007435",
        //             "feeCcy": "USD",
        //             "fillPx": "0.9995",
        //             "fillSz": "1.6342",
        //             "fillTime": "1672814726201",
        //             "instId": "USDT-USD",
        //             "instType": "SPOT",
        //             "lever": "",
        //             "ordId": "530758662663180288",
        //             "ordType": "market",
        //             "pnl": "0",
        //             "posSide": "",
        //             "px": "",
        //             "rebate": "0",
        //             "rebateCcy": "USDT",
        //             "reduceOnly": "false",
        //             "side": "sell",
        //             "slOrdPx": "",
        //             "slTriggerPx": "",
        //             "slTriggerPxType": "",
        //             "source": "",
        //             "state": "filled",
        //             "sz": "1.6342",
        //             "tag": "",
        //             "tdMode": "cash",
        //             "tgtCcy": "base_ccy",
        //             "tpOrdPx": "",
        //             "tpTriggerPx": "",
        //             "tpTriggerPxType": "",
        //             "tradeId": "3225651",
        //             "uTime": "1672814726859"
        //         }
        //     ],
        //     "msg": ""
        // }
        //
        const orders = this.safeValue (response, 'data');
        return this.parseOrders (orders, market, since, limit);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        // {
        //     "chain": "BTC-Bitcoin",
        //     "ctAddr": "",
        //     "ccy": "BTC",
        //     "to": "6",
        //     "addr": "39XNxK1Ryqgg3Bsyn6HzoqV4Xji25pNkv6",
        //     "selected": true
        // }
        //
        const address = this.safeString (depositAddress, 'addr');
        let tag = this.safeString (depositAddress, 'tag');
        tag = this.safeString (depositAddress, 'memo', tag);
        const currencyId = this.safeString (depositAddress, 'ccy');
        const code = this.safeCurrencyCode (currencyId);
        this.checkAddress (address);
        return {
            'chain': this.safeString (depositAddress, 'chain'),
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name okcoin#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-deposit-address
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const parts = code.split ('-');
        const currency = this.currency (parts[0]);
        const request = {
            'ccy': currency['id'],
        };
        const response = await this.privateGetAssetDepositAddress (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": [
        //         {
        //             "chain": "BTC-Bitcoin",
        //             "ctAddr": "",
        //             "ccy": "BTC",
        //             "to": "6",
        //             "addr": "39XNxK1Ryqgg3Bsyn6HzoqV4Xji25pNkv6",
        //             "selected": true
        //         },
        //         {
        //             "chain": "BTC-OKC",
        //             "ctAddr": "",
        //             "ccy": "BTC",
        //             "to": "6",
        //             "addr": "0x66d0edc2e63b6b992381ee668fbcb01f20ae0428",
        //             "selected": true
        //         },
        //         {
        //             "chain": "BTC-ERC20",
        //             "ctAddr": "5807cf",
        //             "ccy": "BTC",
        //             "to": "6",
        //             "addr": "0x66d0edc2e63b6b992381ee668fbcb01f20ae0428",
        //             "selected": true
        //         }
        //     ],
        //     "msg": ""
        // }
        //
        const data = this.safeValue (response, 'data');
        return this.parseDepositAddresses (data, [ currency['code'] ], false);
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name okcoin#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-funds-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @param {string} params.type 0: transfer within account, 1: master account to sub-account (Only applicable to APIKey from master account), 2: sub-account to master account (Only applicable to APIKey from master account), 3: sub-account to master account (Only applicable to APIKey from sub-account)
         * @param {string} params.subAcct Name of the sub-account. When type is 1 or 2, sub-account is required.
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const request = {
            'amt': this.currencyToPrecision (code, amount),
            'ccy': currency['id'],
            'from': fromId, // 1 spot, 6 funding
            'to': toId, // 1 spot, 6 funding
            'type': this.safeString (params, 'type', '0'),
            'subAcct': this.safeString (params, 'subAcct'),
        };
        const clientId = this.safeString2 (params, 'client_id', 'clientId');
        if (clientId !== undefined) {
            request['clientId'] = clientId;
            params = this.omit (params, 'client_id', 'clientId');
        }
        const response = await this.privatePostAssetTransfer (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //       {
        //         "transId": "754147",
        //         "ccy": "USD",
        //         "clientId": "",
        //         "from": "6",
        //         "amt": "0.1",
        //         "to": "18"
        //       }
        //     ]
        // }
        //
        const result = this.safeValue (response, 'data');
        const data = this.safeValue (result, 0);
        return this.parseTransfer (data, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // {
        //     "transId": "754147",
        //     "ccy": "USD",
        //     "clientId": "",
        //     "from": "6",
        //     "amt": "0.1",
        //     "to": "18"
        // }
        //
        const accountsById = this.safeValue (this.options, 'accountsById', {});
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'transId'),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode (this.safeString (transfer, 'ccy'), currency),
            'amount': this.safeNumber (transfer, 'amt'),
            'fromAccount': this.safeString (accountsById, this.safeString (transfer, 'from')),
            'toAccount': this.safeString (accountsById, this.safeString (transfer, 'to')),
            'status': undefined,
        };
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#withdraw
         * @description make a withdrawal
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag) {
            address = address + ':' + tag;
        }
        const fee = this.safeString (params, 'fee');
        if (fee === undefined) {
            throw new ArgumentsRequired (this.id + " withdraw() requires a 'fee' string parameter, network transaction fee must be ≥ 0. Withdrawals to OKCoin or OKEx are fee-free, please set '0'. Withdrawing to external digital asset address requires network transaction fee.");
        }
        params = this.omit (params, [ 'fee' ]);
        const request = {
            'ccy': currency['id'],
            'toAddr': address,
            'dest': this.safeString2 (params, 'dest', 'destination', '4'), // 3 = internal, 4 = on chain
            'amt': this.numberToString (amount),
            'fee': fee,
        };
        const clientId = this.safeString2 (params, 'client_id', 'clientId');
        if (clientId !== undefined) {
            request['clientId'] = clientId;
            params = this.omit (params, 'client_id', 'clientId');
        }
        const response = await this.privatePostAssetWithdrawal (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [{
        //         "amt": "0.1",
        //         "wdId": "67485",
        //         "ccy": "BTC",
        //         "clientId": "",
        //         "chain": "BTC-Bitcoin"
        //     }]
        // }
        //
        const result = this.safeValue (response, 'data');
        const data = this.safeValue (result, 0);
        return this.parseTransaction (data, currency);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-deposit-history
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        if (limit > 100) {
            limit = 100; // maximum = 100, default = 100
        }
        const request = {
            'limit': limit,
            'before': since,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['ccy'] = currency['id'];
        }
        const response = await this.privateGetAssetDepositHistory (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //       {
        //         "actualDepBlkConfirm": "17",
        //         "amt": "135.705808",
        //         "ccy": "USDT",
        //         "chain": "USDT-TRC20",
        //         "depId": "34579090",
        //         "from": "",
        //         "state": "2",
        //         "to": "TN4hxxxxxxxxxxxizqs",
        //         "ts": "1655251200000",
        //         "txId": "16f36383292f451xxxxxxxxxxxxxxx584f3391642d988f97"
        //       }
        //     ]
        // }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTransactions (data, currency, since, limit, params);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-withdrawal-history
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        if (limit > 100) {
            limit = 100; // maximum = 100, default = 100
        }
        const request = {
            'limit': limit,
            'before': since,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['ccy'] = currency['id'];
        }
        const response = await this.privateGetAssetWithdrawalHistory (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //       {
        //         "chain": "ETH-Ethereum",
        //         "fee": "0.007",
        //         "ccy": "ETH",
        //         "clientId": "",
        //         "amt": "0.029809",
        //         "txId": "0x35c******b360a174d",
        //         "from": "156****359",
        //         "to": "0xa30d1fab********7CF18C7B6C579",
        //         "state": "2",
        //         "ts": "1655251200000",
        //         "wdId": "15447421"
        //       }
        //     ]
        // }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTransactions (data, currency, since, limit, params);
    }

    parseTransactionStatus (status) {
        //
        // deposit statuses
        //
        //     {
        //          '0': waiting for confirmation
        //          '1': deposit credited
        //          '2': deposit successful
        //          '8': pending due to temporary deposit suspension on this crypto currency
        //         '12': account or deposit is frozen
        //         '13': sub-account deposit interception
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
            '8': 'pending',
            '12': 'failed',
            '13': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        // {
        //     "amt": "0.1",
        //     "wdId": "67485",
        //     "ccy": "BTC",
        //     "clientId": "",
        //     "chain": "BTC-Bitcoin"
        // }
        //
        // fetchWithdrawals
        //
        // {
        //     "chain": "ETH-Ethereum",
        //     "fee": "0.007",
        //     "ccy": "ETH",
        //     "clientId": "",
        //     "amt": "0.029809",
        //     "txId": "0x35c******b360a174d",
        //     "from": "156****359",
        //     "to": "0xa30d1fab********7CF18C7B6C579",
        //     "state": "2",
        //     "ts": "1655251200000",
        //     "wdId": "15447421"
        // }
        //
        // fetchDeposits
        //
        // {
        //     "actualDepBlkConfirm": "17",
        //     "amt": "135.705808",
        //     "ccy": "USDT",
        //     "chain": "USDT-TRC20",
        //     "depId": "34579090",
        //     "from": "",
        //     "state": "2",
        //     "to": "TN4hxxxxxxxxxxxizqs",
        //     "ts": "1655251200000",
        //     "txId": "16f36383292f451xxxxxxxxxxxxxxx584f3391642d988f97"
        //   }
        //
        let type = undefined;
        const withdrawalId = this.safeString (transaction, 'wdId');
        const addressFrom = this.safeString (transaction, 'from');
        const addressTo = this.safeString (transaction, 'to');
        if (withdrawalId !== undefined) {
            type = 'withdrawal';
        } else {
            type = 'deposit';
        }
        const currencyId = this.safeString (transaction, 'ccy');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeString (transaction, 'amt');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const txid = this.safeString (transaction, 'txId');
        const timestamp = this.safeString (transaction, 'ts');
        const feeCost = this.safeString (transaction, 'fee');
        // todo parse tags
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'depId', 'wdId'),
            'currency': code,
            'amount': amount,
            'network': this.safeString (transaction, 'chain'),
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'address': addressTo,
            'tagFrom': undefined,
            'tagTo': undefined,
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
        let amountString = undefined;
        let costString = undefined;
        const receivedCurrencyId = this.safeString (userTrade, 'currency');
        let feeCurrencyId = undefined;
        if (receivedCurrencyId === quoteId) {
            side = this.safeString (otherTrade, 'side');
            amountString = this.safeString (otherTrade, 'size');
            costString = this.safeString (userTrade, 'size');
            feeCurrencyId = this.safeString (otherTrade, 'currency');
        } else {
            side = this.safeString (userTrade, 'side');
            amountString = this.safeString (userTrade, 'size');
            costString = this.safeString (otherTrade, 'size');
            feeCurrencyId = this.safeString (userTrade, 'currency');
        }
        const id = this.safeString (userTrade, 'trade_id');
        const priceString = this.safeString (userTrade, 'price');
        const feeCostFirstString = this.safeString (otherTrade, 'fee');
        const feeCostSecondString = this.safeString (userTrade, 'fee');
        const feeCurrencyCodeFirst = this.safeCurrencyCode (this.safeString (otherTrade, 'currency'));
        const feeCurrencyCodeSecond = this.safeCurrencyCode (this.safeString (userTrade, 'currency'));
        let fee = undefined;
        let fees = undefined;
        // fee is either a positive number (invitation rebate)
        // or a negative number (transaction fee deduction)
        // therefore we need to invert the fee
        // more about it https://github.com/ccxt/ccxt/issues/5909
        if ((feeCostFirstString !== undefined) && !Precise.stringEquals (feeCostFirstString, '0')) {
            if ((feeCostSecondString !== undefined) && !Precise.stringEquals (feeCostSecondString, '0')) {
                fees = [
                    {
                        'cost': Precise.stringNeg (feeCostFirstString),
                        'currency': feeCurrencyCodeFirst,
                    },
                    {
                        'cost': Precise.stringNeg (feeCostSecondString),
                        'currency': feeCurrencyCodeSecond,
                    },
                ];
            } else {
                fee = {
                    'cost': Precise.stringNeg (feeCostFirstString),
                    'currency': feeCurrencyCodeFirst,
                };
            }
        } else if ((feeCostSecondString !== undefined) && !Precise.stringEquals (feeCostSecondString, '0')) {
            fee = {
                'cost': Precise.stringNeg (feeCostSecondString),
                'currency': feeCurrencyCodeSecond,
            };
        } else {
            fee = {
                'cost': '0',
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
        return this.safeTrade ({
            'info': pair,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
            'fees': fees,
        }, market);
    }

    parseMyTrades (trades, market = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        market = this.safeMarket (undefined, market);
        return this.filterBySymbolSinceLimit (result, market['symbol'], since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
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
        return this.parseMyTrades (response, market, since, limit, params) as any;
    }

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const request = {
            // 'instrument_id': market['id'],
            'order_id': id,
            // 'after': '1', // return the page after the specified page number
            // 'before': '1', // return the page before the specified page number
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name okcoin#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
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

    async fetchPositions (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols not used by okcoin fetchPositions
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
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

    async fetchLedger (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
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
            const market = this.market (code); // we intentionally put a market inside here for the swap ledgers
            const marketInfo = this.safeValue (market, 'info', {});
            const settlementCurrencyId = this.safeString (marketInfo, 'settlement_currency');
            const settlementCurrencyCode = this.safeCurrencyCode (settlementCurrencyId);
            currency = this.currency (settlementCurrencyCode);
            const underlyingId = this.safeString (marketInfo, 'underlying');
            request['underlying'] = underlyingId;
        } else if (type === 'swap') {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + " fetchLedger() requires a code argument (a market symbol) for '" + type + "' markets");
            }
            argument = 'InstrumentId';
            const market = this.market (code); // we intentionally put a market inside here for the swap ledgers
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
        // trade        funds moved as a result of a trade, spot accounts only
        // rebate       fee rebate as per fee schedule, spot accounts only
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
        if (type === 'swap') {
            const ledgerEntries = this.parseLedger (response);
            return this.filterBySymbolSinceLimit (ledgerEntries, code, since, limit);
        }
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            'transfer': 'transfer', // funds transfer in/out
            'trade': 'trade', // funds moved as a result of a trade, spot accounts only
            'rebate': 'rebate', // fee rebate as per fee schedule, spot accounts only
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
        const symbol = this.safeSymbol (marketId);
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
        let request = '/api/' + this.version + '/';
        request += isArray ? path : this.implodeParams (path, params);
        const query = isArray ? params : this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api']['rest']) + request;
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
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'base64');
            headers['OK-ACCESS-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    getPathAuthenticationType (path) {
        // https://github.com/ccxt/ccxt/issues/6651
        // a special case to handle the optionGetUnderlying interefering with
        // other endpoints containing this keyword
        if (path === 'underlying') {
            return 'public';
        }
        const auth = this.safeValue (this.options, 'auth', {});
        const key = this.findBroadlyMatchedKey (auth, path);
        return this.safeString (auth, key, 'private');
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
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
        return undefined;
    }
}
