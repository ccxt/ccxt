
//  ---------------------------------------------------------------------------

import Exchange from './abstract/okcoin.js';
import { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, PermissionDenied, InsufficientFunds, InvalidOrder, AuthenticationError, NotSupported, RateLimitExceeded } from './base/errors.js';
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
                'fetchPosition': undefined,
                'fetchPositions': undefined,
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
                    '1': ExchangeError, // Operation failed.
                    '2': ExchangeError, // Bulk operation partially succeeded.
                    '50000': ExchangeError, // Body cannot be empty.
                    '50001': ExchangeError, // Service temporarily unavailable, please try again later.
                    '50002': BadRequest, // Json data format error.
                    '50004': ExchangeError, // Endpoint request timeout (does not mean that the request was successful or failed, please check the request result).
                    '50005': ExchangeError, // API is offline or unavailable.
                    '50006': BadRequest, // Invalid Content_Type, please use "application/json" format.
                    '50007': AccountSuspended, // Account blocked.
                    '50008': AuthenticationError, // User does not exist.
                    '50009': AccountSuspended, // Account is suspended due to ongoing liquidation.
                    '50010': BadRequest, // User ID cannot be empty.
                    '50011': RateLimitExceeded, // Requests too frequent.
                    '50012': BadRequest, // Account status invalid.
                    '50013': RateLimitExceeded, // System is busy, please try again later.
                    '50014': BadRequest, // Parameter  cannot be empty.
                    '50015': ExchangeError, // Either parameter  or  is required.
                    '50016': BadRequest, // Parameter  does not match parameter .
                    '50024': BadRequest, // Parameter  and  cannot exist at the same time.
                    '50025': BadRequest, // Parameter  count exceeds the limit .
                    '50026': ExchangeError, // System error, please try again later.
                    '50027': PermissionDenied, // The account is restricted from trading.
                    '50028': ExchangeError, // Unable to take the order, please reach out to support center for details.
                    '50029': ExchangeError, // This instrument () is unavailable at present due to risk management. Please contact customer service for help.
                    '50030': PermissionDenied, // No permission to use this API
                    '50032': InvalidOrder, // This asset is blocked, allow its trading and try again
                    '50033': InvalidOrder, // This instrument is blocked, allow its trading and try again
                    '50035': PermissionDenied, // This endpoint requires that APIKey must be bound to IP
                    '50036': InvalidOrder, // Invalid expTime
                    '50037': InvalidOrder, // Order expired
                    '50038': ExchangeError, // This feature is temporarily unavailable in demo trading
                    '50039': BadRequest, // The before parameter is not available for implementing timestamp pagination
                    '50041': ExchangeError, // You are not currently on the whitelist, please contact customer service
                    '50100': ExchangeError, // API frozen, please contact customer service.
                    '50101': AuthenticationError, // APIKey does not match current environment.
                    '50102': BadRequest, // Timestamp request expired.
                    '50103': BadRequest, // Request header "OK-ACCESS-KEY" cannot be empty.
                    '50104': BadRequest, // Request header "OK-ACCESS-PASSPHRASE" cannot be empty.
                    '50105': BadRequest, // Request header "OK-ACCESS-PASSPHRASE" incorrect.
                    '50106': BadRequest, // Request header "OK-ACCESS-SIGN" cannot be empty.
                    '50107': BadRequest, // Request header "OK-ACCESS-TIMESTAMP" cannot be empty.
                    '50108': BadRequest, // Exchange ID does not exist.
                    '50109': BadRequest, // Exchange domain does not exist.
                    '50110': PermissionDenied, // Your IP  is not included in your API key's IP whitelist.
                    '50111': AuthenticationError, // Invalid OK-ACCESS-KEY.
                    '50112': AuthenticationError, // Invalid OK-ACCESS-TIMESTAMP.
                    '50113': AuthenticationError, // Invalid signature.
                    '50114': AuthenticationError, // Invalid authorization.
                    '50115': AuthenticationError, // Invalid request method.
                    '51000': BadRequest, // Parameter  error.
                    '51001': InvalidOrder, // Instrument ID does not exist.
                    '51003': InvalidOrder, // Either client order ID or order ID is required.
                    '51005': InvalidOrder, // Order amount exceeds the limit.
                    '51006': InvalidOrder, // Order price is not within the price limit (max buy price:  min sell price: )
                    '51008': InsufficientFunds, // Order failed. Insufficient account balance
                    '51009': ExchangeError, // Order placement function is blocked by the platform.
                    '51010': PermissionDenied, // Operation is not supported under the current account mode.
                    '51011': InvalidOrder, // Duplicated order ID.
                    '51012': InvalidOrder, // Token does not exist.
                    '51014': InvalidOrder, // Index does not exist.
                    '51015': InvalidOrder, // Instrument ID does not match instrument type.
                    '51016': InvalidOrder, // Duplicated client order ID.
                    '51020': InvalidOrder, // Order amount should be greater than the min available amount.
                    '51023': InvalidOrder, // Position does not exist.
                    '51024': PermissionDenied, // Trading account is blocked.
                    '51025': InvalidOrder, // Order count exceeds the limit.
                    '51026': InvalidOrder, // Instrument type does not match underlying index.
                    '51030': InvalidOrder, // Funding fee is being settled.
                    '51031': InvalidOrder, // This order price is not within the closing price range.
                    '51032': InvalidOrder, // Closing all positions at market price.
                    '51033': InvalidOrder, // The total amount per order for this pair has reached the upper limit.
                    '51037': InvalidOrder, // The current account risk status only supports you to place IOC orders that can reduce the risk of your account.
                    '51038': InvalidOrder, // There is already an IOC order under the current risk module that reduces the risk of the account.
                    '51044': InvalidOrder, // The order type ,  is not allowed to set stop loss and take profit
                    '51046': InvalidOrder, // The take profit trigger price should be higher than the order price
                    '51047': InvalidOrder, // The stop loss trigger price should be lower than the order price
                    '51048': InvalidOrder, // The take profit trigger price should be lower than the order price
                    '51049': InvalidOrder, // The stop loss trigger price should be higher than the order price
                    '51050': InvalidOrder, // The take profit trigger price should be higher than the best ask price
                    '51051': InvalidOrder, // The stop loss trigger price should be lower than the best ask price
                    '51052': InvalidOrder, // The take profit trigger price should be lower than the best bid price
                    '51053': InvalidOrder, // The stop loss trigger price should be higher than the best bid price
                    '51054': ExchangeError, // Getting information timed out, please try again later
                    '51056': PermissionDenied, // Action not allowed
                    '51058': InvalidOrder, // No available position for this algo order
                    '51059': InvalidOrder, // Strategy for the current state does not support this operation
                    '51101': InvalidOrder, // Entered amount exceeds the max pending order amount (Cont) per transaction.
                    '51103': InvalidOrder, // Entered amount exceeds the max pending order count of the underlying asset.
                    '51104': InvalidOrder, // Entered amount exceeds the max pending order amount (Cont) of the underlying asset.
                    '51106': InvalidOrder, // Entered amount exceeds the max order amount (Cont) of the underlying asset.
                    '51107': InvalidOrder, // Entered amount exceeds the max holding amount (Cont).
                    '51109': InvalidOrder, // No available offer.
                    '51110': InvalidOrder, // You can only place a limit order after Call Auction has started.
                    '51111': InvalidOrder, // Maximum  orders can be placed in bulk.
                    '51112': InvalidOrder, // Close order size exceeds your available size.
                    '51113': RateLimitExceeded, // Market-price liquidation requests too frequent.
                    '51115': InvalidOrder, // Cancel all pending close-orders before liquidation.
                    '51116': InvalidOrder, // Order price or trigger price exceeds .
                    '51117': InvalidOrder, // Pending close-orders count exceeds limit.
                    '51120': InvalidOrder, // Order quantity is less than , please try again.
                    '51121': InvalidOrder, // Order count should be the integer multiples of the lot size.
                    '51122': InvalidOrder, // Order price should be higher than the min price .
                    '51124': InvalidOrder, // You can only place limit orders during call auction.
                    '51127': InsufficientFunds, // Available balance is 0.
                    '51129': InvalidOrder, // The value of the position and buy order has reached the position limit, and no further buying is allowed.
                    '51131': InsufficientFunds, // Insufficient balance.
                    '51132': InvalidOrder, // Your position amount is negative and less than the minimum trading amount.
                    '51134': InvalidOrder, // Closing position failed. Please check your holdings and pending orders.
                    '51135': InvalidOrder, // Your closing price has triggered the limit price, and the max buy price is .
                    '51136': InvalidOrder, // Your closing price has triggered the limit price, and the min sell price is .
                    '51137': InvalidOrder, // Your opening price has triggered the limit price, and the max buy price is .
                    '51138': InvalidOrder, // Your opening price has triggered the limit price, and the min sell price is .
                    '51139': InvalidOrder, // Reduce-only feature is unavailable for the spot transactions by simple account.
                    '51143': InvalidOrder, // There is no valid quotation in the market, and the order cannot be filled in USDT mode, please try to switch to currency mode
                    '51148': InvalidOrder, // ReduceOnly cannot increase the position quantity.
                    '51149': ExchangeError, // Order timed out, please try again later.
                    '51150': InvalidOrder, // The precision of the number of trades or the price exceeds the limit.
                    '51201': InvalidOrder, // Value of per market order cannot exceed 1,000,000 USDT.
                    '51202': InvalidOrder, // Market - order amount exceeds the max amount.
                    '51203': InvalidOrder, // Order amount exceeds the limit .
                    '51204': InvalidOrder, // The price for the limit order cannot be empty.
                    '51205': InvalidOrder, // Reduce-Only is not available.
                    '51206': InvalidOrder, // Please cancel the Reduce Only order before placing the current  order to avoid opening a reverse position.
                    '51250': InvalidOrder, // Algo order price is out of the available range.
                    '51251': InvalidOrder, // Algo order type error (when user place an iceberg order).
                    '51252': InvalidOrder, // Algo order amount is out of the available range.
                    '51253': InvalidOrder, // Average amount exceeds the limit of per iceberg order.
                    '51254': InvalidOrder, // Iceberg average amount error (when user place an iceberg order).
                    '51255': InvalidOrder, // Limit of per iceberg order: Total amount/1000 < x <= Total amount.
                    '51256': InvalidOrder, // Iceberg order price variance error.
                    '51257': InvalidOrder, // Trail order callback rate error.
                    '51258': InvalidOrder, // Trail - order placement failed. The trigger price of a sell order should be higher than the last transaction price.
                    '51259': InvalidOrder, // Trail - order placement failed. The trigger price of a buy order should be lower than the last transaction price.
                    '51260': InvalidOrder, // Maximum  pending trail - orders can be held at the same time.
                    '51261': InvalidOrder, // Each user can hold up to  pending stop - orders at the same time.
                    '51262': InvalidOrder, // Maximum  pending iceberg orders can be held at the same time.
                    '51263': InvalidOrder, // Maximum  pending time-weighted orders can be held at the same time.
                    '51264': InvalidOrder, // Average amount exceeds the limit of per time-weighted order.
                    '51265': InvalidOrder, // Time-weighted order limit error.
                    '51267': InvalidOrder, // Time-weighted order strategy initiative rate error.
                    '51268': InvalidOrder, // Time-weighted order strategy initiative range error.
                    '51269': InvalidOrder, // Time-weighted order interval error, the interval should be <= x<=.
                    '51270': InvalidOrder, // The limit of time-weighted order price variance is 0 < x <= 1%.
                    '51271': InvalidOrder, // Sweep ratio should be 0 < x <= 100%.
                    '51272': InvalidOrder, // Price variance should be 0 < x <= 1%.
                    '51273': InvalidOrder, // Total amount should be more than .
                    '51274': InvalidOrder, // Total quantity of time-weighted order must be larger than single order limit.
                    '51275': InvalidOrder, // The amount of single stop-market order cannot exceed the upper limit.
                    '51276': InvalidOrder, // Stop - Market orders cannot specify a price.
                    '51277': InvalidOrder, // TP trigger price cannot be higher than the last price.
                    '51278': InvalidOrder, // SL trigger price cannot be lower than the last price.
                    '51279': InvalidOrder, // TP trigger price cannot be lower than the last price.
                    '51280': InvalidOrder, // SL trigger price cannot be higher than the last price.
                    '51281': InvalidOrder, // trigger not support the tgtCcy parameter.
                    '51282': InvalidOrder, // The range of Price variance is ~
                    '51283': InvalidOrder, // The range of Time interval is ~
                    '51284': InvalidOrder, // The range of Average amount is ~
                    '51285': InvalidOrder, // The range of Total amount is ~
                    '51286': InvalidOrder, // The total amount should not be less than
                    '51288': ExchangeError, // We are stopping the Bot. Please do not click it multiple times
                    '51289': ExchangeError, // Bot configuration does not exist. Please try again later
                    '51290': ExchangeError, // The Bot engine is being upgraded. Please try again later
                    '51291': ExchangeError, // This Bot does not exist or has been stopped
                    '51292': ExchangeError, // This Bot type does not exist
                    '51293': ExchangeError, // This Bot does not exist
                    '51294': ExchangeError, // This Bot cannot be created temporarily. Please try again later
                    '51299': InvalidOrder, // Order did not go through. You can hold maximum  orders of this type
                    '51300': InvalidOrder, // TP trigger price cannot be higher than the mark price
                    '51302': InvalidOrder, // SL trigger price cannot be lower than the mark price
                    '51303': InvalidOrder, // TP trigger price cannot be lower than the mark price
                    '51304': InvalidOrder, // SL trigger price cannot be higher than the mark price
                    '51305': InvalidOrder, // TP trigger price cannot be higher than the index price
                    '51306': InvalidOrder, // SL trigger price cannot be lower than the index price
                    '51307': InvalidOrder, // TP trigger price cannot be lower than the index price
                    '51308': InvalidOrder, // SL trigger price cannot be higher than the index price
                    '51309': InvalidOrder, // Cannot create trading bot during call auction
                    '51311': InvalidOrder, // Failed to place trailing stop order. Callback rate should be within <x<=
                    '51312': InvalidOrder, // Failed to place trailing stop order. Order amount should be within <x<=
                    '51313': InvalidOrder, // Manual transfer in isolated mode does not support bot trading
                    '51341': InvalidOrder, // Position closing not allowed
                    '51342': InvalidOrder, // Closing order already exists. Please try again later
                    '51343': InvalidOrder, // TP price must be less than the lower price
                    '51344': InvalidOrder, // SL price must be greater than the upper price
                    '51345': InvalidOrder, // Policy type is not grid policy
                    '51346': InvalidOrder, // The highest price cannot be lower than the lowest price
                    '51347': InvalidOrder, // No profit available
                    '51348': InvalidOrder, // Stop loss price should be less than the lower price in the range
                    '51349': InvalidOrder, // Stop profit price should be greater than the highest price in the range
                    '51350': InvalidOrder, // No recommended parameters
                    '51351': InvalidOrder, // Single income must be greater than 0
                    '51400': InvalidOrder, // Cancelation failed as the order does not exist.
                    '51401': InvalidOrder, // Cancelation failed as the order is already canceled.
                    '51402': InvalidOrder, // Cancelation failed as the order is already completed.
                    '51403': InvalidOrder, // Cancelation failed as the order type does not support cancelation.
                    '51404': InvalidOrder, // Order cancelation unavailable during the second phase of call auction.
                    '51405': InvalidOrder, // Cancelation failed as you do not have any pending orders.
                    '51406': InvalidOrder, // Canceled - order count exceeds the limit .
                    '51407': BadRequest, // Either order ID or client order ID is required.
                    '51408': InvalidOrder, // Pair ID or name does not match the order info.
                    '51409': InvalidOrder, // Either pair ID or pair name ID is required.
                    '51410': InvalidOrder, // Cancelation pending. Duplicate order rejected.
                    '51411': PermissionDenied, // Account does not have permission for mass cancelation.
                    '51412': InvalidOrder, // The order has been triggered and cannot be canceled.
                    '51413': InvalidOrder, // Cancelation failed as the order type is not supported by endpoint.
                    '51415': InvalidOrder, // Unable to place order. Spot trading only supports using the last price as trigger price. Please select "Last" and try again.
                    '51500': InvalidOrder, // Either order price or amount is required.
                    '51501': InvalidOrder, // Maximum  orders can be modified.
                    '51503': InvalidOrder, // Order modification failed as the order does not exist.
                    '51506': InvalidOrder, // Order modification unavailable for the order type.
                    '51508': InvalidOrder, // Orders are not allowed to be modified during the call auction.
                    '51509': InvalidOrder, // Modification failed as the order has been canceled.
                    '51510': InvalidOrder, // Modification failed as the order has been completed.
                    '51511': InvalidOrder, // Operation failed as the order price did not meet the requirement for Post Only.
                    '51512': InvalidOrder, // Failed to amend orders in batches. You cannot have duplicate orders in the same amend-batch-orders request.
                    '51513': InvalidOrder, // Number of modification requests that are currently in progress for an order cannot exceed 3.
                    '51600': InvalidOrder, // Status not found.
                    '51601': InvalidOrder, // Order status and order ID cannot exist at the same time.
                    '51602': InvalidOrder, // Either order status or order ID is required.
                    '51603': InvalidOrder, // Order does not exist.
                    '51607': ExchangeError, // The file is generating.
                    '52000': ExchangeError, // No market data found.
                    '54000': ExchangeError, // Margin trading is not supported.
                    '58002': PermissionDenied, // Please activate Savings Account first.
                    '58003': BadRequest, // Currency type is not supported by Savings Account.
                    '58004': AccountSuspended, // Account blocked
                    '58005': BadRequest, // The purchase/redeemed amount must be no greater than .
                    '58006': ExchangeError, // Service unavailable for token .
                    '58007': ExchangeError, // Abnormal Assets interface. Please try again later.
                    '58008': InsufficientFunds, // You do not have assets in this currency.
                    '58009': BadRequest, // Currency pair do not exist.
                    '58010': BadRequest, // The chain  is not supported.
                    '58011': PermissionDenied, // Sorry, we are unable to provide services to unverified users in  due to local laws and regulations. Please verify your account in order to use the services.
                    '58012': PermissionDenied, // Sorry, you can't transfer assets to this recipient as Okcoin are unable to provide services to unverified users in  due to local laws and regulations.
                    '58100': PermissionDenied, // The trading product triggers risk control, and the platform has suspended the fund transfer-out function with related users. Please wait patiently.
                    '58101': PermissionDenied, // Transfer suspended
                    '58102': RateLimitExceeded, // Too frequent transfer (transfer too frequently).
                    '58104': PermissionDenied, // Since your P2P transaction is abnormal, you are restricted from making fund transfers. Please contact customer support to remove the restriction.
                    '58105': PermissionDenied, // Since your P2P transaction is abnormal, you are restricted from making fund transfers. Please transfer funds on our website or app to complete identity verification.
                    '58112': ExchangeError, // Your fund transfer failed. Please try again later.
                    '58114': BadRequest, // Transfer amount must be more than 0.
                    '58115': BadRequest, // Sub-account does not exist.
                    '58116': BadRequest, // Transfer amount exceeds the limit.
                    '58117': BadRequest, // Account assets are abnormal, please deal with negative assets before transferring.
                    '58119': PermissionDenied, //  Sub-account has no permission to transfer out, please set first.
                    '58120': ExchangeError, // The transfer service is temporarily unavailable, please try again later.
                    '58121': BadRequest, // This transfer will result in a high-risk level of your position, which may lead to forced liquidation. You need to re-adjust the transfer amount to make sure the position is at a safe level before proceeding with the transfer.
                    '58123': BadRequest, // Parameter from cannot equal to parameter to.
                    '58124': BadRequest, // Your transfer is being processed, transfer id:. Please check the latest state of your transfer from the endpoint (GET /api/v5/asset/transfer-state)
                    '58200': ExchangeError, // Withdrawal from  to  is currently not supported for this currency.
                    '58201': ExchangeError, // Withdrawal amount exceeds the daily limit.
                    '58202': BadRequest, // The minimum withdrawal amount for NEO is 1, and the amount must be an integer.
                    '58203': BadRequest, // Please add a withdrawal address.
                    '58204': PermissionDenied, // Withdrawal suspended.
                    '58205': BadRequest, // Withdrawal amount exceeds the upper limit.
                    '58206': BadRequest, // Withdrawal amount is less than the lower limit.
                    '58207': BadRequest, // Withdrawal address is not in the verification-free whitelist.
                    '58208': BadRequest, // Withdrawal failed. Please link your email.
                    '58209': BadRequest, // Sub-accounts cannot be deposits or withdrawals
                    '58210': BadRequest, // Withdrawal fee exceeds the upper limit.
                    '58211': BadRequest, // Withdrawal fee is lower than the lower limit (withdrawal endpoint: incorrect fee).
                    '58212': BadRequest, // Withdrawal fee should be % of the withdrawal amount.
                    '58213': BadRequest, // Please set a trading password before withdrawing.
                    '58214': OnMaintenance, // Withdrawals suspended due to  maintenance
                    '58215': BadRequest, // Withdrawal ID does not exist.
                    '58216': ExchangeError, // Operation not allowed.
                    '58217': ExchangeError, // You cannot withdraw your asset at the moment due to a risk detected in your withdrawal address, contact customer support for details.
                    '58218': PermissionDenied, // Your saved withdrawal account has expired.
                    '58220': BadRequest, // The withdrawal order is already canceled.
                    '58221': BadRequest, // Missing label of withdrawal address.
                    '58222': ExchangeError, // Temporarily unable to process withdrawal address.
                    '58224': BadRequest, // This type of coin does not support on-chain withdrawals. Please use internal transfers.
                    '58225': PermissionDenied, // Sorry, you can't transfer assets to this recipient as Okcoin are unable to provide services to unverified users in  due to local laws and regulations.
                    '58226': BadRequest, //  is delisted and not available for crypto withdrawal.
                    '58300': BadRequest, // Deposit-address count exceeds the limit.
                    '58301': BadRequest, // Deposit-address not exist.
                    '58302': BadRequest, // Deposit-address needs tag.
                    '58303': BadRequest, // Deposit for the chain  is closed now.
                    '58304': ExchangeError, // Failed to create invoice.
                    '58350': InsufficientFunds, // Insufficient balance.
                    '58351': BadRequest, // Invoice expired.
                    '58352': BadRequest, // Invalid invoice.
                    '58353': BadRequest, // Deposit amount must be within limits.
                    '58354': BadRequest, // You have reached the limit of 10,000 invoices per day.
                    '58355': PermissionDenied, // Permission denied. Please contact your account manager.
                    '58356': ExchangeError, // The accounts of the same node do not support the Lightning network deposit or withdrawal.
                    '58357': BadRequest, //  is not allowed to create a deposit address
                    '58358': BadRequest, // fromCcy should not be the same as toCcy
                    '58370': BadRequest, // The daily usage of small assets convert exceeds the limit.
                    '58371': BadRequest, // Small assets exceed the maximum limit.
                    '58372': InsufficientFunds, // Insufficient small assets.
                    '59000': BadRequest, // Your settings failed as you have positions or open orders.
                    '59002': BadRequest, // Sub-account settings failed as it has positions, open orders, or trading bots.
                    '59004': BadRequest, // Only IDs with the same instrument type are supported
                    '59110': BadRequest, // The instrument type corresponding to this  does not support the tgtCcy parameter.
                    '59200': InsufficientFunds, // Insufficient account balance.
                    '59201': InsufficientFunds, // Negative account balance.
                    '59401': BadRequest, // Holdings already reached the limit.
                    '59402': BadRequest, // None of the passed instId is in live state, please check them separately.
                    '59500': PermissionDenied, // Only the APIKey of the main account has permission.
                    '59501': PermissionDenied, // Only 50 APIKeys can be created per account.
                    '59502': BadRequest, // Note name cannot be duplicate with the currently created APIKey note name.
                    '59503': BadRequest, // Each APIKey can bind up to 20 IP addresses.
                    '59504': BadRequest, // The sub account does not support the withdrawal function.
                    '59505': BadRequest, // The passphrase format is incorrect.
                    '59506': BadRequest, // APIKey does not exist.
                    '59507': BadRequest, // The two accounts involved in a transfer must be two different sub accounts under the same parent account.
                    '59508': PermissionDenied, // The sub account of  is suspended.
                    '59510': BadRequest, // Sub-account does not exist
                    '59601': BadRequest, // This sub-account name already exists, try another name
                    '59602': BadRequest, // Number of API keys exceeds the limit
                    '59603': BadRequest, // Number of sub accounts exceeds the limit
                    '59604': PermissionDenied, // Only the main account APIkey can access this API
                    '59605': BadRequest, // This API key does not exist in your sub-account, try another API key
                    '59606': BadRequest, // Transfer funds to your main account before deleting your sub-account
                    '59612': BadRequest, // Cannot convert time format
                    '59613': BadRequest, // There is currently no escrow relationship established with the sub account
                    '59614': BadRequest, // Managed sub account do not support this operation
                    '59615': BadRequest, // The time interval between the begin date and end date cannot exceed 180 days.
                    '59616': BadRequest, // Begin date cannot be greater than end date.
                    '59617': ExchangeError, // Sub-account created. Failed to set up account level.
                    '59618': ExchangeError, // Failed to create sub-account.
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
                'fetchBalance': 'account', // 'account', 'asset'
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
        // {
        //     "code":"0",
        //     "msg":"",
        //     "data":[
        //     {
        //         "ts":"1597026383085"
        //     }
        //   ]
        // }
        //
        const data = this.safeValue (response, 'data');
        const ts = this.safeValue (data, 0);
        const timestamp = this.safeInteger (ts, 'ts');
        return timestamp;
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
        const expiry = this.safeInteger (market, 'expTime');
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
        const timestamp = this.safeInteger (data, 'ts');
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
        const timestamp = this.safeInteger (ticker, 'ts');
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
        const timestamp = this.safeInteger (trade, 'ts');
        const priceString = this.safeString2 (trade, 'px', 'fillPx');
        const amountString = this.safeString2 (trade, 'sz', 'fillSz');
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
            'type': this.safeString (trade, 'instType'),
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
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-trades
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
                this.safeInteger (ohlcv, 0),             // timestamp
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
        // asset balance
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
        // account balance
        //
        // [
        //     {
        //         "adjEq": "",
        //         "details": [
        //             {
        //                 "availBal": "1.63427",
        //                 "availEq": "",
        //                 "cashBal": "1.63427",
        //                 "ccy": "USD",
        //                 "crossLiab": "",
        //                 "disEq": "0",
        //                 "eq": "1.63427",
        //                 "eqUsd": "1.63427",
        //                 "fixedBal": "0",
        //                 "frozenBal": "0",
        //                 "interest": "",
        //                 "isoEq": "",
        //                 "isoLiab": "",
        //                 "isoUpl": "",
        //                 "liab": "",
        //                 "maxLoan": "",
        //                 "mgnRatio": "",
        //                 "notionalLever": "",
        //                 "ordFrozen": "0",
        //                 "spotInUseAmt": "",
        //                 "stgyEq": "0",
        //                 "twap": "0",
        //                 "uTime": "1672814264380",
        //                 "upl": "",
        //                 "uplLiab": ""
        //             }
        //         ],
        //         "imr": "",
        //         "isoEq": "",
        //         "mgnRatio": "",
        //         "mmr": "",
        //         "notionalUsd": "",
        //         "ordFroz": "",
        //         "totalEq": "1.63427",
        //         "uTime": "1672814275772"
        //     }
        // ]
        //
        let data = this.safeValue (balance, 0);
        const details = this.safeValue (data, 'details');
        if (details != null) {
            const timestamp = this.safeInteger (data, 'uTime');
            result['timestamp'] = timestamp;
            result['datetime'] = this.iso8601 (timestamp);
            data = details;
        } else {
            data = balance;
        }
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'ccy');
            const code = this.safeSymbol (marketId);
            const account = this.account ();
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
         * @param {string} params.type fetch account type, [asset, account]
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let method = '';
        const defaultType = this.safeString (this.options, 'fetchBalance', 'account'); // 'account', 'asset'
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, [ 'type' ]);
        if (type === 'account') {
            method = 'privateGetAccountBalance';
        } else if (type === 'asset') {
            method = 'privateGetAssetBalances';
        } else {
            throw new NotSupported ('fetchBalance() type "' + type + '" not supported');
        }
        const response = await this[method] (this.extend (request, params));
        //
        // asset balance
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
        // account balance
        //
        // {
        //     "code": "0",
        //     "data": [
        //         {
        //             "adjEq": "",
        //             "details": [
        //                 {
        //                     "availBal": "1.63427",
        //                     "availEq": "",
        //                     "cashBal": "1.63427",
        //                     "ccy": "USD",
        //                     "crossLiab": "",
        //                     "disEq": "0",
        //                     "eq": "1.63427",
        //                     "eqUsd": "1.63427",
        //                     "fixedBal": "0",
        //                     "frozenBal": "0",
        //                     "interest": "",
        //                     "isoEq": "",
        //                     "isoLiab": "",
        //                     "isoUpl": "",
        //                     "liab": "",
        //                     "maxLoan": "",
        //                     "mgnRatio": "",
        //                     "notionalLever": "",
        //                     "ordFrozen": "0",
        //                     "spotInUseAmt": "",
        //                     "stgyEq": "0",
        //                     "twap": "0",
        //                     "uTime": "1672814264380",
        //                     "upl": "",
        //                     "uplLiab": ""
        //                 }
        //             ],
        //             "imr": "",
        //             "isoEq": "",
        //             "mgnRatio": "",
        //             "mmr": "",
        //             "notionalUsd": "",
        //             "ordFroz": "",
        //             "totalEq": "1.63427",
        //             "uTime": "1672814275772"
        //         }
        //     ],
        //     "msg": ""
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
        const timestamp = this.safeInteger (order, 'cTime');
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
            'lastTradeTimestamp': this.safeInteger (order, 'fillTime'),
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
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['before'] = since;
        }
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
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['before'] = since;
        }
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

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-transaction-details-last-3-days
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['before'] = since;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        const response = await this.privateGetTradeFills (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "",
        //     "data": [
        //       {
        //         "instType": "SPOT",
        //         "instId": "BTC-USD",
        //         "tradeId": "123",
        //         "ordId": "312269865356374016",
        //         "clOrdId": "b16",
        //         "billId": "1111",
        //         "tag": "",
        //         "fillPx": "999",
        //         "fillSz": "3",
        //         "side": "buy",
        //         "posSide": "net",
        //         "execType": "M",
        //         "feeCcy": "",
        //         "fee": "",
        //         "ts": "1597026383085"
        //       },
        //       {
        //         "instType": "SPOT",
        //         "instId": "BTC-USD",
        //         "tradeId": "123",
        //         "ordId": "312269865356374016",
        //         "clOrdId": "b16",
        //         "billId": "1111",
        //         "tag": "",
        //         "fillPx": "999",
        //         "fillSz": "3",
        //         "side": "buy",
        //         "posSide": "net",
        //         "execType": "M",
        //         "feeCcy": "",
        //         "fee": "",
        //         "ts": "1597026383085"
        //       }
        //     ]
        // }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit, params);
    }

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-transaction-details-last-3-days
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const request = {
            // 'instrument_id': market['id'],
            'ordId': id,
            // 'after': '1', // return the page after the specified page number
            // 'before': '1', // return the page before the specified page number
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchLedger (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name okcoin#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://www.okcoin.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the okcoin api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['before'] = since;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['ccy'] = currency['id'];
        }
        const response = await this.privateGetAccountBillsArchive (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "data": [
        //         {
        //             "bal": "1.63093282565",
        //             "balChg": "1.63093282565",
        //             "billId": "530758662684151809",
        //             "ccy": "USD",
        //             "execType": "T",
        //             "fee": "-0.00245007435",
        //             "from": "",
        //             "instId": "USDT-USD",
        //             "instType": "SPOT",
        //             "mgnMode": "cash",
        //             "notes": "",
        //             "ordId": "530758662663180288",
        //             "pnl": "0",
        //             "posBal": "0",
        //             "posBalChg": "0",
        //             "subType": "1",
        //             "sz": "1.6333829",
        //             "to": "",
        //             "ts": "1672814726203",
        //             "type": "2"
        //         }
        //     ],
        //     "msg": ""
        // }
        //
        const data = this.safeValue (response, 'data');
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            '1': 'transfer', // funds transfer in/out
            '2': 'trade', // funds moved as a result of a trade, spot accounts only
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        // {
        //     "bal": "1.63093282565",
        //     "balChg": "1.63093282565",
        //     "billId": "530758662684151809",
        //     "ccy": "USD",
        //     "execType": "T",
        //     "fee": "-0.00245007435",
        //     "from": "",
        //     "instId": "USDT-USD",
        //     "instType": "SPOT",
        //     "mgnMode": "cash",
        //     "notes": "",
        //     "ordId": "530758662663180288",
        //     "pnl": "0",
        //     "posBal": "0",
        //     "posBalChg": "0",
        //     "subType": "1",
        //     "sz": "1.6333829",
        //     "to": "",
        //     "ts": "1672814726203",
        //     "type": "2"
        // }
        //
        const id = this.safeString (item, 'billId');
        const details = this.safeValue (item, 'details', {});
        const referenceId = this.safeString (details, 'order_id');
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'ccy'), currency);
        const amount = this.safeString (item, 'sz');
        const timestamp = this.safeString (item, 'ts');
        const fee = {
            'cost': this.safeString (item, 'fee'),
            'currency': code,
        };
        const after = this.safeString (item, 'bal');
        const balanceChange = this.safeString (item, 'balChg');
        const before = Precise.stringSub (after, balanceChange);
        const status = 'ok';
        const marketId = this.safeString (item, 'instId');
        const symbol = this.safeSymbol (marketId);
        return {
            'info': item,
            'id': id,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
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
