'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, InsufficientFunds, InvalidNonce, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, BadSymbol, RateLimitExceeded, NetworkError } = require ('./base/errors');
const Precise = require ('./base/Precise');
const { TRUNCATE } = require ('./base/functions/number');

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
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false, // see below
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'fetchDeposits': true,
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
                'api': {
                    'rest': 'https://www.{hostname}',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/docs/en/',
                'fees': 'https://www.okex.com/pages/products/fees.html',
            },
            'api': {
                'public': {
                    'get': [
                        'market/ticker',
                        'market/books',
                        'market/candles',
                        'market/history-candles',
                        'market/index-candles',
                        'market/mark-price-candles',
                        'market/trades',
                        'public/instruments',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'asset/currencies',
                        'trade/order',
                        'trade/orders-pending',
                        'trade/orders-history',
                        'trade/fills',
                        'asset/withdrawal-history',
                        'asset/deposit-history',
                    ],
                    'post': [
                        'trade/order',
                        'trade/cancel-order',
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
                    '51603': ExchangeError, // Order does not exist
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
            },
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

    async fetchMarkets (params = {}) {
        // TODO: add support for futures, swap, option if required
        return await this.fetchMarketsByType ('spot', params);
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
        const lotSize = this.safeString (market, 'lotSz');
        const precision = {
            'amount': this.precisionFromString (lotSize),
            'price': this.precisionFromString (tickSize),
        };
        const minAmountString = this.safeString (market, 'minSz');
        const minAmount = this.precisionFromString (minAmountString);
        let minCost = undefined;
        if ((minAmount !== undefined) && (tickSize !== undefined)) {
            minCost = this.precisionFromString (Precise.stringMul (tickSize, minAmountString));
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

    async fetchOrderBook (symbol, limit = 20, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            'sz': limit, // Max 400
        };
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
        return this.parseOrderBook (first, timestamp);
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
        if (market === undefined && marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        const symbol = market['symbol'];
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
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open24h'),
            'close': this.safeNumber (ticker, 'last'),
            'last': this.safeNumber (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'vol24h'),
            'quoteVolume': this.safeNumber (ticker, 'volCcy24h'),
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
        //
        const id = this.safeString (trade, 'tradeId');
        const marketId = this.safeString (trade, 'instId');
        if (market === undefined && marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'ts');
        const priceString = this.safeString2 (trade, 'fillPx', 'px');
        const amountString = this.safeString2 (trade, 'fillSz', 'sz');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'ordId');
        const feeCost = this.safeNumber (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
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
            request['before'] = since;
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

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'ccy': 'XRP'
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
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        const details = this.safeValue (first, 'details', []);
        for (let i = 0; i < details.length; i++) {
            const balance = details[i];
            const currencyId = this.safeString (balance, 'ccy');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'availBal');
            account['used'] = this.safeFloat (balance, 'frozenBal');
            result[code] = account;
        }
        return this.parseBalance (result);
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
        if (type !== 'market') {
            type = 'limit';
        }
        const marketId = this.safeString (order, 'instId');
        if (market === undefined && marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        const symbol = market['symbol'];
        let amount = this.safeNumber (order, 'sz');
        const filled = this.safeNumber (order, 'accFillSz');
        let price = this.safeFloat2 (order, 'px', 'slOrdPx');
        if (price === undefined) {
            price = this.safeNumber (order, 'avgPx');
        }
        const average = this.safeNumber (order, 'avgPx');
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const feeCost = this.safeNumber (order, 'fee');
        if (type.toLowerCase () === 'market' && side.toLowerCase () === 'buy') {
            const avgPrice = this.safeNumber (order, 'avgPx');
            if (avgPrice !== undefined && amount !== undefined && filled !== undefined) {
                amount = filled;
            }
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        let clientOrderId = this.safeString (order, 'clOrdId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const stopPrice = this.safeNumber (order, 'slTriggerPx');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.iso8601 (lastTradeTimestamp),
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'average': average,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            'side': side.toLowerCase (),
            'tdMode': 'cash',
            'ordType': type, // market, limit, post_only, fok, ioc
            // 'sz': this.amountToPrecision (symbol, amount),
            // 'px': this.priceToPrecision (symbol, price), // limit orders only
            // 'reduceOnly': false, // MARGIN orders only
        };
        const clientOrderId = this.safeString2 (params, 'clOrdId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
            params = this.omit (params, [ 'clOrdId', 'clientOrderId' ]);
        }
        if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                let notional = this.safeValue (params, 'notional');
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
        return await this.fetchOrder (this.safeString (first, 'ordId'), symbol);
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
        const clientOrderId = this.safeString (params, 'clientOrderId');
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
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

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            // 'instType': 'SPOT', // SPOT, MARGIN, SWAP, FUTURES, OPTION
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
        if ('marketType' in params) {
            request['instType'] = params['marketType'].toUpperCase ();
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const response = await this.privateGetTradeFills (this.extend (request, params));
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
        if ('marketType' in params) {
            request['instType'] = params['marketType'].toUpperCase ();
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

    async fetchCurrencies (params = {}) {
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isArray = Array.isArray (params);
        const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeParams (this.urls['api']['rest'], { 'hostname': this.hostname }) + request;
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
        const code = this.safeInteger (response, 'code');
        if (code !== 0) {
            const message = this.safeString (response, 'msg');
            let feedback = this.id;
            const data = this.safeValue (response, 'data', []);
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const error = data[i];
                    const errorCode = this.safeString (error, 'sCode');
                    if (errorCode === undefined) {
                        break;
                    }
                    const message = this.safeString (error, 'sMsg');
                    feedback = feedback + ' ' + message;
                    this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                }
            }
            feedback = feedback + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
