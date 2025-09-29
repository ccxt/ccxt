
//  ---------------------------------------------------------------------------

import Exchange from './abstract/okcoin.js';
import { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, NetworkError, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, AccountNotEnabled, BadSymbol, RateLimitExceeded, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Currencies, Dict, int, LedgerEntry, DepositAddress } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class okcoin
 * @augments Exchange
 */
export default class okcoin extends Exchange {
    describe (): any {
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
                'swap': false,
                'future': true,
                'option': undefined,
                'cancelOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true, // see below
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': undefined,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': undefined,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setMargin': false,
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
            },
            'hostname': 'okcoin.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295551-102fbf00-c50e-11ea-90a9-462eebba5829.jpg',
                'api': {
                    'rest': 'https://www.{hostname}',
                },
                'www': 'https://www.okcoin.com',
                'doc': 'https://www.okcoin.com/docs/en/',
                'fees': 'https://www.okcoin.com/coin-fees',
                'referral': 'https://www.okcoin.com/account/register?flag=activity&channelId=600001513',
                'test': {
                    'rest': 'https://testnet.okex.com',
                },
            },
            'api': {
                'public': {
                    'get': {
                        'market/tickers': 1,
                        'market/ticker': 1,
                        'market/books': 1 / 2,
                        'market/candles': 1 / 2,
                        'market/history-candles': 1 / 2,
                        'market/trades': 1 / 5,
                        'market/history-trades': 2,
                        'market/platform-24-volume': 10,
                        'market/open-oracle': 50,
                        'market/exchange-rate': 20,
                        'public/instruments': 1,
                        'public/time': 2,
                    },
                },
                'private': {
                    'get': {
                        // trade
                        'trade/order': 1 / 3,
                        'trade/orders-pending': 1 / 3,
                        'trade/orders-history': 1 / 2,
                        'trade/orders-history-archive': 1 / 2,
                        'trade/fills': 1 / 3,
                        'trade/fills-history': 2.2,
                        'trade/fills-archive': 2,
                        'trade/order-algo': 1,
                        'trade/orders-algo-pending': 1,
                        'trade/orders-algo-history': 1,
                        // rfq
                        'otc/rfq/trade': 4,
                        'otc/rfq/history': 4,
                        // account
                        'account/balance': 2,
                        'account/bills': 5 / 3,
                        'account/bills-archive': 5 / 3,
                        'account/config': 4,
                        'account/max-size': 4,
                        'account/max-avail-size': 4,
                        'account/trade-fee': 4,
                        'account/max-withdrawal': 4,
                        // funding or assets
                        'asset/currencies': 5 / 3,
                        'asset/balances': 5 / 3,
                        'asset/asset-valuation': 10,
                        'asset/transfer-state': 10,
                        'asset/bills': 5 / 3,
                        'asset/deposit-lightning': 5,
                        'asset/deposit-address': 5 / 3,
                        'asset/deposit-history': 5 / 3,
                        'asset/withdrawal-history': 5 / 3,
                        'asset/deposit-withdraw-status': 20,
                        // fiat
                        'fiat/deposit-history': 5 / 3,
                        'fiat-withdraw-history': 5 / 3,
                        'fiat-channel': 5 / 3,
                        // sub-account
                        'users/subaccount/list': 10,
                        'users/subaccount/apiKey': 10,
                        'account/subaccount/balances': 10,
                        'asset/subaccount/balances': 10,
                        'asset/subaccount/bills': 10,
                    },
                    'post': {
                        // trade
                        'trade/order': 1 / 3,
                        'trade/batch-orders': 1 / 15,
                        'trade/cancel-order': 1 / 3,
                        'trade/cancel-batch-orders': 1 / 15,
                        'trade/amend-order': 1 / 3,
                        'trade/amend-batch-orders': 1 / 150,
                        'trade/order-algo': 1,
                        'trade/cancel-algos': 1,
                        'trade/cancel-advance-algos': 1,
                        // rfq
                        'otc/rfq/quote': 4,
                        'otc/rfq/trade': 4,
                        // funding
                        'asset/transfer': 4,
                        'asset/withdrawal': 4,
                        'asset/withdrawal-lightning': 4,
                        'asset/withdrawal-cancel': 4,
                        // fiat
                        'fiat/deposit': 5 / 3,
                        'fiat/cancel-deposit': 5 / 3,
                        'fiat/withdrawal': 5 / 3,
                        'fiat/cancel-withdrawal': 5 / 3,
                        // sub-account
                        'asset/subaccount/transfer': 10,
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'fetchCurrencies': {
                        'private': true,
                    },
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerDirection': true, // todo
                        'triggerPriceType': {
                            'last': true,
                            'mark': false,
                            'index': false,
                        },
                        'stopLossPrice': true, // todo revise trigger
                        'takeProfitPrice': true, // todo revise trigger
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': true,
                                'mark': false,
                                'index': false,
                            },
                            'price': true,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': true, // todo
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': true, // todo
                    },
                    'createOrders': undefined, // todo
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 90,
                        'untilDays': 90, // todo
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': true, // todo
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 90, // todo
                        'daysBackCanceled': 1 / 12, // todo: possible more with history endpoint
                        'untilDays': 90, // todo
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 100, // 300 is only possible for 'recent' 1440 candles, which does not make much sense
                    },
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
                    '50014': BadRequest, // Parameter {0} can not be empty
                    '50015': ExchangeError, // Either parameter {0} or {1} is required
                    '50016': ExchangeError, // Parameter {0} does not match parameter {1}
                    '50017': ExchangeError, // The position is frozen due to ADL. Operation restricted
                    '50018': ExchangeError, // Currency {0} is frozen due to ADL. Operation restricted
                    '50019': ExchangeError, // The account is frozen due to ADL. Operation restricted
                    '50020': ExchangeError, // The position is frozen due to liquidation. Operation restricted
                    '50021': ExchangeError, // Currency {0} is frozen due to liquidation. Operation restricted
                    '50022': ExchangeError, // The account is frozen due to liquidation. Operation restricted
                    '50023': ExchangeError, // Funding fee frozen. Operation restricted
                    '50024': BadRequest, // Parameter {0} and {1} can not exist at the same time
                    '50025': ExchangeError, // Parameter {0} count exceeds the limit {1}
                    '50026': ExchangeNotAvailable, // System error, please try again later.
                    '50027': PermissionDenied, // The account is restricted from trading
                    '50028': ExchangeError, // Unable to take the order, please reach out to support center for details
                    '50029': ExchangeError, // This instrument ({0}) is unavailable at present due to risk management. Please contact customer service for help.
                    '50030': PermissionDenied, // No permission to use this API
                    '50032': AccountSuspended, // This asset is blocked, allow its trading and try again
                    '50033': AccountSuspended, // This instrument is blocked, allow its trading and try again
                    '50035': BadRequest, // This endpoint requires that APIKey must be bound to IP
                    '50036': BadRequest, // Invalid expTime
                    '50037': BadRequest, // Order expired
                    '50038': ExchangeError, // This feature is temporarily unavailable in demo trading
                    '50039': ExchangeError, // The before parameter is not available for implementing timestamp pagination
                    '50041': ExchangeError, // You are not currently on the whitelist, please contact customer service
                    '50044': BadRequest, // Must select one broker type
                    // API Class
                    '50100': ExchangeError, // API frozen, please contact customer service
                    '50101': AuthenticationError, // Broker id of APIKey does not match current environment
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
                    '51010': AccountNotEnabled, // Account level too low {"code":"1","data":[{"clOrdId":"uJrfGFth9F","ordId":"","sCode":"51010","sMsg":"The current account mode does not support this API interface. ","tag":""}],"msg":"Operation failed."}
                    '51011': InvalidOrder, // Duplicated order ID
                    '51012': BadSymbol, // Token does not exist
                    '51014': BadSymbol, // Index does not exist
                    '51015': BadSymbol, // Instrument ID does not match instrument type
                    '51016': InvalidOrder, // Duplicated client order ID
                    '51017': ExchangeError, // Borrow amount exceeds the limit
                    '51018': ExchangeError, // User with option account can not hold net short positions
                    '51019': ExchangeError, // No net long positions can be held under isolated margin mode in options
                    '51020': InvalidOrder, // Order amount should be greater than the min available amount
                    '51023': ExchangeError, // Position does not exist
                    '51024': AccountSuspended, // Unified accountblocked
                    '51025': ExchangeError, // Order count exceeds the limit
                    '51026': BadSymbol, // Instrument type does not match underlying index
                    '51030': InvalidOrder, // Funding fee is being settled.
                    '51031': InvalidOrder, // This order price is not within the closing price range
                    '51032': InvalidOrder, // Closing all positions at market price.
                    '51033': InvalidOrder, // The total amount per order for this pair has reached the upper limit.
                    '51037': InvalidOrder, // The current account risk status only supports you to place IOC orders that can reduce the risk of your account.
                    '51038': InvalidOrder, // There is already an IOC order under the current risk module that reduces the risk of the account.
                    '51044': InvalidOrder, // The order type {0}, {1} is not allowed to set stop loss and take profit
                    '51046': InvalidOrder, // The take profit trigger price must be higher than the order price
                    '51047': InvalidOrder, // The stop loss trigger price must be lower than the order price
                    '51048': InvalidOrder, // The take profit trigger price should be lower than the order price
                    '51049': InvalidOrder, // The stop loss trigger price should be higher than the order price
                    '51050': InvalidOrder, // The take profit trigger price should be higher than the best ask price
                    '51051': InvalidOrder, // The stop loss trigger price should be lower than the best ask price
                    '51052': InvalidOrder, // The take profit trigger price should be lower than the best bid price
                    '51053': InvalidOrder, // The stop loss trigger price should be higher than the best bid price
                    '51054': BadRequest, // Getting information timed out, please try again later
                    '51056': InvalidOrder, // Action not allowed
                    '51058': InvalidOrder, // No available position for this algo order
                    '51059': InvalidOrder, // Strategy for the current state does not support this operation
                    '51100': InvalidOrder, // Trading amount does not meet the min tradable amount
                    '51102': InvalidOrder, // Entered amount exceeds the max pending count
                    '51103': InvalidOrder, // Entered amount exceeds the max pending order count of the underlying asset
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
                    '51156': BadRequest, // You're leading trades in long/short mode and can't use this API endpoint to close positions
                    '51159': BadRequest, // You're leading trades in buy/sell mode. If you want to place orders using this API endpoint, the orders must be in the same direction as your existing positions and open orders.
                    '51162': InvalidOrder, // You have {instrument} open orders. Cancel these orders and try again
                    '51163': InvalidOrder, // You hold {instrument} positions. Close these positions and try again
                    '51166': InvalidOrder, // Currently, we don't support leading trades with this instrument
                    '51174': InvalidOrder, // The number of {param0} pending orders reached the upper limit of {param1} (orders).
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
                    '51321': InvalidOrder, // You're leading trades. Currently, we don't support leading trades with arbitrage, iceberg, or TWAP bots
                    '51322': InvalidOrder, // You're leading trades that have been filled at market price. We've canceled your open stop orders to close your positions
                    '51323': BadRequest, // You're already leading trades with take profit or stop loss settings. Cancel your existing stop orders to proceed
                    '51324': BadRequest, // As a lead trader, you hold positions in {instrument}. To close your positions, place orders in the amount that equals the available amount for closing
                    '51325': InvalidOrder, // As a lead trader, you must use market price when placing stop orders
                    '51327': InvalidOrder, // closeFraction is only available for futures and perpetual swaps
                    '51328': InvalidOrder, // closeFraction is only available for reduceOnly orders
                    '51329': InvalidOrder, // closeFraction is only available in NET mode
                    '51330': InvalidOrder, // closeFraction is only available for stop market orders
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
                    '51410': CancelPending, // Cancellation failed as the order is already under cancelling status
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
                    '51732': AuthenticationError, // Required user KYC level not met
                    '51733': AuthenticationError, // User is under risk control
                    '51734': AuthenticationError, // User KYC Country is not supported
                    '51735': ExchangeError, // Sub-account is not supported
                    '51736': InsufficientFunds, // Insufficient {ccy} balance
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
                    '58125': BadRequest, // Non-tradable assets can only be transferred from sub-accounts to main accounts
                    '58126': BadRequest, // Non-tradable assets can only be transferred between funding accounts
                    '58127': BadRequest, // Main account API Key does not support current transfer 'type' parameter. Please refer to the API documentation.
                    '58128': BadRequest, // Sub-account API Key does not support current transfer 'type' parameter. Please refer to the API documentation.
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
                    '58221': BadRequest, // Missing label of withdrawal address.
                    '58222': BadRequest, // Illegal withdrawal address.
                    '58224': BadRequest, // This type of crypto does not support on-chain withdrawing to OKX addresses. Please withdraw through internal transfers.
                    '58227': BadRequest, // Withdrawal of non-tradable assets can be withdrawn all at once only
                    '58228': BadRequest, // Withdrawal of non-tradable assets requires that the API Key must be bound to an IP
                    '58229': InsufficientFunds, // Insufficient funding account balance to pay fees {fee} USDT
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
                    '59128': InvalidOrder, // As a lead trader, you can't lead trades in {instrument} with leverage higher than {num}
                    '59200': InsufficientFunds, // Insufficient account balance
                    '59201': InsufficientFunds, // Negative account balance
                    '59216': BadRequest, // The position doesn't exist. Please try again
                    '59300': ExchangeError, // Margin call failed. Position does not exist
                    '59301': ExchangeError, // Margin adjustment failed for exceeding the max limit
                    '59313': ExchangeError, // Unable to repay. You haven't borrowed any {ccy} {ccyPair} in Quick margin mode.
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
                    '70010': BadRequest, // Timestamp parameters need to be in Unix timestamp format in milliseconds.
                    '70013': BadRequest, // endTs needs to be bigger than or equal to beginTs.
                    '70016': BadRequest, // Please specify your instrument settings for at least one instType.
                },
                'broad': {
                    'Internal Server Error': ExchangeNotAvailable, // {"code":500,"data":{},"detailMsg":"","error_code":"500","error_message":"Internal Server Error","msg":"Internal Server Error"}
                    'server error': ExchangeNotAvailable, // {"code":500,"data":{},"detailMsg":"","error_code":"500","error_message":"server error 1236805249","msg":"server error 1236805249"}
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
                    'classic': '1',
                    'spot': '1',
                    'funding': '6',
                    'main': '6',
                    'unified': '18',
                },
                'accountsById': {
                    '1': 'spot',
                    '6': 'funding',
                    '18': 'unified',
                },
                'auth': {
                    'time': 'public',
                    'currencies': 'private',
                    'instruments': 'public',
                    'rate': 'public',
                    '{instrument_id}/constituents': 'public',
                },
                'warnOnFetchCurrenciesWithoutAuthorization': false,
                'defaultNetwork': 'ERC20',
                'networks': {
                    'ERC20': 'Ethereum',
                    'BTC': 'Bitcoin',
                    'OMNI': 'Omni',
                    'TRC20': 'TRON',
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
                'TRADE': 'Unitrade',
                'YOYO': 'YOYOW',
                'WIN': 'WinToken', // https://github.com/ccxt/ccxt/issues/5701
            },
        });
    }

    /**
     * @method
     * @name okcoin#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetPublicTime (params);
        //
        // {
        //     "code": "0",
        //     "data":
        //         [
        //             {
        //                 "ts": "1737379360033"
        //             }
        //         ],
        //     "msg": ""
        // }
        //
        const data = this.safeList (response, 'data');
        const timestamp = this.safeDict (data, 0);
        return this.safeInteger (timestamp, 'ts');
    }

    /**
     * @method
     * @name okcoin#fetchMarkets
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-public-data-get-instruments
     * @description retrieves data on all markets for okcoin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const request: Dict = {
            'instType': 'SPOT',
        };
        const response = await this.publicGetPublicInstruments (this.extend (request, params));
        const markets = this.safeValue (response, 'data', []);
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        //
        // spot markets
        //
        //     {
        //         "base_currency": "EOS",
        //         "instrument_id": "EOS-OKB",
        //         "min_size": "0.01",
        //         "quote_currency": "OKB",
        //         "size_increment": "0.000001",
        //         "tick_size": "0.0001"
        //     }
        //
        const id = this.safeString (market, 'instId');
        let type = this.safeStringLower (market, 'instType');
        if (type === 'futures') {
            type = 'future';
        }
        const spot = (type === 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        const option = (type === 'option');
        const contract = swap || future || option;
        const baseId = this.safeString (market, 'baseCcy');
        const quoteId = this.safeString (market, 'quoteCcy');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const tickSize = this.safeString (market, 'tickSz');
        const fees = this.safeValue2 (this.fees, type, 'trading', {});
        let maxLeverage = this.safeString (market, 'lever', '1');
        maxLeverage = Precise.stringMax (maxLeverage, '1');
        const maxSpotCost = this.safeNumber (market, 'maxMktSz');
        return this.extend (fees, {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': type,
            'spot': spot,
            'margin': spot && (Precise.stringGt (maxLeverage, '1')),
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': contract ? this.safeNumber (market, 'ctVal') : undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'created': this.safeInteger (market, 'listTime'),
            'precision': {
                'amount': this.safeNumber (market, 'lotSz'),
                'price': this.parseNumber (tickSize),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.parseNumber (maxLeverage),
                },
                'amount': {
                    'min': this.safeNumber (market, 'minSz'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': contract ? undefined : maxSpotCost,
                },
            },
            'info': market,
        });
    }

    /**
     * @method
     * @name okcoin#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        if (!this.checkRequiredCredentials (false)) {
            if (this.options['warnOnFetchCurrenciesWithoutAuthorization']) {
                throw new ExchangeError (this.id + ' fetchCurrencies() is a private API endpoint that requires authentication with API keys. Set the API keys on the exchange instance or exchange.options["warnOnFetchCurrenciesWithoutAuthorization"] = false to suppress this warning message.');
            }
            return {};
        } else {
            const response = await this.privateGetAssetCurrencies (params);
            const data = this.safeList (response, 'data', []);
            const result: Dict = {};
            const dataByCurrencyId = this.groupBy (data, 'ccy');
            const currencyIds = Object.keys (dataByCurrencyId);
            for (let i = 0; i < currencyIds.length; i++) {
                const currencyId = currencyIds[i];
                const code = this.safeCurrencyCode (currencyId);
                const chains = dataByCurrencyId[currencyId];
                const networks: Dict = {};
                for (let j = 0; j < chains.length; j++) {
                    const chain = chains[j];
                    const networkId = this.safeString (chain, 'chain');
                    if ((networkId !== undefined) && (networkId.indexOf ('-') >= 0)) {
                        const parts = networkId.split ('-');
                        const chainPart = this.safeString (parts, 1, networkId);
                        const networkCode = this.networkIdToCode (chainPart);
                        networks[networkCode] = {
                            'id': networkId,
                            'network': networkCode,
                            'active': undefined,
                            'deposit': this.safeBool (chain, 'canDep'),
                            'withdraw': this.safeBool (chain, 'canWd'),
                            'fee': this.safeNumber (chain, 'minFee'),
                            'precision': this.parseNumber (this.parsePrecision (this.safeString (chain, 'wdTickSz'))),
                            'limits': {
                                'withdraw': {
                                    'min': this.safeNumber (chain, 'minWd'),
                                    'max': this.safeNumber (chain, 'maxWd'),
                                },
                            },
                            'info': chain,
                        };
                    }
                }
                const firstChain = this.safeValue (chains, 0);
                result[code] = this.safeCurrencyStructure ({
                    'info': chains,
                    'code': code,
                    'id': currencyId,
                    'name': this.safeString (firstChain, 'name'),
                    'active': undefined,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': undefined,
                    'precision': undefined,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'networks': networks,
                });
            }
            return result;
        }
    }

    /**
     * @method
     * @name okcoin#fetchOrderBook
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-order-book
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
        };
        limit = (limit === undefined) ? 20 : limit;
        if (limit !== undefined) {
            request['sz'] = limit; // max 400
        }
        const response = await this.publicGetMarketBooks (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "asks": [
        //                     ["0.07228","4.211619","0","2"], // price, amount, liquidated orders, total open orders
        //                     ["0.0723","299.880364","0","2"],
        //                     ["0.07231","3.72832","0","1"],
        //                 ],
        //                 "bids": [
        //                     ["0.07221","18.5","0","1"],
        //                     ["0.0722","18.5","0","1"],
        //                     ["0.07219","0.505407","0","1"],
        //                 ],
        //                 "ts": "1621438475342"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        const timestamp = this.safeInteger (first, 'ts');
        return this.parseOrderBook (first, symbol, timestamp);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "instType": "SPOT",
        //         "instId": "ETH-BTC",
        //         "last": "0.07319",
        //         "lastSz": "0.044378",
        //         "askPx": "0.07322",
        //         "askSz": "4.2",
        //         "bidPx": "0.0732",
        //         "bidSz": "6.050058",
        //         "open24h": "0.07801",
        //         "high24h": "0.07975",
        //         "low24h": "0.06019",
        //         "volCcy24h": "11788.887619",
        //         "vol24h": "167493.829229",
        //         "ts": "1621440583784",
        //         "sodUtc0": "0.07872",
        //         "sodUtc8": "0.07345"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'ts');
        const marketId = this.safeString (ticker, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last');
        const open = this.safeString (ticker, 'open24h');
        const spot = this.safeBool (market, 'spot', false);
        const quoteVolume = spot ? this.safeString (ticker, 'volCcy24h') : undefined;
        const baseVolume = this.safeString (ticker, 'vol24h');
        const high = this.safeString (ticker, 'high24h');
        const low = this.safeString (ticker, 'low24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
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
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name okcoin#fetchTicker
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-ticker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "ETH-BTC",
        //                 "last": "0.07319",
        //                 "lastSz": "0.044378",
        //                 "askPx": "0.07322",
        //                 "askSz": "4.2",
        //                 "bidPx": "0.0732",
        //                 "bidSz": "6.050058",
        //                 "open24h": "0.07801",
        //                 "high24h": "0.07975",
        //                 "low24h": "0.06019",
        //                 "volCcy24h": "11788.887619",
        //                 "vol24h": "167493.829229",
        //                 "ts": "1621440583784",
        //                 "sodUtc0": "0.07872",
        //                 "sodUtc8": "0.07345"
        //             }
        //         ]
        //     }
        //
        return this.parseTicker (first, market);
    }

    /**
     * @method
     * @name okcoin#fetchTickers
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-tickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        symbols = this.marketSymbols (symbols);
        const request: Dict = {
            'instType': 'SPOT',
        };
        const response = await this.publicGetMarketTickers (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseTickers (data, symbols, params);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public fetchTrades
        //
        //     {
        //         "instId": "ETH-BTC",
        //         "side": "sell",
        //         "sz": "0.119501",
        //         "px": "0.07065",
        //         "tradeId": "15826757",
        //         "ts": "1621446178316"
        //     }
        //
        // private fetchMyTrades
        //
        //     {
        //         "side": "buy",
        //         "fillSz": "0.007533",
        //         "fillPx": "2654.98",
        //         "fee": "-0.000007533",
        //         "ordId": "317321390244397056",
        //         "instType": "SPOT",
        //         "instId": "ETH-USDT",
        //         "clOrdId": "",
        //         "posSide": "net",
        //         "billId": "317321390265368576",
        //         "tag": "0",
        //         "execType": "T",
        //         "tradeId": "107601752",
        //         "feeCcy": "ETH",
        //         "ts": "1621927314985"
        //     }
        //
        const id = this.safeString (trade, 'tradeId');
        const marketId = this.safeString (trade, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'ts');
        const price = this.safeString2 (trade, 'fillPx', 'px');
        const amount = this.safeString2 (trade, 'fillSz', 'sz');
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'ordId');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCostSigned = Precise.stringNeg (feeCostString);
            const feeCurrencyId = this.safeString (trade, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostSigned,
                'currency': feeCurrencyCode,
            };
        }
        let takerOrMaker = this.safeString (trade, 'execType');
        if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        } else if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        }
        return this.safeTrade ({
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
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name okcoin#fetchTrades
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-trades
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-trades-history
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if ((limit === undefined) || (limit > 100)) {
            limit = 100; // maximum = default = 100
        }
        const request: Dict = {
            'instId': market['id'],
        };
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'method', 'publicGetMarketTrades');
        let response = undefined;
        if (method === 'publicGetMarketTrades') {
            response = await this.publicGetMarketTrades (this.extend (request, params));
        } else {
            response = await this.publicGetMarketHistoryTrades (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         "1678928760000", // timestamp
        //         "24341.4", // open
        //         "24344", // high
        //         "24313.2", // low
        //         "24323", // close
        //         "628", // contract volume
        //         "2.5819", // base volume
        //         "62800", // quote volume
        //         "0" // candlestick state
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

    /**
     * @method
     * @name okcoin#fetchOHLCV
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-candlesticks
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const duration = this.parseTimeframe (timeframe);
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        let bar = this.safeString (this.timeframes, timeframe, timeframe);
        const timezone = this.safeString (options, 'timezone', 'UTC');
        if ((timezone === 'UTC') && (duration >= 21600)) { // if utc and timeframe >= 6h
            bar += timezone.toLowerCase ();
        }
        const request: Dict = {
            'instId': market['id'],
            'bar': bar,
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'method', 'publicGetMarketCandles');
        let response = undefined;
        if (method === 'publicGetMarketCandles') {
            response = await this.publicGetMarketCandles (this.extend (request, params));
        } else {
            response = await this.publicGetMarketHistoryCandles (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseAccountBalance (response) {
        //
        // account
        //
        //     [
        //         {
        //             "balance":  0,
        //             "available":  0,
        //             "currency": "BTC",
        //             "hold":  0
        //         },
        //         {
        //             "balance":  0,
        //             "available":  0,
        //             "currency": "ETH",
        //             "hold":  0
        //         }
        //     ]
        //
        // spot
        //
        //     [
        //         {
        //             "frozen": "0",
        //             "hold": "0",
        //             "id": "2149632",
        //             "currency": "BTC",
        //             "balance": "0.0000000497717339",
        //             "available": "0.0000000497717339",
        //             "holds": "0"
        //         },
        //         {
        //             "frozen": "0",
        //             "hold": "0",
        //             "id": "2149632",
        //             "currency": "ICN",
        //             "balance": "0.00000000925",
        //             "available": "0.00000000925",
        //             "holds": "0"
        //         }
        //     ]
        //
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'hold');
            account['free'] = this.safeString (balance, 'available');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name okcoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const request: Dict = {
            // 'ccy': 'BTC,ETH', // comma-separated list of currency ids
        };
        let response = undefined;
        if (marketType === 'funding') {
            response = await this.privateGetAssetBalances (this.extend (request, query));
        } else {
            response = await this.privateGetAccountBalance (this.extend (request, query));
        }
        //
        //  {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "category": "1",
        //                 "delivery": "",
        //                 "exercise": "",
        //                 "instType": "SPOT",
        //                 "level": "Lv1",
        //                 "maker": "-0.0008",
        //                 "taker": "-0.001",
        //                 "ts": "1639043138472"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        if (marketType === 'funding') {
            return this.parseFundingBalance (response);
        } else {
            return this.parseTradingBalance (response);
        }
    }

    parseTradingBalance (response) {
        const result: Dict = { 'info': response };
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
            if ((eq === undefined) || (availEq === undefined)) {
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
        return this.safeBalance (result);
    }

    parseFundingBalance (response) {
        const result: Dict = { 'info': response };
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
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name okcoin#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketBuyOrderWithCost (symbol: string, cost: number, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        params['tgtCcy'] = 'quote_ccy';
        return await this.createOrder (symbol, 'market', 'buy', cost, undefined, params);
    }

    /**
     * @method
     * @name okcoin#createOrder
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-algo-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-multiple-orders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-advance-algo-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.reduceOnly] MARGIN orders only, or swap/future orders in net mode
     * @param {bool} [params.postOnly] true to place a post only order
     * @param {float} [params.triggerPrice] conditional orders only, the price at which the order is to be triggered
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] used for take profit limit orders, not used for take profit market price orders
     * @param {string} [params.takeProfit.type] 'market' or 'limit' used to specify the take profit price type
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] used for stop loss limit orders, not used for stop loss market price orders
     * @param {string} [params.stopLoss.type] 'market' or 'limit' used to specify the stop loss price type
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let method = this.safeString (this.options, 'createOrder', 'privatePostTradeBatchOrders');
        const requestOrdType = this.safeString (request, 'ordType');
        if ((requestOrdType === 'trigger') || (requestOrdType === 'conditional') || (type === 'oco') || (type === 'move_order_stop') || (type === 'iceberg') || (type === 'twap')) {
            method = 'privatePostTradeOrderAlgo';
        }
        if (method === 'privatePostTradeBatchOrders') {
            // keep the request body the same
            // submit a single order in an array to the batch order endpoint
            // because it has a lower ratelimit
            request = [ request ];
        }
        let response = undefined;
        if (method === 'privatePostTradeOrder') {
            response = await this.privatePostTradeOrder (request);
        } else if (method === 'privatePostTradeOrderAlgo') {
            response = await this.privatePostTradeOrderAlgo (request);
        } else if (method === 'privatePostTradeBatchOrders') {
            response = await this.privatePostTradeBatchOrders (request);
        } else {
            throw new ExchangeError (this.id + ' createOrder() this.options["createOrder"] must be either privatePostTradeBatchOrders or privatePostTradeOrder or privatePostTradeOrderAlgo');
        }
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0);
        const order = this.parseOrder (first, market);
        order['type'] = type;
        order['side'] = side;
        return order;
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            // 'ccy': currency['id'], // only applicable to cross MARGIN orders in single-currency margin
            // 'clOrdId': clientOrderId, // up to 32 characters, must be unique
            // 'tag': tag, // up to 8 characters
            'side': side,
            // 'posSide': 'long', // long, short, // required in the long/short mode, and can only be long or short (only for future or swap)
            'ordType': type,
            // 'ordType': type, // privatePostTradeOrder: market, limit, post_only, fok, ioc, optimal_limit_ioc
            // 'ordType': type, // privatePostTradeOrderAlgo: conditional, oco, trigger, move_order_stop, iceberg, twap
            // 'sz': this.amountToPrecision (symbol, amount),
            // 'px': this.priceToPrecision (symbol, price), // limit orders only
            // 'reduceOnly': false,
            //
            // 'triggerPx': 10, // stopPrice (trigger orders)
            // 'orderPx': 10, // Order price if -1, the order will be executed at the market price. (trigger orders)
            // 'triggerPxType': 'last', // Conditional default is last, mark or index (trigger orders)
            //
            // 'tpTriggerPx': 10, // takeProfitPrice (conditional orders)
            // 'tpTriggerPxType': 'last', // Conditional default is last, mark or index (conditional orders)
            // 'tpOrdPx': 10, // Order price for Take-Profit orders, if -1 will be executed at market price (conditional orders)
            //
            // 'slTriggerPx': 10, // stopLossPrice (conditional orders)
            // 'slTriggerPxType': 'last', // Conditional default is last, mark or index (conditional orders)
            // 'slOrdPx': 10, // Order price for Stop-Loss orders, if -1 will be executed at market price (conditional orders)
        };
        const triggerPrice = this.safeValueN (params, [ 'triggerPrice', 'stopPrice', 'triggerPx' ]);
        const timeInForce = this.safeString (params, 'timeInForce', 'GTC');
        const takeProfitPrice = this.safeValue2 (params, 'takeProfitPrice', 'tpTriggerPx');
        const tpOrdPx = this.safeValue (params, 'tpOrdPx', price);
        const tpTriggerPxType = this.safeString (params, 'tpTriggerPxType', 'last');
        const stopLossPrice = this.safeValue2 (params, 'stopLossPrice', 'slTriggerPx');
        const slOrdPx = this.safeValue (params, 'slOrdPx', price);
        const slTriggerPxType = this.safeString (params, 'slTriggerPxType', 'last');
        const clientOrderId = this.safeString2 (params, 'clOrdId', 'clientOrderId');
        const stopLoss = this.safeValue (params, 'stopLoss');
        const stopLossDefined = (stopLoss !== undefined);
        const takeProfit = this.safeValue (params, 'takeProfit');
        const takeProfitDefined = (takeProfit !== undefined);
        const defaultMarginMode = this.safeString2 (this.options, 'defaultMarginMode', 'marginMode', 'cross');
        let marginMode = this.safeString2 (params, 'marginMode', 'tdMode'); // cross or isolated, tdMode not ommited so as to be extended into the request
        let margin = false;
        if ((marginMode !== undefined) && (marginMode !== 'cash')) {
            margin = true;
        } else {
            marginMode = defaultMarginMode;
            margin = this.safeBool (params, 'margin', false);
        }
        if (margin) {
            const defaultCurrency = (side === 'buy') ? market['quote'] : market['base'];
            const currency = this.safeString (params, 'ccy', defaultCurrency);
            request['ccy'] = this.safeCurrencyCode (currency);
        }
        const tradeMode = margin ? marginMode : 'cash';
        request['tdMode'] = tradeMode;
        const isMarketOrder = type === 'market';
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, type === 'post_only', params);
        params = this.omit (params, [ 'currency', 'ccy', 'marginMode', 'timeInForce', 'stopPrice', 'triggerPrice', 'clientOrderId', 'stopLossPrice', 'takeProfitPrice', 'slOrdPx', 'tpOrdPx', 'margin', 'stopLoss', 'takeProfit' ]);
        const ioc = (timeInForce === 'IOC') || (type === 'ioc');
        const fok = (timeInForce === 'FOK') || (type === 'fok');
        const trigger = (triggerPrice !== undefined) || (type === 'trigger');
        const conditional = (stopLossPrice !== undefined) || (takeProfitPrice !== undefined) || (type === 'conditional');
        const marketIOC = (isMarketOrder && ioc) || (type === 'optimal_limit_ioc');
        const defaultTgtCcy = this.safeString (this.options, 'tgtCcy', 'base_ccy');
        const tgtCcy = this.safeString (params, 'tgtCcy', defaultTgtCcy);
        if ((!margin)) {
            request['tgtCcy'] = tgtCcy;
        }
        if (isMarketOrder || marketIOC) {
            request['ordType'] = 'market';
            if (side === 'buy') {
                // spot market buy: "sz" can refer either to base currency units or to quote currency units
                // see documentation: https://www.okx.com/docs-v5/en/#rest-api-trade-place-order
                if (tgtCcy === 'quote_ccy') {
                    // quote_ccy: sz refers to units of quote currency
                    let quoteAmount = undefined;
                    let createMarketBuyOrderRequiresPrice = true;
                    [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                    const cost = this.safeNumber2 (params, 'cost', 'sz');
                    params = this.omit (params, [ 'cost', 'sz' ]);
                    if (cost !== undefined) {
                        quoteAmount = this.costToPrecision (symbol, cost);
                    } else if (createMarketBuyOrderRequiresPrice) {
                        if (price === undefined) {
                            throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument');
                        } else {
                            const amountString = this.numberToString (amount);
                            const priceString = this.numberToString (price);
                            const costRequest = Precise.stringMul (amountString, priceString);
                            quoteAmount = this.costToPrecision (symbol, costRequest);
                        }
                    } else {
                        quoteAmount = this.costToPrecision (symbol, amount);
                    }
                    request['sz'] = quoteAmount;
                } else {
                    request['sz'] = this.amountToPrecision (symbol, amount);
                }
            } else {
                request['sz'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            request['sz'] = this.amountToPrecision (symbol, amount);
            if ((!trigger) && (!conditional)) {
                request['px'] = this.priceToPrecision (symbol, price);
            }
        }
        if (postOnly) {
            request['ordType'] = 'post_only';
        } else if (ioc && !marketIOC) {
            request['ordType'] = 'ioc';
        } else if (fok) {
            request['ordType'] = 'fok';
        } else if (stopLossDefined || takeProfitDefined) {
            if (stopLossDefined) {
                const stopLossTriggerPrice = this.safeValueN (stopLoss, [ 'triggerPrice', 'stopPrice', 'slTriggerPx' ]);
                if (stopLossTriggerPrice === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires a trigger price in params["stopLoss"]["triggerPrice"] for a stop loss order');
                }
                request['slTriggerPx'] = this.priceToPrecision (symbol, stopLossTriggerPrice);
                const stopLossLimitPrice = this.safeValueN (stopLoss, [ 'price', 'stopLossPrice', 'slOrdPx' ]);
                const stopLossOrderType = this.safeString (stopLoss, 'type');
                if (stopLossOrderType !== undefined) {
                    const stopLossLimitOrderType = (stopLossOrderType === 'limit');
                    const stopLossMarketOrderType = (stopLossOrderType === 'market');
                    if ((!stopLossLimitOrderType) && (!stopLossMarketOrderType)) {
                        throw new InvalidOrder (this.id + ' createOrder() params["stopLoss"]["type"] must be either "limit" or "market"');
                    } else if (stopLossLimitOrderType) {
                        if (stopLossLimitPrice === undefined) {
                            throw new InvalidOrder (this.id + ' createOrder() requires a limit price in params["stopLoss"]["price"] for a stop loss limit order');
                        } else {
                            request['slOrdPx'] = this.priceToPrecision (symbol, stopLossLimitPrice);
                        }
                    } else if (stopLossOrderType === 'market') {
                        request['slOrdPx'] = '-1';
                    }
                } else if (stopLossLimitPrice !== undefined) {
                    request['slOrdPx'] = this.priceToPrecision (symbol, stopLossLimitPrice); // limit sl order
                } else {
                    request['slOrdPx'] = '-1'; // market sl order
                }
                const stopLossTriggerPriceType = this.safeString2 (stopLoss, 'triggerPriceType', 'slTriggerPxType', 'last');
                if (stopLossTriggerPriceType !== undefined) {
                    if ((stopLossTriggerPriceType !== 'last') && (stopLossTriggerPriceType !== 'index') && (stopLossTriggerPriceType !== 'mark')) {
                        throw new InvalidOrder (this.id + ' createOrder() stop loss trigger price type must be one of "last", "index" or "mark"');
                    }
                    request['slTriggerPxType'] = stopLossTriggerPriceType;
                }
            }
            if (takeProfitDefined) {
                const takeProfitTriggerPrice = this.safeValueN (takeProfit, [ 'triggerPrice', 'stopPrice', 'tpTriggerPx' ]);
                if (takeProfitTriggerPrice === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires a trigger price in params["takeProfit"]["triggerPrice"], or params["takeProfit"]["stopPrice"], or params["takeProfit"]["tpTriggerPx"] for a take profit order');
                }
                request['tpTriggerPx'] = this.priceToPrecision (symbol, takeProfitTriggerPrice);
                const takeProfitLimitPrice = this.safeValueN (takeProfit, [ 'price', 'takeProfitPrice', 'tpOrdPx' ]);
                const takeProfitOrderType = this.safeString (takeProfit, 'type');
                if (takeProfitOrderType !== undefined) {
                    const takeProfitLimitOrderType = (takeProfitOrderType === 'limit');
                    const takeProfitMarketOrderType = (takeProfitOrderType === 'market');
                    if ((!takeProfitLimitOrderType) && (!takeProfitMarketOrderType)) {
                        throw new InvalidOrder (this.id + ' createOrder() params["takeProfit"]["type"] must be either "limit" or "market"');
                    } else if (takeProfitLimitOrderType) {
                        if (takeProfitLimitPrice === undefined) {
                            throw new InvalidOrder (this.id + ' createOrder() requires a limit price in params["takeProfit"]["price"] or params["takeProfit"]["tpOrdPx"] for a take profit limit order');
                        } else {
                            request['tpOrdPx'] = this.priceToPrecision (symbol, takeProfitLimitPrice);
                        }
                    } else if (takeProfitOrderType === 'market') {
                        request['tpOrdPx'] = '-1';
                    }
                } else if (takeProfitLimitPrice !== undefined) {
                    request['tpOrdPx'] = this.priceToPrecision (symbol, takeProfitLimitPrice); // limit tp order
                } else {
                    request['tpOrdPx'] = '-1'; // market tp order
                }
                const takeProfitTriggerPriceType = this.safeString2 (takeProfit, 'triggerPriceType', 'tpTriggerPxType', 'last');
                if (takeProfitTriggerPriceType !== undefined) {
                    if ((takeProfitTriggerPriceType !== 'last') && (takeProfitTriggerPriceType !== 'index') && (takeProfitTriggerPriceType !== 'mark')) {
                        throw new InvalidOrder (this.id + ' createOrder() take profit trigger price type must be one of "last", "index" or "mark"');
                    }
                    request['tpTriggerPxType'] = takeProfitTriggerPriceType;
                }
            }
        } else if (trigger) {
            request['ordType'] = 'trigger';
            request['triggerPx'] = this.priceToPrecision (symbol, triggerPrice);
            request['orderPx'] = isMarketOrder ? '-1' : this.priceToPrecision (symbol, price);
        } else if (conditional) {
            request['ordType'] = 'conditional';
            const twoWayCondition = ((takeProfitPrice !== undefined) && (stopLossPrice !== undefined));
            // if TP and SL are sent together
            // as ordType 'conditional' only stop-loss order will be applied
            if (twoWayCondition) {
                request['ordType'] = 'oco';
            }
            if (takeProfitPrice !== undefined) {
                request['tpTriggerPx'] = this.priceToPrecision (symbol, takeProfitPrice);
                request['tpOrdPx'] = (tpOrdPx === undefined) ? '-1' : this.priceToPrecision (symbol, tpOrdPx);
                request['tpTriggerPxType'] = tpTriggerPxType;
            }
            if (stopLossPrice !== undefined) {
                request['slTriggerPx'] = this.priceToPrecision (symbol, stopLossPrice);
                request['slOrdPx'] = (slOrdPx === undefined) ? '-1' : this.priceToPrecision (symbol, slOrdPx);
                request['slTriggerPxType'] = slTriggerPxType;
            }
        }
        if (clientOrderId === undefined) {
            const brokerId = this.safeString (this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['clOrdId'] = brokerId + this.uuid16 ();
                request['tag'] = brokerId;
            }
        } else {
            request['clOrdId'] = clientOrderId;
            params = this.omit (params, [ 'clOrdId', 'clientOrderId' ]);
        }
        return this.extend (request, params);
    }

    /**
     * @method
     * @name okcoin#cancelOrder
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-algo-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-advance-algo-order
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if cancel trigger or conditional orders
     * @param {bool} [params.advanced] True if canceling advanced orders only
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const trigger = this.safeValue2 (params, 'stop', 'trigger');
        const advanced = this.safeValue (params, 'advanced');
        if (trigger || advanced) {
            const orderInner = await this.cancelOrders ([ id ], symbol, params);
            return this.safeDict (orderInner, 0) as Order;
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            // 'ordId': id, // either ordId or clOrdId is required
            // 'clOrdId': clientOrderId,
        };
        const clientOrderId = this.safeString2 (params, 'clOrdId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
        } else {
            request['ordId'] = id.toString ();
        }
        const query = this.omit (params, [ 'clOrdId', 'clientOrderId' ]);
        const response = await this.privatePostTradeCancelOrder (this.extend (request, query));
        // {"code":"0","data":[{"clOrdId":"","ordId":"317251910906576896","sCode":"0","sMsg":""}],"msg":""}
        const data = this.safeValue (response, 'data', []);
        const order = this.safeDict (data, 0);
        return this.parseOrder (order, market);
    }

    parseIds (ids) {
        /**
         * @ignore
         * @method
         * @name okx#parseIds
         * @param {string[]|string} ids order ids
         * @returns {string[]} list of order ids
         */
        if (typeof ids === 'string') {
            return ids.split (',');
        } else {
            return ids;
        }
    }

    /**
     * @method
     * @name okcoin#cancelOrders
     * @description cancel multiple orders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-multiple-orders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-algo-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-advance-algo-order
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const trigger = this.safeValue2 (params, 'stop', 'trigger');
        const advanced = this.safeValue (params, 'advanced');
        params = this.omit (params, [ 'stop', 'trigger', 'advanced' ]);
        const market = this.market (symbol);
        const request = [];
        const clientOrderIds = this.parseIds (this.safeValue2 (params, 'clOrdId', 'clientOrderId'));
        const algoIds = this.parseIds (this.safeValue (params, 'algoId'));
        if (clientOrderIds === undefined) {
            ids = this.parseIds (ids);
            if (algoIds !== undefined) {
                for (let i = 0; i < algoIds.length; i++) {
                    request.push ({
                        'algoId': algoIds[i],
                        'instId': market['id'],
                    });
                }
            }
            for (let i = 0; i < ids.length; i++) {
                if (trigger || advanced) {
                    request.push ({
                        'algoId': ids[i],
                        'instId': market['id'],
                    });
                } else {
                    request.push ({
                        'ordId': ids[i],
                        'instId': market['id'],
                    });
                }
            }
        } else {
            for (let i = 0; i < clientOrderIds.length; i++) {
                request.push ({
                    'instId': market['id'],
                    'clOrdId': clientOrderIds[i],
                });
            }
        }
        let response = undefined;
        if (trigger) {
            response = await this.privatePostTradeCancelAlgos (request);
        } else if (advanced) {
            response = await this.privatePostTradeCancelAdvanceAlgos (request);
        } else {
            response = await this.privatePostTradeCancelBatchOrders (request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        }
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "clOrdId": "e123456789ec4dBC1123456ba123b45e",
        //                 "ordId": "405071912345641543",
        //                 "sCode": "0",
        //                 "sMsg": ""
        //             },
        //             ...
        //         ],
        //         "msg": ""
        //     }
        //
        //
        const ordersData = this.safeList (response, 'data', []);
        return this.parseOrders (ordersData, market, undefined, undefined, params);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'canceled': 'canceled',
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'effective': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
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
        // editOrder
        //
        //     {
        //         "clOrdId": "e847386590ce4dBCc1a045253497a547",
        //         "ordId": "559176536793178112",
        //         "reqId": "",
        //         "sCode": "0",
        //         "sMsg": ""
        //     }
        //
        // Spot and Swap fetchOrder, fetchOpenOrders
        //
        //     {
        //         "accFillSz": "0",
        //         "avgPx": "",
        //         "cTime": "1621910749815",
        //         "category": "normal",
        //         "ccy": "",
        //         "clOrdId": "",
        //         "fee": "0",
        //         "feeCcy": "ETH",
        //         "fillPx": "",
        //         "fillSz": "0",
        //         "fillTime": "",
        //         "instId": "ETH-USDT",
        //         "instType": "SPOT",
        //         "lever": "",
        //         "ordId": "317251910906576896",
        //         "ordType": "limit",
        //         "pnl": "0",
        //         "posSide": "net",
        //         "px": "2000",
        //         "rebate": "0",
        //         "rebateCcy": "USDT",
        //         "side": "buy",
        //         "slOrdPx": "",
        //         "slTriggerPx": "",
        //         "state": "live",
        //         "sz": "0.001",
        //         "tag": "",
        //         "tdMode": "cash",
        //         "tpOrdPx": "",
        //         "tpTriggerPx": "",
        //         "tradeId": "",
        //         "uTime": "1621910749815"
        //     }
        //
        // Algo Order fetchOpenOrders, fetchCanceledOrders, fetchClosedOrders
        //
        //     {
        //         "activePx": "",
        //         "activePxType": "",
        //         "actualPx": "",
        //         "actualSide": "buy",
        //         "actualSz": "0",
        //         "algoId": "431375349042380800",
        //         "cTime": "1649119897778",
        //         "callbackRatio": "",
        //         "callbackSpread": "",
        //         "ccy": "",
        //         "ctVal": "0.01",
        //         "instId": "BTC-USDT-SWAP",
        //         "instType": "SWAP",
        //         "last": "46538.9",
        //         "lever": "125",
        //         "moveTriggerPx": "",
        //         "notionalUsd": "467.059",
        //         "ordId": "",
        //         "ordPx": "50000",
        //         "ordType": "trigger",
        //         "posSide": "long",
        //         "pxLimit": "",
        //         "pxSpread": "",
        //         "pxVar": "",
        //         "side": "buy",
        //         "slOrdPx": "",
        //         "slTriggerPx": "",
        //         "slTriggerPxType": "",
        //         "state": "live",
        //         "sz": "1",
        //         "szLimit": "",
        //         "tag": "",
        //         "tdMode": "isolated",
        //         "tgtCcy": "",
        //         "timeInterval": "",
        //         "tpOrdPx": "",
        //         "tpTriggerPx": "",
        //         "tpTriggerPxType": "",
        //         "triggerPx": "50000",
        //         "triggerPxType": "last",
        //         "triggerTime": "",
        //         "uly": "BTC-USDT"
        //     }
        //
        const id = this.safeString2 (order, 'algoId', 'ordId');
        const timestamp = this.safeInteger (order, 'cTime');
        const lastUpdateTimestamp = this.safeInteger (order, 'uTime');
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
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market, '-');
        const filled = this.safeString (order, 'accFillSz');
        const price = this.safeString2 (order, 'px', 'ordPx');
        const average = this.safeString (order, 'avgPx');
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const feeCostString = this.safeString (order, 'fee');
        let amount = undefined;
        let cost = undefined;
        // spot market buy: "sz" can refer either to base currency units or to quote currency units
        // see documentation: https://www.okx.com/docs-v5/en/#rest-api-trade-place-order
        const defaultTgtCcy = this.safeString (this.options, 'tgtCcy', 'base_ccy');
        const tgtCcy = this.safeString (order, 'tgtCcy', defaultTgtCcy);
        if ((side === 'buy') && (type === 'market') && (tgtCcy === 'quote_ccy')) {
            // "sz" refers to the cost
            cost = this.safeString (order, 'sz');
        } else {
            // "sz" refers to the trade currency amount
            amount = this.safeString (order, 'sz');
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
        const stopLossPrice = this.safeNumber2 (order, 'slTriggerPx', 'slOrdPx');
        const takeProfitPrice = this.safeNumber2 (order, 'tpTriggerPx', 'tpOrdPx');
        const reduceOnlyRaw = this.safeString (order, 'reduceOnly');
        let reduceOnly = false;
        if (reduceOnly !== undefined) {
            reduceOnly = (reduceOnlyRaw === 'true');
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'triggerPrice': this.safeNumberN (order, [ 'triggerPx', 'moveTriggerPx' ]),
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
            'reduceOnly': reduceOnly,
        }, market);
    }

    /**
     * @method
     * @name okcoin#fetchOrder
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-details
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-algo-order-list
     * @description fetches information on an order made by the user
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instId': market['id'],
            // 'clOrdId': 'abcdef12345', // optional, [a-z0-9]{1,32}
            // 'ordId': id,
        };
        const clientOrderId = this.safeString2 (params, 'clOrdId', 'clientOrderId');
        const trigger = this.safeValue2 (params, 'stop', 'trigger');
        if (trigger) {
            if (clientOrderId !== undefined) {
                request['algoClOrdId'] = clientOrderId;
            } else {
                request['algoId'] = id;
            }
        } else {
            if (clientOrderId !== undefined) {
                request['clOrdId'] = clientOrderId;
            } else {
                request['ordId'] = id;
            }
        }
        const query = this.omit (params, [ 'clientOrderId', 'stop', 'trigger' ]);
        let response = undefined;
        if (trigger) {
            response = await this.privateGetTradeOrderAlgo (this.extend (request, query));
        } else {
            response = await this.privateGetTradeOrder (this.extend (request, query));
        }
        const data = this.safeValue (response, 'data', []);
        const order = this.safeDict (data, 0);
        return this.parseOrder (order);
    }

    /**
     * @method
     * @name okcoin#fetchOpenOrders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-list
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-algo-order-list
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if fetching trigger or conditional orders
     * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {
            // 'instId': market['id'],
            // 'ordType': 'limit', // market, limit, post_only, fok, ioc, comma-separated, stop orders: conditional, oco, trigger, move_order_stop, iceberg, or twap
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
        const ordType = this.safeString (params, 'ordType');
        const trigger = this.safeValue (params, 'stop') || (this.safeString (params, 'ordType') !== undefined);
        if (trigger && (ordType === undefined)) {
            request['ordType'] = 'trigger'; // default to trigger
        }
        params = this.omit (params, [ 'stop' ]);
        let response = undefined;
        if (trigger) {
            response = await this.privateGetTradeOrdersAlgoPending (this.extend (request, params));
        } else {
            response = await this.privateGetTradeOrdersPending (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name okcoin#fetchClosedOrders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-algo-order-history
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-history-last-3-months
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-history-last-7-days
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if fetching trigger or conditional orders
     * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {
            'instType': 'SPOT',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        const ordType = this.safeString (params, 'ordType');
        const trigger = this.safeValue (params, 'stop') || (this.safeString (params, 'ordType') !== undefined);
        if (trigger && (ordType === undefined)) {
            request['ordType'] = 'trigger'; // default to trigger
        }
        params = this.omit (params, [ 'stop' ]);
        let response = undefined;
        if (trigger) {
            response = await this.privateGetTradeOrdersAlgoHistory (this.extend (request, params));
        } else {
            let method = undefined;
            [ method, params ] = this.handleOptionAndParams (params, 'fetchClosedOrders', 'method', 'privateGetTradeOrdersHistory');
            if (method === 'privateGetTradeOrdersHistory') {
                response = await this.privateGetTradeOrdersHistory (this.extend (request, params));
            } else {
                response = await this.privateGetTradeOrdersHistoryArchive (this.extend (request, params));
            }
        }
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accFillSz": "0",
        //                 "avgPx": "",
        //                 "cTime": "1621910749815",
        //                 "category": "normal",
        //                 "ccy": "",
        //                 "clOrdId": "",
        //                 "fee": "0",
        //                 "feeCcy": "ETH",
        //                 "fillPx": "",
        //                 "fillSz": "0",
        //                 "fillTime": "",
        //                 "instId": "ETH-USDT",
        //                 "instType": "SPOT",
        //                 "lever": "",
        //                 "ordId": "317251910906576896",
        //                 "ordType": "limit",
        //                 "pnl": "0",
        //                 "posSide": "net",
        //                 "px":"20 00",
        //                 "rebate": "0",
        //                 "rebateCcy": "USDT",
        //                 "side": "buy",
        //                 "slOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "state": "live",
        //                 "sz":"0. 001",
        //                 "tag": "",
        //                 "tdMode": "cash",
        //                 "tpOrdPx": "",
        //                 "tpTriggerPx": "",
        //                 "tradeId": "",
        //                 "uTime": "1621910749815"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined): DepositAddress {
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
        //     {
        //        "chain": "ETH-OKExChain",
        //        "addrEx": { "comment": "6040348" }, // some currencies like TON may have this field,
        //        "ctAddr": "72315c",
        //        "ccy": "ETH",
        //        "to": "6",
        //        "addr": "0x1c9f2244d1ccaa060bd536827c18925db10db102",
        //        "selected": true
        //     }
        //
        const address = this.safeString (depositAddress, 'addr');
        let tag = this.safeStringN (depositAddress, [ 'tag', 'pmtId', 'memo' ]);
        if (tag === undefined) {
            const addrEx = this.safeValue (depositAddress, 'addrEx', {});
            tag = this.safeString (addrEx, 'comment');
        }
        const currencyId = this.safeString (depositAddress, 'ccy');
        currency = this.safeCurrency (currencyId, currency);
        const code = currency['code'];
        const chain = this.safeString (depositAddress, 'chain');
        const networkId = chain.replace (currencyId + '-', '');
        const network = this.networkIdToCode (networkId);
        // inconsistent naming responses from exchange
        // with respect to network naming provided in currency info vs address chain-names and ids
        //
        // response from address endpoint:
        //      {
        //          "chain": "USDT-Polygon",
        //          "ctAddr": "",
        //          "ccy": "USDT",
        //          "to":"6" ,
        //          "addr": "0x1903441e386cc49d937f6302955b5feb4286dcfa",
        //          "selected": true
        //      }
        // network information from currency['networks'] field:
        // Polygon: {
        //        "info": {
        //            "canDep": false,
        //            "canInternal": false,
        //            "canWd": false,
        //            "ccy": "USDT",
        //            "chain": "USDT-Polygon-Bridge",
        //            "mainNet": false,
        //            "maxFee": "26.879528",
        //            "minFee": "13.439764",
        //            "minWd": "0.001",
        //            "name": ''
        //        },
        //        "id": "USDT-Polygon-Bridge",
        //        "network": "Polygon",
        //        "active": false,
        //        "deposit": false,
        //        "withdraw": false,
        //        "fee": 13.439764,
        //        "precision": undefined,
        //        "limits": {
        //            "withdraw": {
        //                "min": 0.001,
        //                "max": undefined
        //            }
        //        }
        //     },
        //
        this.checkAddress (address);
        return {
            'info': depositAddress,
            'currency': code,
            'network': network,
            'address': address,
            'tag': tag,
        } as DepositAddress;
    }

    /**
     * @method
     * @name okcoin#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const defaultNetwork = this.safeString (this.options, 'defaultNetwork', 'ERC20');
        const networkId = this.safeString (params, 'network', defaultNetwork);
        const networkCode = this.networkIdToCode (networkId);
        params = this.omit (params, 'network');
        const response = await this.fetchDepositAddressesByNetwork (code, params);
        const result = this.safeValue (response, networkCode);
        if (result === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find ' + networkCode + ' deposit address for ' + code);
        }
        return result as DepositAddress;
    }

    /**
     * @method
     * @name okcoin#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    async fetchDepositAddressesByNetwork (code: string, params = {}): Promise<DepositAddress[]> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
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
        const filtered = this.filterBy (data, 'selected', true);
        const parsed = this.parseDepositAddresses (filtered, [ currency['code'] ], false);
        return this.indexBy (parsed, 'network') as DepositAddress[];
    }

    /**
     * @method
     * @name okcoin#transfer
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-funds-transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const request: Dict = {
            'ccy': currency['id'],
            'amt': this.currencyToPrecision (code, amount),
            'type': '0', // 0 = transfer within account by default, 1 = master account to sub-account, 2 = sub-account to master account, 3 = sub-account to master account (Only applicable to APIKey from sub-account), 4 = sub-account to sub-account
            'from': fromId, // remitting account, 6: Funding account, 18: Trading account
            'to': toId, // beneficiary account, 6: Funding account, 18: Trading account
            // 'subAcct': 'sub-account-name', // optional, only required when type is 1, 2 or 4
            // 'loanTrans': false, // Whether or not borrowed coins can be transferred out under Multi-currency margin and Portfolio margin. The default is false
            // 'clientId': 'client-supplied id', // A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters
            // 'omitPosRisk': false, // Ignore position risk. Default is false. Applicable to Portfolio margin
        };
        if (fromId === 'master') {
            request['type'] = '1';
            request['subAcct'] = toId;
            request['from'] = this.safeString (params, 'from', '6');
            request['to'] = this.safeString (params, 'to', '6');
        } else if (toId === 'master') {
            request['type'] = '2';
            request['subAcct'] = fromId;
            request['from'] = this.safeString (params, 'from', '6');
            request['to'] = this.safeString (params, 'to', '6');
        }
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
        const rawTransfer = this.safeDict (data, 0, {});
        return this.parseTransfer (rawTransfer, currency);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
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
        // fetchTransfer
        //
        //     {
        //         "amt": "5",
        //         "ccy": "USDT",
        //         "from": "18",
        //         "instId": "",
        //         "state": "success",
        //         "subAcct": "",
        //         "to": "6",
        //         "toInstId": "",
        //         "transId": "464424732",
        //         "type": "0"
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "bal": "70.6874353780312913",
        //         "balChg": "-4.0000000000000000", // negative means "to funding", positive meand "from funding"
        //         "billId": "588900695232225299",
        //         "ccy": "USDT",
        //         "execType": "",
        //         "fee": "",
        //         "from": "18",
        //         "instId": "",
        //         "instType": "",
        //         "mgnMode": "",
        //         "notes": "To Funding Account",
        //         "ordId": "",
        //         "pnl": "",
        //         "posBal": "",
        //         "posBalChg": "",
        //         "price": "0",
        //         "subType": "12",
        //         "sz": "-4",
        //         "to": "6",
        //         "ts": "1686676866989",
        //         "type": "1"
        //     }
        //
        const id = this.safeString2 (transfer, 'transId', 'billId');
        const currencyId = this.safeString (transfer, 'ccy');
        const code = this.safeCurrencyCode (currencyId, currency);
        let amount = this.safeNumber (transfer, 'amt');
        const fromAccountId = this.safeString (transfer, 'from');
        const toAccountId = this.safeString (transfer, 'to');
        const accountsById = this.safeValue (this.options, 'accountsById', {});
        const timestamp = this.safeInteger (transfer, 'ts', this.milliseconds ());
        const balanceChange = this.safeString (transfer, 'sz');
        if (balanceChange !== undefined) {
            amount = this.parseNumber (Precise.stringAbs (balanceChange));
        }
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': this.safeString (accountsById, fromAccountId),
            'toAccount': this.safeString (accountsById, toAccountId),
            'status': this.parseTransferStatus (this.safeString (transfer, 'state')),
        };
    }

    parseTransferStatus (status: Str): Str {
        const statuses: Dict = {
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name okcoin#withdraw
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-withdrawal
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if ((tag !== undefined) && (tag.length > 0)) {
            address = address + ':' + tag;
        }
        const request: Dict = {
            'ccy': currency['id'],
            'toAddr': address,
            'dest': '4',
            'amt': this.numberToString (amount),
        };
        let network = this.safeString (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        if (network !== undefined) {
            const networks = this.safeValue (this.options, 'networks', {});
            network = this.safeString (networks, network.toUpperCase (), network); // handle ETH>ERC20 alias
            request['chain'] = currency['id'] + '-' + network;
            params = this.omit (params, 'network');
        }
        let fee = this.safeString (params, 'fee');
        if (fee === undefined) {
            const targetNetwork = this.safeValue (currency['networks'], this.networkIdToCode (network), {});
            fee = this.safeString (targetNetwork, 'fee');
            if (fee === undefined) {
                throw new ArgumentsRequired (this.id + ' withdraw() requires a "fee" string parameter, network transaction fee must be ≥ 0. Withdrawals to OKCoin or OKX are fee-free, please set "0". Withdrawing to external digital asset address requires network transaction fee.');
            }
        }
        request['fee'] = this.numberToString (fee); // withdrawals to OKCoin or OKX are fee-free, please set 0
        const response = await this.privatePostAssetWithdrawal (this.extend (request, params));
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
        const transaction = this.safeDict (data, 0);
        return this.parseTransaction (transaction, currency);
    }

    /**
     * @method
     * @name okcoin#fetchDeposits
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-deposit-history
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let request: Dict = {
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
            request['before'] = Math.max (since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        [ request, params ] = this.handleUntilOption ('after', request, params);
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
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    /**
     * @method
     * @name okcoin#fetchWithdrawals
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-withdrawal-history
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let request: Dict = {
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
            request['before'] = Math.max (since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        [ request, params ] = this.handleUntilOption ('after', request, params);
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
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    parseTransactionStatus (status: Str) {
        //
        // deposit statuses
        //
        //     {
        //         "0": "waiting for confirmation",
        //         "1": "confirmation account",
        //         "2": "recharge success"
        //     }
        //
        // withdrawal statues
        //
        //     {
        //        '-3': "pending cancel",
        //        "-2": "cancelled",
        //        "-1": "failed",
        //         "0": "pending",
        //         "1": "sending",
        //         "2": "sent",
        //         "3": "email confirmation",
        //         "4": "manual confirmation",
        //         "5": "awaiting identity confirmation"
        //     }
        //
        const statuses: Dict = {
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

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
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
        //         "tag",
        //         "pmtId",
        //         "memo",
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
            'network': undefined,
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
            'comment': undefined,
            'internal': undefined,
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        } as Transaction;
    }

    /**
     * @method
     * @name okcoin#fetchMyTrades
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-transaction-details-last-3-days
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-transaction-details-last-3-months
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'instType': 'SPOT',
        };
        if ((limit !== undefined) && (limit > 100)) {
            limit = 100;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'method', 'privateGetTradeFillsHistory');
        let response = undefined;
        if (method === 'privateGetTradeFillsHistory') {
            response = await this.privateGetTradeFillsHistory (this.extend (request, params));
        } else {
            response = await this.privateGetTradeFills (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name okcoin#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        const request: Dict = {
            // 'instrument_id': market['id'],
            'order_id': id,
            // 'after': '1', // return the page after the specified page number
            // 'before': '1', // return the page before the specified page number
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name okcoin#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-asset-bills-details
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'method', 'privateGetAccountBills');
        let request: Dict = {
            // 'instType': undefined, // 'SPOT', 'MARGIN', 'SWAP', 'FUTURES", 'OPTION'
            // 'ccy': undefined, // currency['id'],
            // 'ctType': undefined, // 'linear', 'inverse', only applicable to FUTURES/SWAP
            // 'type': varies depending the 'method' endpoint :
            //     - https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days
            //     - https://www.okx.com/docs-v5/en/#rest-api-funding-asset-bills-details
            //     - https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
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
        [ request, params ] = this.handleUntilOption ('end', request, params);
        let response = undefined;
        if (method === 'privateGetAccountBillsArchive') {
            response = await this.privateGetAccountBillsArchive (this.extend (request, params));
        } else if (method === 'privateGetAssetBills') {
            response = await this.privateGetAssetBills (this.extend (request, params));
        } else {
            response = await this.privateGetAccountBills (this.extend (request, params));
        }
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
        const types: Dict = {
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

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
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
        const currencyId = this.safeString (item, 'ccy');
        const code = this.safeCurrencyCode (currencyId, currency);
        currency = this.safeCurrency (currencyId, currency);
        const timestamp = this.safeInteger (item, 'ts');
        const feeCostString = this.safeString (item, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            fee = {
                'cost': this.parseToNumeric (Precise.stringNeg (feeCostString)),
                'currency': code,
            };
        }
        const marketId = this.safeString (item, 'instId');
        const symbol = this.safeSymbol (marketId, undefined, '-');
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'billId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'account': undefined,
            'referenceId': this.safeString (item, 'ordId'),
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType (this.safeString (item, 'type')),
            'currency': code,
            'symbol': symbol,
            'amount': this.safeNumber (item, 'balChg'),
            'before': undefined, // balance before
            'after': this.safeNumber (item, 'bal'), // balance after
            'status': 'ok',
            'fee': fee,
        }, currency) as LedgerEntry;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isArray = Array.isArray (params);
        const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
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

    parseBalanceByType (type, response) {
        if (type === 'funding') {
            return this.parseFundingBalance (response);
        } else {
            return this.parseTradingBalance (response);
        }
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //    {
        //        "code": "1",
        //        "data": [
        //            {
        //                "clOrdId": "",
        //                "ordId": "",
        //                "sCode": "51119",
        //                "sMsg": "Order placement failed due to insufficient balance. ",
        //                "tag": ""
        //            }
        //        ],
        //        "msg": ""
        //    },
        //    {
        //        "code": "58001",
        //        "data": [],
        //        "msg": "Incorrect trade password"
        //    }
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
        return undefined;
    }
}
