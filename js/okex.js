'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, InsufficientFunds, InvalidNonce, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, BadSymbol, RateLimitExceeded, NetworkError } = require ('./base/errors');
const { TICK_SIZE, TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class okex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'name': 'OKEX',
            'countries': [ 'CN', 'US' ],
            'version': 'v5',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'pro': true,
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false, // see below
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'transfer': true,
                'withdraw': true,
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
            'hostname': 'www.okex.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': {
                    'rest': 'https://{hostname}',
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
                        'market/open-oracle',
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
                        'public/position-tiers',
                        'public/underlying',
                        'public/interest-rate-loan-quota',
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
                        'asset/piggy-balance',
                        'trade/order',
                        'trade/orders-pending',
                        'trade/orders-history',
                        'trade/orders-history-archive',
                        'trade/fills',
                        'trade/fills-history',
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
                    'taker': this.parseNumber ('0.0015'),
                    'maker': this.parseNumber ('0.0010'),
                },
                'spot': {
                    'taker': this.parseNumber ('0.0015'),
                    'maker': this.parseNumber ('0.0010'),
                },
                'futures': {
                    'taker': this.parseNumber ('0.0005'),
                    'maker': this.parseNumber ('0.0002'),
                },
                'swap': {
                    'taker': this.parseNumber ('0.00050'),
                    'maker': this.parseNumber ('0.00020'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'exceptions': {
                'exact': {
                    // Public error codes from 50000-53999
                    // General Class
                    '1': ExchangeError, // Operation failed
                    '2': ExchangeError, // Bulk operation partially succeeded
                    '50000': BadRequest, // Body can not be empty
                    '50001': OnMaintenance, // Matching engine upgrading. Please try again later
                    '50002': BadRequest, // Json data format error
                    '50004': RequestTimeout, // Endpoint request timeout (does not indicate success or failure of order, please check order status)
                    '50005': ExchangeNotAvailable, // API is offline or unavailable
                    '50006': BadRequest, // Invalid Content_Type, please use "application/json" format
                    '50007': AccountSuspended, // Account blocked
                    '50008': AuthenticationError, // User does not exist
                    '50009': AccountSuspended, // Account is suspended due to ongoing liquidation
                    '50010': ExchangeError, // User ID can not be empty
                    '50011': RateLimitExceeded, // Request too frequent
                    '50012': ExchangeError, // Account status invalid
                    '50013': ExchangeNotAvailable, // System is busy, please try again later
                    '50014': ExchangeError, // Parameter {0} can not be empty
                    '50015': ExchangeError, // Either parameter {0} or {1} is required
                    '50016': ExchangeError, // Parameter {0} does not match parameter {1}
                    '50017': ExchangeError, // The position is frozen due to ADL. Operation restricted
                    '50018': ExchangeError, // Currency {0} is frozen due to ADL. Operation restricted
                    '50019': ExchangeError, // The account is frozen due to ADL. Operation restricted
                    '50020': ExchangeError, // The position is frozen due to liquidation. Operation restricted
                    '50021': ExchangeError, // Currency {0} is frozen due to liquidation. Operation restricted
                    '50022': ExchangeError, // The account is frozen due to liquidation. Operation restricted
                    '50023': ExchangeError, // Funding fee frozen. Operation restricted
                    '50024': ExchangeError, // Parameter {0} and {1} can not exist at the same time
                    '50025': ExchangeError, // Parameter {0} count exceeds the limit {1}
                    '50026': ExchangeError, // System error
                    '50027': ExchangeError, // The account is restricted from trading
                    '50028': ExchangeError, // Unable to take the order, please reach out to support center for details
                    // API Class
                    '50100': ExchangeError, // API frozen, please contact customer service
                    '50101': ExchangeError, // Broker id of APIKey does not match current environment
                    '50102': InvalidNonce, // Timestamp request expired
                    '50103': AuthenticationError, // Request header "OK_ACCESS_KEY" can not be empty
                    '50104': AuthenticationError, // Request header "OK_ACCESS_PASSPHRASE" can not be empty
                    '50105': AuthenticationError, // Request header "OK_ACCESS_PASSPHRASE" incorrect
                    '50106': AuthenticationError, // Request header "OK_ACCESS_SIGN" can not be empty
                    '50107': AuthenticationError, // Request header "OK_ACCESS_TIMESTAMP" can not be empty
                    '50108': ExchangeError, // Exchange ID does not exist
                    '50109': ExchangeError, // Exchange domain does not exist
                    '50110': PermissionDenied, // Invalid IP
                    '50111': AuthenticationError, // Invalid OK_ACCESS_KEY
                    '50112': AuthenticationError, // Invalid OK_ACCESS_TIMESTAMP
                    '50113': AuthenticationError, // Invalid signature
                    '50114': AuthenticationError, // Invalid authorization
                    '50115': BadRequest, // Invalid request method
                    // Trade Class
                    '51000': BadRequest, // Parameter {0} error
                    '51001': BadSymbol, // Instrument ID does not exist
                    '51002': BadSymbol, // Instrument ID does not match underlying index
                    '51003': BadRequest, // Either client order ID or order ID is required
                    '51004': InvalidOrder, // Order amount exceeds current tier limit
                    '51005': InvalidOrder, // Order amount exceeds the limit
                    '51006': InvalidOrder, // Order price out of the limit
                    '51007': InvalidOrder, // Order placement failed. Order amount should be at least 1 contract (showing up when placing an order with less than 1 contract)
                    '51008': InsufficientFunds, // Order placement failed due to insufficient balance
                    '51009': AccountSuspended, // Order placement function is blocked by the platform
                    '51010': InsufficientFunds, // Account level too low
                    '51011': InvalidOrder, // Duplicated order ID
                    '51012': ExchangeError, // Token does not exist
                    '51014': ExchangeError, // Index does not exist
                    '51015': BadSymbol, // Instrument ID does not match instrument type
                    '51016': InvalidOrder, // Duplicated client order ID
                    '51017': ExchangeError, // Borrow amount exceeds the limit
                    '51018': ExchangeError, // User with option account can not hold net short positions
                    '51019': ExchangeError, // No net long positions can be held under isolated margin mode in options
                    '51020': InvalidOrder, // Order amount should be greater than the min available amount
                    '51021': BadSymbol, // Contract to be listed
                    '51022': BadSymbol, // Contract suspended
                    '51023': ExchangeError, // Position does not exist
                    '51024': AccountSuspended, // Unified accountblocked
                    '51025': ExchangeError, // Order count exceeds the limit
                    '51026': BadSymbol, // Instrument type does not match underlying index
                    '51027': BadSymbol, // Contract expired
                    '51028': BadSymbol, // Contract under delivery
                    '51029': BadSymbol, // Contract is being settled
                    '51030': BadSymbol, // Funding fee is being settled
                    '51031': InvalidOrder, // This order price is not within the closing price range
                    '51100': InvalidOrder, // Trading amount does not meet the min tradable amount
                    '51101': InvalidOrder, // Entered amount exceeds the max pending order amount (Cont) per transaction
                    '51102': InvalidOrder, // Entered amount exceeds the max pending count
                    '51103': InvalidOrder, // Entered amount exceeds the max pending order count of the underlying asset
                    '51104': InvalidOrder, // Entered amount exceeds the max pending order amount (Cont) of the underlying asset
                    '51105': InvalidOrder, // Entered amount exceeds the max order amount (Cont) of the contract
                    '51106': InvalidOrder, // Entered amount exceeds the max order amount (Cont) of the underlying asset
                    '51107': InvalidOrder, // Entered amount exceeds the max holding amount (Cont)
                    '51108': InvalidOrder, // Positions exceed the limit for closing out with the market price
                    '51109': InvalidOrder, // No available offer
                    '51110': InvalidOrder, // You can only place a limit order after Call Auction has started
                    '51111': BadRequest, // Maximum {0} orders can be placed in bulk
                    '51112': InvalidOrder, // Close order size exceeds your available size
                    '51113': RateLimitExceeded, // Market-price liquidation requests too frequent
                    '51115': InvalidOrder, // Cancel all pending close-orders before liquidation
                    '51116': InvalidOrder, // Order price or trigger price exceeds {0}
                    '51117': InvalidOrder, // Pending close-orders count exceeds limit
                    '51118': InvalidOrder, // Total amount should exceed the min amount per order
                    '51119': InsufficientFunds, // Order placement failed due to insufficient balance
                    '51120': InvalidOrder, // Order quantity is less than {0}, please try again
                    '51121': InvalidOrder, // Order count should be the integer multiples of the lot size
                    '51122': InvalidOrder, // Order price should be higher than the min price {0}
                    '51124': InvalidOrder, // You can only place limit orders during call auction
                    '51125': InvalidOrder, // Currently there are reduce + reverse position pending orders in margin trading. Please cancel all reduce + reverse position pending orders and continue
                    '51126': InvalidOrder, // Currently there are reduce only pending orders in margin trading.Please cancel all reduce only pending orders and continue
                    '51127': InsufficientFunds, // Available balance is 0
                    '51128': InvalidOrder, // Multi-currency margin account can not do cross-margin trading
                    '51129': InvalidOrder, // The value of the position and buy order has reached the position limit, and no further buying is allowed
                    '51130': BadSymbol, // Fixed margin currency error
                    '51131': InsufficientFunds, // Insufficient balance
                    '51132': InvalidOrder, // Your position amount is negative and less than the minimum trading amount
                    '51133': InvalidOrder, // Reduce-only feature is unavailable for the spot transactions by multi-currency margin account
                    '51134': InvalidOrder, // Closing failed. Please check your holdings and pending orders
                    '51135': InvalidOrder, // Your closing price has triggered the limit price, and the max buy price is {0}
                    '51136': InvalidOrder, // Your closing price has triggered the limit price, and the min sell price is {0}
                    '51137': InvalidOrder, // Your opening price has triggered the limit price, and the max buy price is {0}
                    '51138': InvalidOrder, // Your opening price has triggered the limit price, and the min sell price is {0}
                    '51139': InvalidOrder, // Reduce-only feature is unavailable for the spot transactions by simple account
                    '51201': InvalidOrder, // Value of per market order cannot exceed 100,000 USDT
                    '51202': InvalidOrder, // Market - order amount exceeds the max amount
                    '51203': InvalidOrder, // Order amount exceeds the limit {0}
                    '51204': InvalidOrder, // The price for the limit order can not be empty
                    '51205': InvalidOrder, // Reduce-Only is not available
                    '51250': InvalidOrder, // Algo order price is out of the available range
                    '51251': InvalidOrder, // Algo order type error (when user place an iceberg order)
                    '51252': InvalidOrder, // Algo order price is out of the available range
                    '51253': InvalidOrder, // Average amount exceeds the limit of per iceberg order
                    '51254': InvalidOrder, // Iceberg average amount error (when user place an iceberg order)
                    '51255': InvalidOrder, // Limit of per iceberg order: Total amount/1000 < x <= Total amount
                    '51256': InvalidOrder, // Iceberg order price variance error
                    '51257': InvalidOrder, // Trail order callback rate error
                    '51258': InvalidOrder, // Trail - order placement failed. The trigger price of a sell order should be higher than the last transaction price
                    '51259': InvalidOrder, // Trail - order placement failed. The trigger price of a buy order should be lower than the last transaction price
                    '51260': InvalidOrder, // Maximum {0} pending trail - orders can be held at the same time
                    '51261': InvalidOrder, // Each user can hold up to {0} pending stop - orders at the same time
                    '51262': InvalidOrder, // Maximum {0} pending iceberg orders can be held at the same time
                    '51263': InvalidOrder, // Maximum {0} pending time-weighted orders can be held at the same time
                    '51264': InvalidOrder, // Average amount exceeds the limit of per time-weighted order
                    '51265': InvalidOrder, // Time-weighted order limit error
                    '51267': InvalidOrder, // Time-weighted order strategy initiative rate error
                    '51268': InvalidOrder, // Time-weighted order strategy initiative range error
                    '51269': InvalidOrder, // Time-weighted order interval error, the interval should be {0}<= x<={1}
                    '51270': InvalidOrder, // The limit of time-weighted order price variance is 0 < x <= 1%
                    '51271': InvalidOrder, // Sweep ratio should be 0 < x <= 100%
                    '51272': InvalidOrder, // Price variance should be 0 < x <= 1%
                    '51273': InvalidOrder, // Total amount should be more than {0}
                    '51274': InvalidOrder, // Total quantity of time-weighted order must be larger than single order limit
                    '51275': InvalidOrder, // The amount of single stop-market order can not exceed the upper limit
                    '51276': InvalidOrder, // Stop - Market orders cannot specify a price
                    '51277': InvalidOrder, // TP trigger price can not be higher than the last price
                    '51278': InvalidOrder, // SL trigger price can not be lower than the last price
                    '51279': InvalidOrder, // TP trigger price can not be lower than the last price
                    '51280': InvalidOrder, // SL trigger price can not be higher than the last price
                    '51400': OrderNotFound, // Cancellation failed as the order does not exist
                    '51401': OrderNotFound, // Cancellation failed as the order is already canceled
                    '51402': OrderNotFound, // Cancellation failed as the order is already completed
                    '51403': InvalidOrder, // Cancellation failed as the order type does not support cancellation
                    '51404': InvalidOrder, // Order cancellation unavailable during the second phase of call auction
                    '51405': ExchangeError, // Cancellation failed as you do not have any pending orders
                    '51406': ExchangeError, // Canceled - order count exceeds the limit {0}
                    '51407': BadRequest, // Either order ID or client order ID is required
                    '51408': ExchangeError, // Pair ID or name does not match the order info
                    '51409': ExchangeError, // Either pair ID or pair name ID is required
                    '51410': ExchangeError, // Cancellation failed as the order is already under cancelling status
                    '51500': ExchangeError, // Either order price or amount is required
                    '51501': ExchangeError, // Maximum {0} orders can be modified
                    '51502': InsufficientFunds, // Order modification failed for insufficient margin
                    '51503': ExchangeError, // Order modification failed as the order does not exist
                    '51506': ExchangeError, // Order modification unavailable for the order type
                    '51508': ExchangeError, // Orders are not allowed to be modified during the call auction
                    '51509': ExchangeError, // Modification failed as the order has been canceled
                    '51510': ExchangeError, // Modification failed as the order has been completed
                    '51511': ExchangeError, // Modification failed as the order price did not meet the requirement for Post Only
                    '51600': ExchangeError, // Status not found
                    '51601': ExchangeError, // Order status and order ID cannot exist at the same time
                    '51602': ExchangeError, // Either order status or order ID is required
                    '51603': OrderNotFound, // Order does not exist
                    // Data class
                    '52000': ExchangeError, // No updates
                    // SPOT/MARGIN error codes 54000-54999
                    '54000': ExchangeError, // Margin transactions unavailable
                    '54001': ExchangeError, // Only Multi-currency margin account can be set to borrow coins automatically
                    // FUNDING error codes 58000-58999
                    '58000': ExchangeError, // Account type {0} does not supported when getting the sub-account balance
                    '58001': AuthenticationError, // Incorrect trade password
                    '58002': PermissionDenied, // Please activate Savings Account first
                    '58003': ExchangeError, // Currency type is not supported by Savings Account
                    '58004': AccountSuspended, // Account blocked (transfer & withdrawal endpoint: either end of the account does not authorize the transfer)
                    '58005': ExchangeError, // The redeemed amount must be no greater than {0}
                    '58006': ExchangeError, // Service unavailable for token {0}
                    '58007': ExchangeError, // Abnormal Assets interface. Please try again later
                    '58100': ExchangeError, // The trading product triggers risk control, and the platform has suspended the fund transfer-out function with related users. Please wait patiently
                    '58101': AccountSuspended, // Transfer suspended (transfer endpoint: either end of the account does not authorize the transfer)
                    '58102': RateLimitExceeded, // Too frequent transfer (transfer too frequently)
                    '58103': ExchangeError, // Parent account user id does not match sub-account user id
                    '58104': ExchangeError, // Since your P2P transaction is abnormal, you are restricted from making fund transfers. Please contact customer support to remove the restriction
                    '58105': ExchangeError, // Since your P2P transaction is abnormal, you are restricted from making fund transfers. Please transfer funds on our website or app to complete identity verification
                    '58106': ExchangeError, // Please enable the account for spot contract
                    '58107': ExchangeError, // Please enable the account for futures contract
                    '58108': ExchangeError, // Please enable the account for option contract
                    '58109': ExchangeError, // Please enable the account for swap contract
                    '58110': ExchangeError, // The contract triggers risk control, and the platform has suspended the fund transfer function of it. Please wait patiently
                    '58111': ExchangeError, // Funds transfer unavailable as the perpetual contract is charging the funding fee. Please try again later
                    '58112': ExchangeError, // Your fund transfer failed. Please try again later
                    '58114': ExchangeError, // Transfer amount must be more than 0
                    '58115': ExchangeError, // Sub-account does not exist
                    '58116': ExchangeError, // Transfer amount exceeds the limit
                    '58117': ExchangeError, // Account assets are abnormal, please deal with negative assets before transferring
                    '58200': ExchangeError, // Withdrawal from {0} to {1} is unavailable for this currency
                    '58201': ExchangeError, // Withdrawal amount exceeds the daily limit
                    '58202': ExchangeError, // The minimum withdrawal amount for NEO is 1, and the amount must be an integer
                    '58203': InvalidAddress, // Please add a withdrawal address
                    '58204': AccountSuspended, // Withdrawal suspended
                    '58205': ExchangeError, // Withdrawal amount exceeds the upper limit
                    '58206': ExchangeError, // Withdrawal amount is lower than the lower limit
                    '58207': InvalidAddress, // Withdrawal failed due to address error
                    '58208': ExchangeError, // Withdrawal failed. Please link your email
                    '58209': ExchangeError, // Withdrawal failed. Withdraw feature is not available for sub-accounts
                    '58210': ExchangeError, // Withdrawal fee exceeds the upper limit
                    '58211': ExchangeError, // Withdrawal fee is lower than the lower limit (withdrawal endpoint: incorrect fee)
                    '58212': ExchangeError, // Withdrawal fee should be {0}% of the withdrawal amount
                    '58213': AuthenticationError, // Please set trading password before withdrawal
                    '58300': ExchangeError, // Deposit-address count exceeds the limit
                    '58350': InsufficientFunds, // Insufficient balance
                    // Account error codes 59000-59999
                    '59000': ExchangeError, // Your settings failed as you have positions or open orders
                    '59001': ExchangeError, // Switching unavailable as you have borrowings
                    '59100': ExchangeError, // You have open positions. Please cancel all open positions before changing the leverage
                    '59101': ExchangeError, // You have pending orders with isolated positions. Please cancel all the pending orders and adjust the leverage
                    '59102': ExchangeError, // Leverage exceeds the maximum leverage. Please adjust the leverage
                    '59103': InsufficientFunds, // Leverage is too low and no sufficient margin in your account. Please adjust the leverage
                    '59104': ExchangeError, // The leverage is too high. The borrowed position has exceeded the maximum position of this leverage. Please adjust the leverage
                    '59105': ExchangeError, // Leverage can not be less than {0}. Please adjust the leverage
                    '59106': ExchangeError, // The max available margin corresponding to your order tier is {0}. Please adjust your margin and place a new order
                    '59107': ExchangeError, // You have pending orders under the service, please modify the leverage after canceling all pending orders
                    '59108': InsufficientFunds, // Low leverage and insufficient margin, please adjust the leverage
                    '59109': ExchangeError, // Account equity less than the required margin amount after adjustment. Please adjust the leverage
                    '59200': InsufficientFunds, // Insufficient account balance
                    '59201': InsufficientFunds, // Negative account balance
                    '59300': ExchangeError, // Margin call failed. Position does not exist
                    '59301': ExchangeError, // Margin adjustment failed for exceeding the max limit
                    '59401': ExchangeError, // Holdings already reached the limit
                    '59500': ExchangeError, // Only the APIKey of the main account has permission
                    '59501': ExchangeError, // Only 50 APIKeys can be created per account
                    '59502': ExchangeError, // Note name cannot be duplicate with the currently created APIKey note name
                    '59503': ExchangeError, // Each APIKey can bind up to 20 IP addresses
                    '59504': ExchangeError, // The sub account does not support the withdrawal function
                    '59505': ExchangeError, // The passphrase format is incorrect
                    '59506': ExchangeError, // APIKey does not exist
                    '59507': ExchangeError, // The two accounts involved in a transfer must be two different sub accounts under the same parent account
                    '59508': AccountSuspended, // The sub account of {0} is suspended
                    // WebSocket error Codes from 60000-63999
                    '60001': AuthenticationError, // "OK_ACCESS_KEY" can not be empty
                    '60002': AuthenticationError, // "OK_ACCESS_SIGN" can not be empty
                    '60003': AuthenticationError, // "OK_ACCESS_PASSPHRASE" can not be empty
                    '60004': AuthenticationError, // Invalid OK_ACCESS_TIMESTAMP
                    '60005': AuthenticationError, // Invalid OK_ACCESS_KEY
                    '60006': InvalidNonce, // Timestamp request expired
                    '60007': AuthenticationError, // Invalid sign
                    '60008': AuthenticationError, // Login is not supported for public channels
                    '60009': AuthenticationError, // Login failed
                    '60010': AuthenticationError, // Already logged in
                    '60011': AuthenticationError, // Please log in
                    '60012': BadRequest, // Illegal request
                    '60013': BadRequest, // Invalid args
                    '60014': RateLimitExceeded, // Requests too frequent
                    '60015': NetworkError, // Connection closed as there was no data transmission in the last 30 seconds
                    '60016': ExchangeNotAvailable, // Buffer is full, cannot write data
                    '60017': BadRequest, // Invalid url path
                    '60018': BadRequest, // The {0} {1} {2} {3} {4} does not exist
                    '60019': BadRequest, // Invalid op {op}
                    '63999': ExchangeError, // Internal system error
                },
                'broad': {
                },
            },
            'httpExceptions': {
                '429': ExchangeNotAvailable, // https://github.com/ccxt/ccxt/issues/9612
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'fetchOHLCV': {
                    'type': 'Candles', // Candles or HistoryCandles, IndexCandles, MarkPriceCandles
                },
                'createMarketBuyOrderRequiresPrice': true,
                'fetchMarkets': [ 'spot', 'futures', 'swap' ], // spot, futures, swap, option
                'defaultType': 'spot', // 'funding', 'spot', 'margin', 'futures', 'swap', 'option'
                // 'fetchBalance': {
                //     'type': 'spot', // 'funding', 'trading', 'spot'
                // },
                'fetchLedger': {
                    'method': 'privateGetAccountBills', // privateGetAccountBillsArchive, privateGetAssetBills
                },
                // 1 = SPOT, 3 = FUTURES, 5 = MARGIN, 6 = FUNDING, 9 = SWAP, 12 = OPTION, 18 = Unified account
                'accountsByType': {
                    'spot': '1',
                    'futures': '3',
                    'margin': '5',
                    'funding': '6',
                    'swap': '9',
                    'option': '12',
                    'trading': '18', // unified trading account
                    'unified': '18',
                },
                'typesByAccount': {
                    '1': 'spot',
                    '3': 'futures',
                    '5': 'margin',
                    '6': 'funding',
                    '9': 'swap',
                    '12': 'option',
                    '18': 'trading', // unified trading account
                },
                'brokerId': 'e847386590ce4dBC',
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
        const settleCurrency = this.safeString (market, 'settleCcy');
        const underlying = this.safeString (market, 'uly');
        if ((underlying !== undefined) && !spot) {
            const parts = underlying.split ('-');
            baseId = this.safeString (parts, 0);
            quoteId = this.safeString (parts, 1);
        }
        const inverse = baseId === settleCurrency;
        const linear = quoteId === settleCurrency;
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
        const contractSize = this.safeString (market, 'ctVal');
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
            'linear': linear,
            'inverse': inverse,
            'active': active,
            'contractSize': contractSize,
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
        // it will reply with {"msg":"Request header “OK_ACCESS_KEY“ can't be empty.","code":"50103"}
        // if you attempt to access it without authentication
        const response = await this.privateGetAssetCurrencies (params);
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "canDep":true,
        //                 "canInternal":true,
        //                 "canWd":true,
        //                 "ccy":"USDT",
        //                 "chain":"USDT-ERC20",
        //                 "maxFee":"40",
        //                 "minFee":"20",
        //                 "minWd":"2",
        //                 "name":""
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        const dataByCurrencyId = this.groupBy (data, 'ccy');
        const currencyIds = Object.keys (dataByCurrencyId);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const chains = dataByCurrencyId[currencyId];
            const first = this.safeValue (chains, 0);
            const id = this.safeString (first, 'ccy');
            const code = this.safeCurrencyCode (id);
            const precision = 0.00000001; // default precision, todo: fix "magic constants"
            let name = this.safeString (first, 'name');
            if ((name !== undefined) && (name.length < 1)) {
                name = undefined;
            }
            const canDeposit = this.safeValue (first, 'canDep');
            const canWithdraw = this.safeValue (first, 'canWd');
            const canInternal = this.safeValue (first, 'canInternal');
            const active = (canDeposit && canWithdraw && canInternal) ? true : false;
            result[code] = {
                'id': id,
                'code': code,
                'info': chains,
                'type': undefined,
                'name': name,
                'active': active,
                'fee': this.safeNumber (first, 'minFee'),
                'precision': precision,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': {
                        'min': this.safeNumber (first, 'ccy'),
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
        const quoteVolume = this.safeNumber (ticker, 'volCcy24h');
        const baseVolume = this.safeNumber (ticker, 'vol24h');
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
        // public fetchTrades
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
        // private fetchMyTrades
        //
        //     {
        //         "side":"buy",
        //         "fillSz":"0.007533",
        //         "fillPx":"2654.98",
        //         "fee":"-0.000007533",
        //         "ordId":"317321390244397056",
        //         "instType":"SPOT",
        //         "instId":"ETH-USDT",
        //         "clOrdId":"",
        //         "posSide":"net",
        //         "billId":"317321390265368576",
        //         "tag":"0",
        //         "execType":"T",
        //         "tradeId":"107601752",
        //         "feeCcy":"ETH",
        //         "ts":"1621927314985"
        //     }
        //
        const id = this.safeString (trade, 'tradeId');
        const marketId = this.safeString (trade, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'ts');
        const priceString = this.safeString2 (trade, 'fillPx', 'px');
        const amountString = this.safeString2 (trade, 'fillSz', 'sz');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'ordId');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCostSigned = Precise.stringNeg (feeCostString);
            const feeCurrencyId = this.safeString (trade, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': this.parseNumber (feeCostSigned),
                'currency': feeCurrencyCode,
            };
        }
        let takerOrMaker = this.safeString (trade, 'execType');
        if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        } else if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        }
        return {
            'info': trade,
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
            request['before'] = since - 1;
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

    parseBalanceByType (type, response) {
        if (type === 'funding') {
            return this.parseFundingBalance (response);
        } else {
            return this.parseTradingBalance (response);
        }
    }

    parseTradingBalance (response) {
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        const timestamp = this.safeInteger (first, 'uTime');
        const details = this.safeValue (first, 'details', []);
        for (let i = 0; i < details.length; i++) {
            const balance = details[i];
            const currencyId = this.safeString (balance, 'ccy');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            const eq = this.safeString (balance, 'eq');
            const availEq = this.safeString (balance, 'availEq');
            if ((eq.length < 1) || (availEq.length < 1)) {
                account['free'] = this.safeString (balance, 'availBal');
                account['used'] = this.safeString (balance, 'frozenBal');
            } else {
                account['total'] = eq;
                account['free'] = availEq;
            }
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.parseBalance (result);
    }

    parseFundingBalance (response) {
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'ccy');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeString (balance, 'bal');
            account['free'] = this.safeString (balance, 'availBal');
            account['used'] = this.safeString (balance, 'frozenBal');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType');
        const options = this.safeValue (this.options, 'fetchBalance', {});
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        params = this.omit (params, 'type');
        let method = undefined;
        if (type === 'funding') {
            method = 'privateGetAssetBalances';
        } else {
            method = 'privateGetAccountBalance';
        }
        const request = {
            // 'ccy': 'BTC,ETH', // comma-separated list of currency ids
        };
        const response = await this[method] (this.extend (request, params));
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
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "adjEq":"",
        //                 "details":[
        //                     {
        //                         "availBal":"0.049",
        //                         "availEq":"",
        //                         "cashBal":"0.049",
        //                         "ccy":"BTC",
        //                         "crossLiab":"",
        //                         "disEq":"1918.55678",
        //                         "eq":"0.049",
        //                         "eqUsd":"1918.55678",
        //                         "frozenBal":"0",
        //                         "interest":"",
        //                         "isoEq":"",
        //                         "isoLiab":"",
        //                         "liab":"",
        //                         "maxLoan":"",
        //                         "mgnRatio":"",
        //                         "notionalLever":"",
        //                         "ordFrozen":"0",
        //                         "twap":"0",
        //                         "uTime":"1621973128591",
        //                         "upl":"",
        //                         "uplLiab":""
        //                     }
        //                 ],
        //                 "imr":"",
        //                 "isoEq":"",
        //                 "mgnRatio":"",
        //                 "mmr":"",
        //                 "notionalUsd":"",
        //                 "ordFroz":"",
        //                 "totalEq":"1918.55678",
        //                 "uTime":"1622045126908"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        // funding
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "availBal":"0.00005426",
        //                 "bal":0.0000542600000000,
        //                 "ccy":"BTC",
        //                 "frozenBal":"0"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        return this.parseBalanceByType (type, response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            //
            //     Simple:
            //     - SPOT and OPTION buyer: cash
            //
            //     Single-currency margin:
            //     - Isolated MARGIN: isolated
            //     - Cross MARGIN: cross
            //     - Cross SPOT: cash
            //     - Cross FUTURES/SWAP/OPTION: cross
            //     - Isolated FUTURES/SWAP/OPTION: isolated
            //
            //     Multi-currency margin:
            //     - Isolated MARGIN: isolated
            //     - Cross SPOT: cross
            //     - Cross FUTURES/SWAP/OPTION: cross
            //     - Isolated FUTURES/SWAP/OPTION: isolated
            //
            'tdMode': 'cash', // cash, cross, isolated
            // 'ccy': currency['id'], // only applicable to cross MARGIN orders in single-currency margin
            // 'clOrdId': clientOrderId, // up to 32 characters, must be unique
            // 'tag': tag, // up to 8 characters
            //
            //     In long/short mode, side and posSide need to be combined
            //
            //     buy with long means open long
            //     sell with long means close long
            //     sell with short means open short
            //     buy with short means close short
            //
            'side': side,
            // 'posSide': 'long', // long, short, // required in the long/short mode, and can only be long or short
            'ordType': type, // market, limit, post_only, fok, ioc
            //
            //     for SPOT/MARGIN bought and sold at a limit price, sz refers to the amount of trading currency
            //     for SPOT/MARGIN bought at a market price, sz refers to the amount of quoted currency
            //     for SPOT/MARGIN sold at a market price, sz refers to the amount of trading currency
            //     for FUTURES/SWAP/OPTION buying and selling, sz refers to the number of contracts
            //
            // 'sz': this.amountToPrecision (symbol, amount),
            // 'px': this.priceToPrecision (symbol, price), // limit orders only
            // 'reduceOnly': false, // MARGIN orders only
        };
        const clientOrderId = this.safeString2 (params, 'clOrdId', 'clientOrderId');
        if (clientOrderId === undefined) {
            const brokerId = this.safeString (this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['clOrdId'] = brokerId + this.uuid16 ();
            }
        } else {
            request['clOrdId'] = clientOrderId;
            params = this.omit (params, [ 'clOrdId', 'clientOrderId' ]);
        }
        if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                let notional = this.safeNumber (params, 'sz');
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if (price !== undefined) {
                        if (notional === undefined) {
                            notional = amount * price;
                        }
                    } else if (notional === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'sz' extra parameter (the exchange-specific behaviour)");
                    }
                } else {
                    notional = (notional === undefined) ? amount : notional;
                }
                const precision = market['precision']['price'];
                request['sz'] = this.decimalToPrecision (notional, TRUNCATE, precision, this.precisionMode);
            } else {
                request['sz'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            request['px'] = this.priceToPrecision (symbol, price);
            request['sz'] = this.amountToPrecision (symbol, amount);
        }
        const response = await this.privatePostTradeOrder (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "clOrdId": "oktswap6",
        //                 "ordId": "312269865356374016",
        //                 "tag": "",
        //                 "sCode": "0",
        //                 "sMsg": ""
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0);
        const order = this.parseOrder (first, market);
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
        const request = {
            'instId': market['id'],
            // 'ordId': id, // either ordId or clOrdId is required
            // 'clOrdId': clientOrderId,
        };
        const clientOrderId = this.safeString2 (params, 'clOrdId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
        } else {
            request['ordId'] = id;
        }
        const query = this.omit (params, [ 'clOrdId', 'clientOrderId' ]);
        const response = await this.privatePostTradeCancelOrder (this.extend (request, query));
        // {"code":"0","data":[{"clOrdId":"","ordId":"317251910906576896","sCode":"0","sMsg":""}],"msg":""}
        const data = this.safeValue (response, 'data', []);
        const order = this.safeValue (data, 0);
        return this.parseOrder (order, market);
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
        //     {
        //         "clOrdId": "oktswap6",
        //         "ordId": "312269865356374016",
        //         "tag": "",
        //         "sCode": "0",
        //         "sMsg": ""
        //     }
        //
        // fetchOrder, fetchOpenOrders
        //
        //     {
        //         "accFillSz":"0",
        //         "avgPx":"",
        //         "cTime":"1621910749815",
        //         "category":"normal",
        //         "ccy":"",
        //         "clOrdId":"",
        //         "fee":"0",
        //         "feeCcy":"ETH",
        //         "fillPx":"",
        //         "fillSz":"0",
        //         "fillTime":"",
        //         "instId":"ETH-USDT",
        //         "instType":"SPOT",
        //         "lever":"",
        //         "ordId":"317251910906576896",
        //         "ordType":"limit",
        //         "pnl":"0",
        //         "posSide":"net",
        //         "px":"2000",
        //         "rebate":"0",
        //         "rebateCcy":"USDT",
        //         "side":"buy",
        //         "slOrdPx":"",
        //         "slTriggerPx":"",
        //         "state":"live",
        //         "sz":"0.001",
        //         "tag":"",
        //         "tdMode":"cash",
        //         "tpOrdPx":"",
        //         "tpTriggerPx":"",
        //         "tradeId":"",
        //         "uTime":"1621910749815"
        //     }
        //
        const id = this.safeString (order, 'ordId');
        const timestamp = this.safeInteger (order, 'cTime');
        const lastTradeTimestamp = this.safeInteger (order, 'fillTime');
        const side = this.safeString (order, 'side');
        let type = this.safeString (order, 'ordType');
        let postOnly = undefined;
        let timeInForce = undefined;
        if (type === 'post_only') {
            postOnly = true;
            type = 'limit';
        } else if (type === 'fok') {
            timeInForce = 'FOK';
            type = 'limit';
        } else if (type === 'ioc') {
            timeInForce = 'IOC';
            type = 'limit';
        }
        const marketId = this.safeString (order, 'instId');
        const symbol = this.safeSymbol (marketId, market, '-');
        const filled = this.safeNumber (order, 'accFillSz');
        const price = this.safeNumber2 (order, 'px', 'slOrdPx');
        const average = this.safeNumber (order, 'avgPx');
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const feeCostString = this.safeString (order, 'fee');
        let amount = undefined;
        let cost = undefined;
        if (side === 'buy' && type === 'market') {
            cost = this.safeNumber (order, 'sz');
        } else {
            amount = this.safeNumber (order, 'sz');
        }
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCostSigned = Precise.stringNeg (feeCostString);
            const feeCurrencyId = this.safeString (order, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': this.parseNumber (feeCostSigned),
                'currency': feeCurrencyCode,
            };
        }
        let clientOrderId = this.safeString (order, 'clOrdId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined; // fix empty clientOrderId string
        }
        const stopPrice = this.safeNumber (order, 'slTriggerPx');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            // 'clOrdId': 'abcdef12345', // optional, [a-z0-9]{1,32}
            // 'ordId': id,
        };
        const clientOrderId = this.safeString2 (params, 'clOrdId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
        } else {
            request['ordId'] = id;
        }
        const query = this.omit (params, [ 'clOrdId', 'clientOrderId' ]);
        const response = await this.privateGetTradeOrder (this.extend (request, query));
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "accFillSz":"0",
        //                 "avgPx":"",
        //                 "cTime":"1621910749815",
        //                 "category":"normal",
        //                 "ccy":"",
        //                 "clOrdId":"",
        //                 "fee":"0",
        //                 "feeCcy":"ETH",
        //                 "fillPx":"",
        //                 "fillSz":"0",
        //                 "fillTime":"",
        //                 "instId":"ETH-USDT",
        //                 "instType":"SPOT",
        //                 "lever":"",
        //                 "ordId":"317251910906576896",
        //                 "ordType":"limit",
        //                 "pnl":"0",
        //                 "posSide":"net",
        //                 "px":"2000",
        //                 "rebate":"0",
        //                 "rebateCcy":"USDT",
        //                 "side":"buy",
        //                 "slOrdPx":"",
        //                 "slTriggerPx":"",
        //                 "state":"live",
        //                 "sz":"0.001",
        //                 "tag":"",
        //                 "tdMode":"cash",
        //                 "tpOrdPx":"",
        //                 "tpTriggerPx":"",
        //                 "tradeId":"",
        //                 "uTime":"1621910749815"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const order = this.safeValue (data, 0);
        return this.parseOrder (order, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'instType': 'SPOT', // SPOT, MARGIN, SWAP, FUTURES, OPTION
            // 'uly': currency['id'],
            // 'instId': market['id'],
            // 'ordType': 'limit', // market, limit, post_only, fok, ioc, comma-separated
            // 'state': 'live', // live, partially_filled
            // 'after': orderId,
            // 'before': orderId,
            // 'limit': limit, // default 100, max 100
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const response = await this.privateGetTradeOrdersPending (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "accFillSz":"0",
        //                 "avgPx":"",
        //                 "cTime":"1621910749815",
        //                 "category":"normal",
        //                 "ccy":"",
        //                 "clOrdId":"",
        //                 "fee":"0",
        //                 "feeCcy":"ETH",
        //                 "fillPx":"",
        //                 "fillSz":"0",
        //                 "fillTime":"",
        //                 "instId":"ETH-USDT",
        //                 "instType":"SPOT",
        //                 "lever":"",
        //                 "ordId":"317251910906576896",
        //                 "ordType":"limit",
        //                 "pnl":"0",
        //                 "posSide":"net",
        //                 "px":"2000",
        //                 "rebate":"0",
        //                 "rebateCcy":"USDT",
        //                 "side":"buy",
        //                 "slOrdPx":"",
        //                 "slTriggerPx":"",
        //                 "state":"live",
        //                 "sz":"0.001",
        //                 "tag":"",
        //                 "tdMode":"cash",
        //                 "tpOrdPx":"",
        //                 "tpTriggerPx":"",
        //                 "tradeId":"",
        //                 "uTime":"1621910749815"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType');
        const options = this.safeString (this.options, 'fetchClosedOrders', {});
        let type = this.safeString (options, 'type', defaultType);
        type = this.safeString (params, 'type', type);
        params = this.omit (params, 'type');
        const request = {
            // 'instType': type.toUpperCase (), // SPOT, MARGIN, SWAP, FUTURES, OPTION
            // 'uly': currency['id'],
            // 'instId': market['id'],
            // 'ordType': 'limit', // market, limit, post_only, fok, ioc, comma-separated
            // 'state': 'filled', // filled, canceled
            // 'after': orderId,
            // 'before': orderId,
            // 'limit': limit, // default 100, max 100
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            if (market['futures'] || market['swap']) {
                type = market['type'];
            }
            request['instId'] = market['id'];
        }
        request['instType'] = type.toUpperCase ();
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const method = this.safeString (options, 'method', 'privateGetTradeOrdersHistory');
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "accFillSz":"0",
        //                 "avgPx":"",
        //                 "cTime":"1621910749815",
        //                 "category":"normal",
        //                 "ccy":"",
        //                 "clOrdId":"",
        //                 "fee":"0",
        //                 "feeCcy":"ETH",
        //                 "fillPx":"",
        //                 "fillSz":"0",
        //                 "fillTime":"",
        //                 "instId":"ETH-USDT",
        //                 "instType":"SPOT",
        //                 "lever":"",
        //                 "ordId":"317251910906576896",
        //                 "ordType":"limit",
        //                 "pnl":"0",
        //                 "posSide":"net",
        //                 "px":"2000",
        //                 "rebate":"0",
        //                 "rebateCcy":"USDT",
        //                 "side":"buy",
        //                 "slOrdPx":"",
        //                 "slTriggerPx":"",
        //                 "state":"live",
        //                 "sz":"0.001",
        //                 "tag":"",
        //                 "tdMode":"cash",
        //                 "tpOrdPx":"",
        //                 "tpTriggerPx":"",
        //                 "tradeId":"",
        //                 "uTime":"1621910749815"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'instType': 'SPOT', // SPOT, MARGIN, SWAP, FUTURES, OPTION
            // 'uly': currency['id'],
            // 'instId': market['id'],
            // 'ordId': orderId,
            // 'after': billId,
            // 'before': billId,
            // 'limit': limit, // default 100, max 100
        };
        let market = undefined;
        await this.loadMarkets ();
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const response = await this.privateGetTradeFillsHistory (this.extend (request, params));
        //
        //     {
        //         "code":"0",
        //         "data":[
        //             {
        //                 "side":"buy",
        //                 "fillSz":"0.007533",
        //                 "fillPx":"2654.98",
        //                 "fee":"-0.000007533",
        //                 "ordId":"317321390244397056",
        //                 "instType":"SPOT",
        //                 "instId":"ETH-USDT",
        //                 "clOrdId":"",
        //                 "posSide":"net",
        //                 "billId":"317321390265368576",
        //                 "tag":"0",
        //                 "execType":"T",
        //                 "tradeId":"107601752",
        //                 "feeCcy":"ETH",
        //                 "ts":"1621927314985"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit, params);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            // 'instrument_id': market['id'],
            'ordId': id,
            // 'after': '1', // return the page after the specified page number
            // 'before': '1', // return the page before the specified page number
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchLedger', {});
        let method = this.safeString (options, 'method');
        method = this.safeString (params, 'method', method);
        params = this.omit (params, 'method');
        const request = {
            // 'instType': undefined, // 'SPOT', 'MARGIN', 'SWAP', 'FUTURES", 'OPTION'
            // 'ccy': undefined, // currency['id'],
            // 'mgnMode': undefined, // 'isolated', 'cross'
            // 'ctType': undefined, // 'linear', 'inverse', only applicable to FUTURES/SWAP
            // 'type': undefined,
            //     1 Transfer,
            //     2 Trade,
            //     3 Delivery,
            //     4 Auto token conversion,
            //     5 Liquidation,
            //     6 Margin transfer,
            //     7 Interest deduction,
            //     8 Funding rate,
            //     9 ADL,
            //     10 Clawback,
            //     11 System token conversion
            // 'subType': undefined,
            //     1 Buy
            //     2 Sell
            //     3 Open long
            //     4 Open short
            //     5 Close long
            //     6 Close short
            //     9 Interest deduction
            //     11 Transfer in
            //     12 Transfer out
            //     160 Manual margin increase
            //     161 Manual margin decrease
            //     162 Auto margin increase
            //     110 Auto buy
            //     111 Auto sell
            //     118 System token conversion transfer in
            //     119 System token conversion transfer out
            //     100 Partial liquidation close long
            //     101 Partial liquidation close short
            //     102 Partial liquidation buy
            //     103 Partial liquidation sell
            //     104 Liquidation long
            //     105 Liquidation short
            //     106 Liquidation buy
            //     107 Liquidation sell
            //     110 Liquidation transfer in
            //     111 Liquidation transfer out
            //     125 ADL close long
            //     126 ADL close short
            //     127 ADL buy
            //     128 ADL sell
            //     170 Exercised
            //     171 Counterparty exercised
            //     172 Expired OTM
            //     112 Delivery long
            //     113 Delivery short
            //     117 Delivery/Exercise clawback
            //     173 Funding fee expense
            //     174 Funding fee income
            //
            // 'after': 'id', // return records earlier than the requested bill id
            // 'before': 'id', // return records newer than the requested bill id
            // 'limit': 100, // default 100, max 100
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['ccy'] = currency['id'];
        }
        const response = await this[method] (this.extend (request, params));
        //
        // privateGetAccountBills, privateGetAccountBillsArchive
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "bal": "0.0000819307998198",
        //                 "balChg": "-664.2679586599999802",
        //                 "billId": "310394313544966151",
        //                 "ccy": "USDT",
        //                 "fee": "0",
        //                 "from": "",
        //                 "instId": "LTC-USDT",
        //                 "instType": "SPOT",
        //                 "mgnMode": "cross",
        //                 "notes": "",
        //                 "ordId": "310394313519800320",
        //                 "pnl": "0",
        //                 "posBal": "0",
        //                 "posBalChg": "0",
        //                 "subType": "2",
        //                 "sz": "664.26795866",
        //                 "to": "",
        //                 "ts": "1620275771196",
        //                 "type": "2"
        //             }
        //         ]
        //     }
        //
        // privateGetAssetBills
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "billId": "12344",
        //                 "ccy": "BTC",
        //                 "balChg": "2",
        //                 "bal": "12",
        //                 "type": "1",
        //                 "ts": "1597026383085"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            '1': 'transfer', // transfer
            '2': 'trade', // trade
            '3': 'trade', // delivery
            '4': 'rebate', // auto token conversion
            '5': 'trade', // liquidation
            '6': 'transfer', // margin transfer
            '7': 'trade', // interest deduction
            '8': 'fee', // funding rate
            '9': 'trade', // adl
            '10': 'trade', // clawback
            '11': 'trade', // system token conversion
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        // privateGetAccountBills, privateGetAccountBillsArchive
        //
        //     {
        //         "bal": "0.0000819307998198",
        //         "balChg": "-664.2679586599999802",
        //         "billId": "310394313544966151",
        //         "ccy": "USDT",
        //         "fee": "0",
        //         "from": "",
        //         "instId": "LTC-USDT",
        //         "instType": "SPOT",
        //         "mgnMode": "cross",
        //         "notes": "",
        //         "ordId": "310394313519800320",
        //         "pnl": "0",
        //         "posBal": "0",
        //         "posBalChg": "0",
        //         "subType": "2",
        //         "sz": "664.26795866",
        //         "to": "",
        //         "ts": "1620275771196",
        //         "type": "2"
        //     }
        //
        // privateGetAssetBills
        //
        //     {
        //         "billId": "12344",
        //         "ccy": "BTC",
        //         "balChg": "2",
        //         "bal": "12",
        //         "type": "1",
        //         "ts": "1597026383085"
        //     }
        //
        const id = this.safeString (item, 'billId');
        const account = undefined;
        const referenceId = this.safeString (item, 'ordId');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'ccy'), currency);
        const amountString = this.safeString (item, 'balChg');
        const amount = this.parseNumber (amountString);
        const timestamp = this.safeInteger (item, 'ts');
        const feeCostString = this.safeString (item, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            fee = {
                'cost': this.parseNumber (Precise.stringNeg (feeCostString)),
                'currency': code,
            };
        }
        const before = undefined;
        const afterString = this.safeString (item, 'bal');
        const after = this.parseNumber (afterString);
        const status = 'ok';
        const marketId = this.safeString (item, 'instId');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
            'fee': fee,
        };
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "addr": "okbtothemoon",
        //         "memo": "971668", // may be missing
        //         "tag":"52055", // may be missing
        //         "pmtId": "", // may be missing
        //         "ccy": "BTC",
        //         "to": "6", // 1 SPOT, 3 FUTURES, 6 FUNDING, 9 SWAP, 12 OPTION, 18 Unified account
        //         "selected": true
        //     }
        //
        //     {
        //         "ccy":"usdt-erc20",
        //         "to":"6",
        //         "addr":"0x696abb81974a8793352cbd33aadcf78eda3cfdfa",
        //         "selected":true
        //     }
        //
        const address = this.safeString (depositAddress, 'addr');
        let tag = this.safeString2 (depositAddress, 'tag', 'pmtId');
        tag = this.safeString (depositAddress, 'memo', tag);
        const currencyId = this.safeString (depositAddress, 'ccy');
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
            'ccy': currency['id'],
        };
        const response = await this.privateGetAssetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "addr": "okbtothemoon",
        //                 "memo": "971668", // may be missing
        //                 "tag":"52055", // may be missing
        //                 "pmtId": "", // may be missing
        //                 "ccy": "BTC",
        //                 "to": "6", // 1 SPOT, 3 FUTURES, 6 FUNDING, 9 SWAP, 12 OPTION, 18 Unified account
        //                 "selected": true
        //             },
        //             // {"ccy":"usdt-erc20","to":"6","addr":"0x696abb81974a8793352cbd33aadcf78eda3cfdfa","selected":true},
        //             // {"ccy":"usdt-trc20","to":"6","addr":"TRrd5SiSZrfQVRKm4e9SRSbn2LNTYqCjqx","selected":true},
        //             // {"ccy":"usdt_okexchain","to":"6","addr":"0x696abb81974a8793352cbd33aadcf78eda3cfdfa","selected":true},
        //             // {"ccy":"usdt_kip20","to":"6","addr":"0x696abb81974a8793352cbd33aadcf78eda3cfdfa","selected":true},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const addressesByCode = this.parseDepositAddresses (data);
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
        if (tag !== undefined) {
            address = address + ':' + tag;
        }
        const fee = this.safeString (params, 'fee');
        if (fee === undefined) {
            throw new ArgumentsRequired (this.id + " withdraw() requires a `fee` string parameter, network transaction fee must be ≥ 0. Withdrawals to OKCoin or OKEx are fee-free, please set '0'. Withdrawing to external digital asset address requires network transaction fee.");
        }
        const request = {
            'ccy': currency['id'],
            'toAddr': address,
            'dest': '4', // 2 = OKCoin International, 3 = OKEx 4 = others
            'amt': this.numberToString (amount),
            'fee': this.numberToString (fee), // withdrawals to OKCoin or OKEx are fee-free, please set 0
        };
        if ('password' in params) {
            request['pwd'] = params['password'];
        } else if ('pwd' in params) {
            request['pwd'] = params['pwd'];
        }
        const query = this.omit (params, [ 'fee', 'password', 'pwd' ]);
        if (!('pwd' in request)) {
            throw new ExchangeError (this.id + ' withdraw() requires a password parameter or a pwd parameter, it must be the funding password, not the API passphrase');
        }
        const response = await this.privatePostAssetWithdrawal (this.extend (request, query));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "amt": "0.1",
        //                 "wdId": "67485",
        //                 "ccy": "BTC"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const transaction = this.safeValue (data, 0);
        return this.parseTransaction (transaction, currency);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'ccy': currency['id'],
            // 'state': 2, // 0 waiting for confirmation, 1 deposit credited, 2 deposit successful
            // 'after': since,
            // 'before' this.milliseconds (),
            // 'limit': limit, // default 100, max 100
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['ccy'] = currency['id'];
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const response = await this.privateGetAssetDepositHistory (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "amt": "0.01044408",
        //                 "txId": "1915737_3_0_0_asset",
        //                 "ccy": "BTC",
        //                 "from": "13801825426",
        //                 "to": "",
        //                 "ts": "1597026383085",
        //                 "state": "2",
        //                 "depId": "4703879"
        //             },
        //             {
        //                 "amt": "491.6784211",
        //                 "txId": "1744594_3_184_0_asset",
        //                 "ccy": "OKB",
        //                 "from": "",
        //                 "to": "",
        //                 "ts": "1597026383085",
        //                 "state": "2",
        //                 "depId": "4703809"
        //             },
        //             {
        //                 "amt": "223.18782496",
        //                 "txId": "6d892c669225b1092c780bf0da0c6f912fc7dc8f6b8cc53b003288624c",
        //                 "ccy": "USDT",
        //                 "from": "",
        //                 "to": "39kK4XvgEuM7rX9frgyHoZkWqx4iKu1spD",
        //                 "ts": "1597026383085",
        //                 "state": "2",
        //                 "depId": "4703779"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'ccy': currency['id'],
            // 'state': 2, // -3: pending cancel, -2 canceled, -1 failed, 0, pending, 1 sending, 2 sent, 3 awaiting email verification, 4 awaiting manual verification, 5 awaiting identity verification
            // 'after': since,
            // 'before': this.milliseconds (),
            // 'limit': limit, // default 100, max 100
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['ccy'] = currency['id'];
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const response = await this.privateGetAssetWithdrawalHistory (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "amt": "0.094",
        //                 "wdId": "4703879",
        //                 "fee": "0.01000000eth",
        //                 "txId": "0x62477bac6509a04512819bb1455e923a60dea5966c7caeaa0b24eb8fb0432b85",
        //                 "ccy": "ETH",
        //                 "from": "13426335357",
        //                 "to": "0xA41446125D0B5b6785f6898c9D67874D763A1519",
        //                 "ts": "1597026383085",
        //                 "state": "2"
        //             },
        //             {
        //                 "amt": "0.01",
        //                 "wdId": "4703879",
        //                 "fee": "0.00000000btc",
        //                 "txId": "",
        //                 "ccy": "BTC",
        //                 "from": "13426335357",
        //                 "to": "13426335357",
        //                 "ts": "1597026383085",
        //                 "state": "2"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    parseTransactionStatus (status) {
        //
        // deposit statuses
        //
        //     {
        //         '0': 'waiting for confirmation',
        //         '1': 'deposit credited',
        //         '2': 'deposit successful'
        //     }
        //
        // withdrawal statuses
        //
        //     {
        //        '-3': 'pending cancel',
        //        '-2': 'canceled',
        //        '-1': 'failed',
        //         '0': 'pending',
        //         '1': 'sending',
        //         '2': 'sent',
        //         '3': 'awaiting email verification',
        //         '4': 'awaiting manual verification',
        //         '5': 'awaiting identity verification'
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
        //         "amt": "0.1",
        //         "wdId": "67485",
        //         "ccy": "BTC"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amt": "0.094",
        //         "wdId": "4703879",
        //         "fee": "0.01000000eth",
        //         "txId": "0x62477bac6509a04512819bb1455e923a60dea5966c7caeaa0b24eb8fb0432b85",
        //         "ccy": "ETH",
        //         "from": "13426335357",
        //         "to": "0xA41446125D0B5b6785f6898c9D67874D763A1519",
        //         'tag': string,
        //         'pmtId': string,
        //         'memo': string,
        //         "ts": "1597026383085",
        //         "state": "2"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "amt": "0.01044408",
        //         "txId": "1915737_3_0_0_asset",
        //         "ccy": "BTC",
        //         "from": "13801825426",
        //         "to": "",
        //         "ts": "1597026383085",
        //         "state": "2",
        //         "depId": "4703879"
        //     }
        //
        let type = undefined;
        let id = undefined;
        const withdrawalId = this.safeString (transaction, 'wdId');
        const addressFrom = this.safeString (transaction, 'from');
        const addressTo = this.safeString (transaction, 'to');
        const address = addressTo;
        let tagTo = this.safeString2 (transaction, 'tag', 'memo');
        tagTo = this.safeString2 (transaction, 'pmtId', tagTo);
        if (withdrawalId !== undefined) {
            type = 'withdrawal';
            id = withdrawalId;
        } else {
            // the payment_id will appear on new deposits but appears to be removed from the response after 2 months
            id = this.safeString (transaction, 'depId');
            type = 'deposit';
        }
        const currencyId = this.safeString (transaction, 'ccy');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeNumber (transaction, 'amt');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const txid = this.safeString (transaction, 'txId');
        const timestamp = this.safeInteger (transaction, 'ts');
        let feeCost = undefined;
        if (type === 'deposit') {
            feeCost = 0;
        } else {
            feeCost = this.safeNumber (transaction, 'fee');
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

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const type = this.safeString (params, 'type');
        params = this.omit (params, 'type');
        const request = {
            // instType String No Instrument type, MARGIN, SWAP, FUTURES, OPTION
            'instId': market['id'],
            // posId String No Single position ID or multiple position IDs (no more than 20) separated with comma
        };
        if (type !== undefined) {
            request['instType'] = type.toUpperCase ();
        }
        params = this.omit (params, 'type');
        const response = await this.privateGetAccountPositions (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "adl":"1",
        //                 "availPos":"1",
        //                 "avgPx":"2566.31",
        //                 "cTime":"1619507758793",
        //                 "ccy":"ETH",
        //                 "deltaBS":"",
        //                 "deltaPA":"",
        //                 "gammaBS":"",
        //                 "gammaPA":"",
        //                 "imr":"",
        //                 "instId":"ETH-USD-210430",
        //                 "instType":"FUTURES",
        //                 "interest":"0",
        //                 "last":"2566.22",
        //                 "lever":"10",
        //                 "liab":"",
        //                 "liabCcy":"",
        //                 "liqPx":"2352.8496681818233",
        //                 "margin":"0.0003896645377994",
        //                 "mgnMode":"isolated",
        //                 "mgnRatio":"11.731726509588816",
        //                 "mmr":"0.0000311811092368",
        //                 "optVal":"",
        //                 "pTime":"1619507761462",
        //                 "pos":"1",
        //                 "posCcy":"",
        //                 "posId":"307173036051017730",
        //                 "posSide":"long",
        //                 "thetaBS":"",
        //                 "thetaPA":"",
        //                 "tradeId":"109844",
        //                 "uTime":"1619507761462",
        //                 "upl":"-0.0000009932766034",
        //                 "uplRatio":"-0.0025490556801078",
        //                 "vegaBS":"",
        //                 "vegaPA":""
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parsePosition (this.safeValue (data, 0));
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        // const defaultType = this.safeString2 (this.options, 'fetchPositions', 'defaultType');
        // const type = this.safeString (params, 'type', defaultType);
        const type = this.safeString (params, 'type');
        params = this.omit (params, 'type');
        const request = {
            // instType String No Instrument type, MARGIN, SWAP, FUTURES, OPTION, instId will be checked against instType when both parameters are passed, and the position information of the instId will be returned.
            // instId String No Instrument ID, e.g. BTC-USD-190927-5000-C
            // posId String No Single position ID or multiple position IDs (no more than 20) separated with comma
        };
        if (type !== undefined) {
            request['instType'] = type.toUpperCase ();
        }
        params = this.omit (params, 'type');
        const response = await this.privateGetAccountPositions (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "adl":"1",
        //                 "availPos":"1",
        //                 "avgPx":"2566.31",
        //                 "cTime":"1619507758793",
        //                 "ccy":"ETH",
        //                 "deltaBS":"",
        //                 "deltaPA":"",
        //                 "gammaBS":"",
        //                 "gammaPA":"",
        //                 "imr":"",
        //                 "instId":"ETH-USD-210430",
        //                 "instType":"FUTURES",
        //                 "interest":"0",
        //                 "last":"2566.22",
        //                 "lever":"10",
        //                 "liab":"",
        //                 "liabCcy":"",
        //                 "liqPx":"2352.8496681818233",
        //                 "margin":"0.0003896645377994",
        //                 "mgnMode":"isolated",
        //                 "mgnRatio":"11.731726509588816",
        //                 "mmr":"0.0000311811092368",
        //                 "optVal":"",
        //                 "pTime":"1619507761462",
        //                 "pos":"1",
        //                 "posCcy":"",
        //                 "posId":"307173036051017730",
        //                 "posSide":"long",
        //                 "thetaBS":"",
        //                 "thetaPA":"",
        //                 "tradeId":"109844",
        //                 "uTime":"1619507761462",
        //                 "upl":"-0.0000009932766034",
        //                 "uplRatio":"-0.0025490556801078",
        //                 "vegaBS":"",
        //                 "vegaPA":""
        //             }
        //         ]
        //     }
        //
        const positions = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const entry = positions[i];
            const instrument = this.safeString (entry, 'instType');
            if ((instrument === 'FUTURES') || instrument === ('SWAP')) {
                result.push (this.parsePosition (positions[i]));
            }
        }
        return result;
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //       "adl": "3",
        //       "availPos": "1",
        //       "avgPx": "34131.1",
        //       "cTime": "1627227626502",
        //       "ccy": "USDT",
        //       "deltaBS": "",
        //       "deltaPA": "",
        //       "gammaBS": "",
        //       "gammaPA": "",
        //       "imr": "170.66093041794787",
        //       "instId": "BTC-USDT-SWAP",
        //       "instType": "SWAP",
        //       "interest": "0",
        //       "last": "34134.4",
        //       "lever": "2",
        //       "liab": "",
        //       "liabCcy": "",
        //       "liqPx": "12608.959083877446",
        //       "margin": "",
        //       "mgnMode": "cross",
        //       "mgnRatio": "140.49930117599155",
        //       "mmr": "1.3652874433435829",
        //       "notionalUsd": "341.5130010779638",
        //       "optVal": "",
        //       "pos": "1",
        //       "posCcy": "",
        //       "posId": "339552508062380036",
        //       "posSide": "long",
        //       "thetaBS": "",
        //       "thetaPA": "",
        //       "tradeId": "98617799",
        //       "uTime": "1627227626502",
        //       "upl": "0.0108608358957281",
        //       "uplRatio": "0.0000636418743944",
        //       "vegaBS": "",
        //       "vegaPA": ""
        //     }
        //
        const marketId = this.safeString (position, 'instId');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const contractsString = this.safeString (position, 'pos');
        let contracts = undefined;
        if (contractsString !== undefined) {
            contracts = parseInt (contractsString);
        }
        const notionalString = this.safeString (position, 'notionalUsd');
        const notional = this.parseNumber (notionalString);
        const marginType = this.safeString (position, 'mgnMode');
        let initialMarginString = undefined;
        const entryPriceString = this.safeString (position, 'avgPx');
        const unrealizedPnlString = this.safeString (position, 'upl');
        if (marginType === 'cross') {
            initialMarginString = this.safeString (position, 'imr');
        } else {
            initialMarginString = this.safeString (position, 'margin');
        }
        const maintenanceMarginString = this.safeString (position, 'mmr');
        const maintenanceMargin = this.parseNumber (maintenanceMarginString);
        let initialMarginPercentage = undefined;
        let maintenanceMarginPercentage = undefined;
        if (market['inverse']) {
            const notionalValue = Precise.stringDiv (Precise.stringMul (contractsString, market['contractSize']), entryPriceString);
            maintenanceMarginPercentage = Precise.stringDiv (maintenanceMarginString, notionalValue);
            initialMarginPercentage = this.parseNumber (Precise.stringDiv (initialMarginString, notionalValue, 4));
        } else {
            maintenanceMarginPercentage = Precise.stringDiv (maintenanceMarginString, notionalString);
            initialMarginPercentage = this.parseNumber (Precise.stringDiv (initialMarginString, notionalString, 4));
        }
        const rounder = '0.00005'; // round to closest 0.01%
        maintenanceMarginPercentage = this.parseNumber (Precise.stringDiv (Precise.stringAdd (maintenanceMarginPercentage, rounder), '1', 4));
        const collateralString = Precise.stringAdd (initialMarginString, unrealizedPnlString);
        const liquidationPrice = this.safeNumber (position, 'liqPx');
        const percentageString = this.safeString (position, 'uplRatio');
        const percentage = this.parseNumber (Precise.stringMul (percentageString, '100'));
        const side = this.safeString (position, 'posSide');
        const timestamp = this.safeInteger (position, 'uTime');
        const leverage = this.safeInteger (position, 'lever');
        const marginRatio = this.parseNumber (Precise.stringDiv (maintenanceMarginString, collateralString, 4));
        return {
            'info': position,
            'symbol': symbol,
            'notional': notional,
            'marginType': marginType,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.parseNumber (entryPriceString),
            'unrealizedPnl': this.parseNumber (unrealizedPnlString),
            'percentage': percentage,
            'contracts': contracts,
            'contractSize': this.parseNumber (market['contractSize']),
            'side': side,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'collateral': this.parseNumber (collateralString),
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'leverage': leverage,
            'marginRatio': marginRatio,
        };
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        if (fromId === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ExchangeError (this.id + ' fromAccount must be one of ' + keys.join (', '));
        }
        if (toId === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ExchangeError (this.id + ' toAccount must be one of ' + keys.join (', '));
        }
        const request = {
            'ccy': currency['id'],
            'amt': this.currencyToPrecision (code, amount),
            'type': '0', // 0 = transfer within account by default, 1 = master account to sub-account, 2 = sub-account to master account
            'from': fromId, // remitting account, 1 = SPOT, 3 = FUTURES, 5 = MARGIN, 6 = FUNDING, 9 = SWAP, 12 = OPTION, 18 = Unified account
            'to': toId, // beneficiary account, 1 = SPOT, 3 = FUTURES, 5 = MARGIN, 6 = FUNDING, 9 = SWAP, 12 = OPTION, 18 = Unified account
            // 'subAcct': 'sub-account-name', // optional, only required when type is 1 or 2
            // 'instId': market['id'], // required when from is 3, 5 or 9, margin trading pair like BTC-USDT or contract underlying like BTC-USD to be transferred out
            // 'toInstId': market['id'], // required when from is 3, 5 or 9, margin trading pair like BTC-USDT or contract underlying like BTC-USD to be transferred in
        };
        const response = await this.privatePostAssetTransfer (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "transId": "754147",
        //                 "ccy": "USDT",
        //                 "from": "6",
        //                 "amt": "0.1",
        //                 "to": "18"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const rawTransfer = this.safeValue (data, 0, {});
        return this.parseTransfer (rawTransfer, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         "transId": "754147",
        //         "ccy": "USDT",
        //         "from": "6",
        //         "amt": "0.1",
        //         "to": "18"
        //     }
        //
        const id = this.safeString (transfer, 'transId');
        const currencyId = this.safeString (transfer, 'ccy');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeNumber (transfer, 'amt');
        const fromAccountId = this.safeString (transfer, 'from');
        const toAccountId = this.safeString (transfer, 'to');
        const typesByAccount = this.safeValue (this.options, 'typesByAccount', {});
        const fromAccount = this.safeString (typesByAccount, fromAccountId);
        const toAccount = this.safeString (typesByAccount, toAccountId);
        const timestamp = undefined;
        const status = undefined;
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isArray = Array.isArray (params);
        const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api']['rest']) + request;
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

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        //
        //     {"code":"1","data":[{"clOrdId":"","ordId":"","sCode":"51119","sMsg":"Order placement failed due to insufficient balance. ","tag":""}],"msg":""}
        //     {"code":"58001","data":[],"msg":"Incorrect trade password"}
        //
        const code = this.safeString (response, 'code');
        if (code !== '0') {
            const feedback = this.id + ' ' + body;
            const data = this.safeValue (response, 'data', []);
            for (let i = 0; i < data.length; i++) {
                const error = data[i];
                const errorCode = this.safeString (error, 'sCode');
                const message = this.safeString (error, 'sMsg');
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            }
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
