'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, BadSymbol, ExchangeError, ArgumentsRequired, AuthenticationError, InsufficientFunds, NotSupported, OrderNotFound, ExchangeNotAvailable, RateLimitExceeded, PermissionDenied, InvalidOrder, InvalidAddress, OnMaintenance, RequestTimeout, AccountSuspended, NetworkError, DDoSProtection, DuplicateOrderId, BadResponse } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class zb extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zb',
            'name': 'ZB',
            'countries': [ 'CN' ],
            // previously rateLimit = 100
            // Trading and Margin 10 000 per minute (IP) => 10000 / 60 = 166.66666... per second => rateLimit = 1000/166.66666 = 6
            // Trade and Margin 60 per second (apiKey) => weight = 166.666 / 60 = 2.778 (2.7777777...)
            // Kline 1 per second => weight = 166.667
            // v2 Futures API 100 per 2 seconds => 50 per second => weight = 3.334 (3.3333333...)
            // for endpoints not mentioned in docs
            // previous rateLimit was 100 translating to 10 requests per second => weight = 166.666 / 10 = 16.667 (16.666666...)
            'rateLimit': 6,
            'version': 'v1',
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': undefined,
                'option': undefined,
                'addMargin': true,
                'borrowMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
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
                '5d': '5d',
                '1w': '1w',
            },
            'hostname': 'zb.com', // zb.cafe for users in China
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg',
                'api': {
                    'spot': {
                        'v1': {
                            'public': 'https://api.{hostname}/data',
                            'private': 'https://trade.{hostname}/api',
                        },
                    },
                    'contract': {
                        'v1': {
                            'public': 'https://fapi.{hostname}/api/public',
                        },
                        'v2': {
                            'public': 'https://fapi.{hostname}/Server/api',
                            'private': 'https://fapi.{hostname}/Server/api',
                        },
                    },
                },
                'www': 'https://www.zb.com',
                'doc': 'https://www.zb.com/i/developer',
                'fees': 'https://www.zb.com/i/rate',
                'referral': {
                    'url': 'https://www.zb.com/en/register?ref=4301lera',
                    'discount': 0.16,
                },
            },
            'api': {
                'spot': {
                    'v1': {
                        'public': {
                            'get': {
                                'markets': 16.667,
                                'ticker': 16.667,
                                'allTicker': 16.667,
                                'depth': 16.667,
                                'trades': 16.667,
                                'kline': 166.667, // Kline 1 per second
                                'getGroupMarkets': 16.667,
                                'getFeeInfo': 16.667,
                            },
                        },
                        'private': {
                            'get': {
                                // spot API
                                'order': 1, // Trade API
                                'orderMoreV2': 1, // Trade API
                                'cancelOrder': 1, // Trade API
                                'cancelAllOrdersAfter': 1,  // Trade API TODO add cancelAllOrders
                                'getOrder': 1, // Trade API
                                'getOrders': 1, // Trade API
                                'getOrdersNew': 16.667,
                                'getOrdersIgnoreTradeType': 1, // Trade API
                                'getUnfinishedOrdersIgnoreTradeType': 1, // Trade API
                                'getFinishedAndPartialOrders': 1, // Trade API
                                'getAccountInfo': 16.667,
                                'getUserAddress': 16.667,
                                'getPayinAddress': 16.667,
                                'getWithdrawAddress': 16.667,
                                'getWithdrawRecord': 16.667,
                                'getChargeRecord': 16.667,
                                'getCnyWithdrawRecord': 16.667,
                                'getCnyChargeRecord': 16.667,
                                'withdraw': 16.667,
                                // sub accounts
                                'addSubUser': 16.667,
                                'getSubUserList': 16.667,
                                'doTransferFunds': 16.667,
                                'createSubUserKey': 16.667, // removed on 2021-03-16 according to the update log in the API doc
                                // leverage API
                                'getLeverAssetsInfo': 16.667,
                                'getLeverBills': 16.667,
                                'transferInLever': 16.667,
                                'transferOutLever': 16.667,
                                'loan': 16.667,
                                'cancelLoan': 16.667,
                                'getLoans': 16.667,
                                'getLoanRecords': 16.667,
                                'borrow': 16.667,
                                'autoBorrow': 16.667,
                                'repay': 16.667,
                                'doAllRepay': 16.667,
                                'getRepayments': 16.667,
                                'getFinanceRecords': 16.667,
                                'changeInvestMark': 16.667,
                                'changeLoop': 16.667,
                                // cross API
                                'getCrossAssets': 16.667,
                                'getCrossBills': 16.667,
                                'transferInCross': 16.667,
                                'transferOutCross': 16.667,
                                'doCrossLoan': 16.667,
                                'doCrossRepay': 16.667,
                                'getCrossRepayRecords': 16.667,
                            },
                        },
                    },
                },
                'contract': {
                    'v1': {
                        'public': {
                            'get': {
                                'depth': 16.667,
                                'fundingRate': 16.667,
                                'indexKline': 16.667,
                                'indexPrice': 16.667,
                                'kline': 16.667,
                                'markKline': 16.667,
                                'markPrice': 16.667,
                                'ticker': 16.667,
                                'trade': 16.667,
                            },
                        },
                    },
                    'v2': {
                        'public': {
                            'get': {
                                'allForceOrders': 3.334,
                                'config/marketList': 3.334,
                                'topLongShortAccountRatio': 3.334,
                                'topLongShortPositionRatio': 3.334,
                                'fundingRate': 3.334,
                                'premiumIndex': 3.334,
                            },
                        },
                        'private': {
                            'get': {
                                'Fund/balance': 3.334,
                                'Fund/getAccount': 3.334,
                                'Fund/getBill': 3.334,
                                'Fund/getBillTypeList': 3.334,
                                'Fund/marginHistory': 3.334,
                                'Positions/getPositions': 3.334,
                                'Positions/getNominalValue': 3.334,
                                'Positions/marginInfo': 3.334,
                                'setting/get': 3.334,
                                'trade/getAllOrders': 3.334,
                                'trade/getOrder': 3.334,
                                'trade/getOrderAlgos': 3.334,
                                'trade/getTradeList': 3.334,
                                'trade/getUndoneOrders': 3.334,
                                'trade/tradeHistory': 3.334,
                            },
                            'post': {
                                'activity/buyTicket': 3.334,
                                'Fund/transferFund': 3.334,
                                'Positions/setMarginCoins': 3.334,
                                'Positions/updateAppendUSDValue': 3.334,
                                'Positions/updateMargin': 3.334,
                                'setting/setLeverage': 3.334,
                                'setting/setPositionsMode': 3.334,
                                'trade/batchOrder': 3.334,
                                'trade/batchCancelOrder': 3.334,
                                'trade/cancelAlgos': 3.334,
                                'trade/cancelAllOrders': 3.334,
                                'trade/cancelOrder': 3.334,
                                'trade/order': 3.334,
                                'trade/orderAlgo': 3.334,
                                'trade/updateOrderAlgo': 3.334,
                            },
                        },
                    },
                },
            },
            'fees': {
                'funding': {
                    'withdraw': {},
                },
                'trading': {
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'commonCurrencies': {
                'ANG': 'Anagram',
                'ENT': 'ENTCash',
                'BCHABC': 'BCHABC', // conflict with BCH / BCHA
                'BCHSV': 'BCHSV', // conflict with BCH / BSV
            },
            'options': {
                'timeframes': {
                    'spot': {
                        '1m': '1min',
                        '3m': '3min',
                        '5m': '5min',
                        '15m': '15min',
                        '30m': '30min',
                        '1h': '1hour',
                        '2h': '2hour',
                        '4h': '4hour',
                        '6h': '6hour',
                        '12h': '12hour',
                        '1d': '1day',
                        '3d': '3day',
                        '1w': '1week',
                    },
                    'swap': {
                        '1m': '1M',
                        '5m': '5M',
                        '15m': '15M',
                        '30m': '30M',
                        '1h': '1H',
                        '6h': '6H',
                        '1d': '1D',
                        '5d': '5D',
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'ws': {
                    // '1000': ExchangeError, // The call is successful.
                    '1001': ExchangeError, // General error prompt
                    '1002': ExchangeError, // Internal Error
                    '1003': AuthenticationError, // Fail to verify
                    '1004': AuthenticationError, // The transaction password is locked
                    '1005': AuthenticationError, // Wrong transaction password, please check it and re-enter。
                    '1006': PermissionDenied, // Real-name authentication is pending approval or unapproved
                    '1007': ExchangeError, // Channel does not exist
                    '1009': OnMaintenance, // This interface is under maintenance
                    '1010': ExchangeNotAvailable, // Not available now
                    '1012': PermissionDenied, // Insufficient permissions
                    '1013': ExchangeError, // Cannot trade, please contact email: support@zb.cn for support.
                    '1014': ExchangeError, // Cannot sell during the pre-sale period
                    '2001': InsufficientFunds, // Insufficient CNY account balance
                    '2002': InsufficientFunds, // Insufficient BTC account balance
                    '2003': InsufficientFunds, // Insufficient LTC account balance
                    '2005': InsufficientFunds, // Insufficient ETH account balance
                    '2006': InsufficientFunds, // ETCInsufficient account balance
                    '2007': InsufficientFunds, // BTSInsufficient account balance
                    '2008': InsufficientFunds, // EOSInsufficient account balance
                    '2009': InsufficientFunds, // BCCInsufficient account balance
                    '3001': OrderNotFound, // Order not found or is completed
                    '3002': InvalidOrder, // Invalid amount
                    '3003': InvalidOrder, // Invalid quantity
                    '3004': AuthenticationError, // User does not exist
                    '3005': BadRequest, // Invalid parameter
                    '3006': PermissionDenied, // Invalid IP or not consistent with the bound IP
                    '3007': RequestTimeout, // The request time has expired
                    '3008': ExchangeError, // Transaction not found
                    '3009': InvalidOrder, // The price exceeds the limit
                    '3010': PermissionDenied, // It fails to place an order, due to you have set up to prohibit trading of this market.
                    '3011': InvalidOrder, // The entrusted price is abnormal, please modify it and place order again
                    '3012': InvalidOrder, // Duplicate custom customerOrderId
                    '4001': AccountSuspended, // APIThe interface is locked for one hour
                    '4002': RateLimitExceeded, // Request too frequently
                },
                'exact': {
                    // '1000': 'Successful operation',
                    '10001': ExchangeError, // Operation failed
                    '10002': PermissionDenied, // Operation is forbidden
                    '10003': BadResponse, // Data existed
                    '10004': BadResponse, // Date not exist
                    '10005': PermissionDenied, // Forbidden to access the interface
                    '10006': BadRequest, // Currency invalid or expired
                    '10007': ExchangeError, // {0}
                    '10008': ExchangeError, // Operation failed: {0}
                    '10009': ExchangeError, // URL error
                    '1001': ExchangeError, // 'General error message',
                    '10010': AuthenticationError, // API KEY not exist
                    '10011': AuthenticationError, // API KEY CLOSED
                    '10012': AccountSuspended, // User API has been frozen, please contact customer service for processing
                    '10013': AuthenticationError, // API verification failed
                    '10014': AuthenticationError, // Invalid signature(1001)
                    '10015': AuthenticationError, // Invalid signature(1002)
                    '10016': AuthenticationError, // Invalid ip
                    '10017': PermissionDenied, // Permission denied
                    '10018': AccountSuspended, // User has been frozen, please contact customer service
                    '10019': RequestTimeout, // Request time has expired
                    '1002': ExchangeError, // 'Internal error',
                    '10020': BadRequest, // {0}Parameter cannot be empty
                    '10021': BadRequest, // {0}Invalid parameter
                    '10022': BadRequest, // Request method error
                    '10023': RateLimitExceeded, // Request frequency is too fast, exceeding the limit allowed by the interface
                    '10024': AuthenticationError, // Login failed
                    '10025': ExchangeError, // Non-personal operation
                    '10026': NetworkError, // Failed to request interface, please try again
                    '10027': RequestTimeout, // Timed out, please try again later
                    '10028': ExchangeNotAvailable, // System busy, please try again later
                    '10029': DDoSProtection, // Frequent operation, please try again later
                    '1003': AuthenticationError, // 'Verification does not pass',
                    '10030': BadRequest, // Currency already exist
                    '10031': BadRequest, // Currency does not exist
                    '10032': BadRequest, // Market existed
                    '10033': BadRequest, // Market not exist
                    '10034': BadRequest, // Currency error
                    '10035': BadRequest, // Market not open
                    '10036': BadRequest, // Ineffective market type
                    '10037': ArgumentsRequired, // User id cannot be empty
                    '10038': BadRequest, // Market id cannot be empty
                    '10039': BadResponse, // Failed to get mark price
                    '1004': AuthenticationError, // 'Funding security password lock',
                    '10040': BadResponse, // Failed to obtain the opening margin configuration
                    '10041': BadResponse, // Failed to obtain maintenance margin allocation
                    '10042': ExchangeError, // Avg. price error
                    '10043': ExchangeError, // Abnormal acquisition of liquidation price
                    '10044': ExchangeError, // Unrealized profit and loss acquisition exception
                    '10045': ExchangeError, // jdbcData source acquisition failed
                    '10046': ExchangeError, // Invalid position opening direction
                    '10047': ExchangeError, // The maximum position allowed by the current leverage multiple has been exceeded
                    '10048': ExchangeError, // The maximum allowable order quantity has been exceeded
                    '10049': NetworkError, // Failed to get the latest price
                    '1005': AuthenticationError, // 'Funds security password is incorrect, please confirm and re-enter.',
                    '1006': AuthenticationError, // 'Real-name certification pending approval or audit does not pass',
                    '1009': ExchangeNotAvailable, // 'This interface is under maintenance',
                    '1010': ExchangeNotAvailable, // Not available now
                    '10100': OnMaintenance, // Sorry! System maintenance, stop operation
                    '1012': PermissionDenied, // Insufficient permissions
                    '1013': ExchangeError, // Cannot trade, please contact email: support@zb.cn for support.
                    '1014': ExchangeError, // Cannot sell during the pre-sale period
                    '11000': ExchangeError, // Funding change failed
                    '11001': ExchangeError, // Position change failed
                    '110011': ExchangeError, // Exceeds the maximum leverage allowed by the position
                    '11002': ExchangeError, // Funding not exist
                    '11003': ExchangeError, // Freeze records not exist
                    '11004': InsufficientFunds, // Insufficient frozen funds
                    '11005': InvalidOrder, // Insufficient positions
                    '11006': InsufficientFunds, // Insufficient frozen positions
                    '11007': OrderNotFound, // Position not exist
                    '11008': ExchangeError, // The contract have positions, cannot be modified
                    '11009': ExchangeError, // Failed to query data
                    '110110': ExchangeError, // Exceed the market's maximum leverage
                    '11012': InsufficientFunds, // Insufficient margin
                    '11013': ExchangeError, // Exceeding accuracy limit
                    '11014': ExchangeError, // Invalid bill type
                    '11015': AuthenticationError, // Failed to add default account
                    '11016': AuthenticationError, // Account not exist
                    '11017': ExchangeError, // Funds are not frozen or unfrozen
                    '11018': InsufficientFunds, // Insufficient funds
                    '11019': ExchangeError, // Bill does not exist
                    '11021': InsufficientFunds, // Inconsistent currency for funds transfer
                    '11023': ExchangeError, // Same transaction currency
                    '11030': PermissionDenied, // Position is locked, the operation is prohibited
                    '11031': ExchangeError, // The number of bill changes is zero
                    '11032': ExchangeError, // The same request is being processed, please do not submit it repeatedly
                    '11033': ArgumentsRequired, // Position configuration data is empty
                    '11034': ExchangeError, // Funding fee is being settled, please do not operate
                    '12000': InvalidOrder, // Invalid order price
                    '12001': InvalidOrder, // Invalid order amount
                    '12002': InvalidOrder, // Invalid order type
                    '12003': InvalidOrder, // Invalid price accuracy
                    '12004': InvalidOrder, // Invalid quantity precision
                    '12005': InvalidOrder, // order value less than the minimum or greater than the maximum
                    '12006': InvalidOrder, // Customize's order number format is wrong
                    '12007': InvalidOrder, // Direction error
                    '12008': InvalidOrder, // Order type error
                    '12009': InvalidOrder, // Commission type error
                    '12010': InvalidOrder, // Failed to place the order, the loss of the order placed at this price will exceed margin
                    '12011': InvalidOrder, // it's not a buz order
                    '12012': OrderNotFound, // order not exist
                    '12013': InvalidOrder, // Order user does not match
                    '12014': InvalidOrder, // Order is still in transaction
                    '12015': InvalidOrder, // Order preprocessing failed
                    '12016': InvalidOrder, // Order cannot be canceled
                    '12017': InvalidOrder, // Transaction Record not exist
                    '12018': InvalidOrder, // Order failed
                    '12019': ArgumentsRequired, // extend parameter cannot be empty
                    '12020': ExchangeError, // extend Parameter error
                    '12021': InvalidOrder, // The order price is not within the price limit rules!
                    '12022': InvalidOrder, // Stop placing an order while the system is calculating the fund fee
                    '12023': OrderNotFound, // There are no positions to close
                    '12024': InvalidOrder, // Orders are prohibited, stay tuned!
                    '12025': InvalidOrder, // Order cancellation is prohibited, so stay tuned!
                    '12026': DuplicateOrderId, // Order failed， customize order number exists
                    '12027': ExchangeNotAvailable, // System busy, please try again later
                    '12028': InvalidOrder, // The market has banned trading
                    '12029': InvalidOrder, // Forbidden place order, stay tuned
                    '12201': InvalidOrder, // Delegation strategy does not exist or the status has changed
                    '12202': InvalidOrder, // Delegation strategy has been changed, cannot be canceled
                    '12203': InvalidOrder, // Wrong order type
                    '12204': InvalidOrder, // Invalid trigger price
                    '12205': InvalidOrder, // The trigger price must be greater than the market’s selling price or lower than the buying price.
                    '12206': InvalidOrder, // Direction and order type do not match
                    '12207': RateLimitExceeded, // Submission failed, exceeding the allowed limit
                    '13001': AuthenticationError, // User not exist
                    '13002': PermissionDenied, // User did not activate futures
                    // '13003': AuthenticationError, // User is locked
                    '13003': InvalidOrder, // Margin gear is not continuous
                    '13004': InvalidOrder, // The margin quick calculation amount is less than 0
                    '13005': RateLimitExceeded, // You have exceeded the number of exports that day
                    '13006': ExchangeError, // No markets are bookmarked
                    '13007': ExchangeError, // Market not favorited
                    '13008': ExchangeError, // Not in any market user whitelist
                    '13009': ExchangeError, // Not in the whitelist of users in this market
                    '14000': ExchangeError, // {0}not support
                    '14001': AuthenticationError, // Already logged in, no need to log in multiple times
                    '14002': AuthenticationError, // Not logged in yet, please log in before subscribing
                    '14003': ExchangeError, // This is a channel for one-time queries, no need to unsubscribe
                    '14100': ExchangeError, // Accuracy does not support
                    '14101': RateLimitExceeded, // Request exceeded frequency limit
                    '14200': ArgumentsRequired, // id empty
                    '14300': ExchangeError, // activity not exist
                    '14301': ExchangeError, // The event has been opened and cannot be admitted
                    '14302': ExchangeError, // The purchase time has passed and cannot be admitted
                    '14303': ExchangeError, // Not yet open for the purchase
                    '14305': ExchangeError, // Cannot enter, the maximum number of returns has been exceeded
                    '14306': ExchangeError, // Cannot repeat admission
                    '14307': InvalidOrder, // Unable to cancel, status has been changed
                    '14308': InvalidOrder, // Unable to cancel, the amount does not match
                    '14309': ExchangeError, // Activity has not started
                    '14310': NotSupported, // Activity is over
                    '14311': NotSupported, // The activity does not support orders placed in this market
                    '14312': ExchangeError, // You have not participated in this activity
                    '14313': PermissionDenied, // Sorry! The purchase failed, the maximum number of participants has been reached
                    '14314': ExchangeError, // Active period id error
                    '2001': InsufficientFunds, // 'Insufficient CNY Balance',
                    '2002': InsufficientFunds, // 'Insufficient BTC Balance',
                    '2003': InsufficientFunds, // 'Insufficient LTC Balance',
                    '2005': InsufficientFunds, // 'Insufficient ETH Balance',
                    '2006': InsufficientFunds, // 'Insufficient ETC Balance',
                    '2007': InsufficientFunds, // 'Insufficient BTS Balance',
                    '2008': InsufficientFunds, // EOSInsufficient account balance
                    '2009': InsufficientFunds, // 'Account balance is not enough',
                    '3001': OrderNotFound, // 'Pending orders not found',
                    '3002': InvalidOrder, // 'Invalid price',
                    '3003': InvalidOrder, // 'Invalid amount',
                    '3004': AuthenticationError, // 'User does not exist',
                    '3005': BadRequest, // 'Invalid parameter',
                    '3006': AuthenticationError, // 'Invalid IP or inconsistent with the bound IP',
                    '3007': AuthenticationError, // 'The request time has expired',
                    '3008': OrderNotFound, // 'Transaction records not found',
                    '3009': InvalidOrder, // 'The price exceeds the limit',
                    '3010': PermissionDenied, // It fails to place an order, due to you have set up to prohibit trading of this market.
                    '3011': InvalidOrder, // 'The entrusted price is abnormal, please modify it and place order again',
                    '3012': InvalidOrder, // Duplicate custom customerOrderId
                    '4001': ExchangeNotAvailable, // 'API interface is locked or not enabled',
                    '4002': RateLimitExceeded, // 'Request too often',
                    '9999': ExchangeError, // Unknown error
                },
                'broad': {
                    '提币地址有误, 请先添加提币地址。': InvalidAddress, // {"code":1001,"message":"提币地址有误，请先添加提币地址。"}
                    '资金不足,无法划账': InsufficientFunds, // {"code":1001,"message":"资金不足,无法划账"}
                    '响应超时': RequestTimeout, // {"code":1001,"message":"响应超时"}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name zb#fetchMarkets
         * @description retrieves data on all markets for zb
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        //
        //     {
        //         "zb_qc":{
        //             "amountScale":2,
        //             "minAmount":0.01,
        //             "minSize":5,
        //             "priceScale":4,
        //         },
        //     }
        //
        let promises = [ this.spotV1PublicGetMarkets (params), this.contractV2PublicGetConfigMarketList (params) ];
        promises = await Promise.all (promises);
        const markets = promises[0];
        const contracts = promises[1];
        //
        //     {
        //         BTC_USDT: {
        //             symbol: 'BTC_USDT',
        //             buyerCurrencyId: '6',
        //             contractType: '1',
        //             defaultMarginMode: '1',
        //             marketType: '2',
        //             historyDBName: 'trade_history_readonly.dbc',
        //             defaultLeverage: '20',
        //             id: '100',
        //             canCancelOrder: true,
        //             area: '1',
        //             mixMarginCoinName: 'usdt',
        //             fundingRateRatio: '0.25',
        //             marginCurrencyName: 'usdt',
        //             minTradeMoney: '0.0001',
        //             enableTime: '1638954000000',
        //             maxTradeMoney: '10000000',
        //             canTrade: true,
        //             maxLeverage: '125',
        //             defaultPositionsMode: '2',
        //             onlyWhitelistVisible: false,
        //             riskWarnRatio: '0.8',
        //             marginDecimal: '8',
        //             spot: false,
        //             status: '1',
        //             amountDecimal: '3',
        //             leverage: false,
        //             minAmount: '0.001',
        //             canOrder: true,
        //             duration: '1',
        //             feeDecimal: '8',
        //             sellerCurrencyId: '1',
        //             maxAmount: '1000',
        //             canOpenPosition: true,
        //             isSupportMixMargin: false,
        //             markPriceLimitRate: '0.05',
        //             marginCurrencyId: '6',
        //             stopFundingFee: false,
        //             priceDecimal: '2',
        //             lightenUpFeeRate: '0',
        //             futures: true,
        //             sellerCurrencyName: 'btc',
        //             marketPriceLimitRate: '0.05',
        //             canRebate: true,
        //             marketName: 'BTC_USDT',
        //             depth: [ 0.01, 0.1, 1 ],
        //             createTime: '1607590430094',
        //             mixMarginCoinIds: [ 6 ],
        //             buyerCurrencyName: 'usdt',
        //             stopService: false
        //         },
        //     }
        //
        const contractsData = this.safeValue (contracts, 'data', []);
        const contractsById = this.indexBy (contractsData, 'marketName');
        const dataById = this.deepExtend (contractsById, markets);
        const keys = Object.keys (dataById);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = dataById[id];
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settleId = this.safeValue (market, 'marginCurrencyName');
            const settle = this.safeCurrencyCode (settleId);
            const spot = settle === undefined;
            const swap = this.safeValue (market, 'futures', false);
            const linear = swap ? true : undefined;
            let active = true;
            let symbol = base + '/' + quote;
            if (swap) {
                const status = this.safeString (market, 'status');
                active = (status === '1');
                symbol = base + '/' + quote + ':' + settle;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': swap ? 'swap' : 'spot',
                'spot': spot,
                'margin': false,
                'swap': swap,
                'future': false,
                'option': false,
                'active': active,
                'contract': swap,
                'linear': linear,
                'inverse': swap ? !linear : undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString2 (market, 'amountScale', 'amountDecimal'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString2 (market, 'priceScale', 'priceDecimal'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minAmount'),
                        'max': this.safeNumber (market, 'maxAmount'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber2 (market, 'minSize', 'minTradeMoney'),
                        'max': this.safeNumber (market, 'maxTradeMoney'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name zb#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.spotV1PublicGetGetFeeInfo (params);
        //
        //     {
        //         "code":1000,
        //         "message":"success",
        //         "result":{
        //             "USDT":[
        //                 {
        //                     "chainName":"TRC20",
        //                     "canWithdraw":true,
        //                     "fee":1.0,
        //                     "mainChainName":"TRX",
        //                     "canDeposit":true
        //                 },
        //                 {
        //                     "chainName":"OMNI",
        //                     "canWithdraw":true,
        //                     "fee":5.0,
        //                     "mainChainName":"BTC",
        //                     "canDeposit":true
        //                 },
        //                 {
        //                     "chainName":"ERC20",
        //                     "canWithdraw":true,
        //                     "fee":15.0,
        //                     "mainChainName":"ETH",
        //                     "canDeposit":true
        //                 }
        //             ],
        //         }
        //     }
        //
        const currencies = this.safeValue (response, 'result', {});
        const ids = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            const code = this.safeCurrencyCode (id);
            let isWithdrawEnabled = true;
            let isDepositEnabled = true;
            const fees = {};
            for (let j = 0; j < currency.length; j++) {
                const networkItem = currency[j];
                const network = this.safeString (networkItem, 'chainName');
                // const name = this.safeString (networkItem, 'name');
                const withdrawFee = this.safeNumber (networkItem, 'fee');
                const depositEnable = this.safeValue (networkItem, 'canDeposit');
                const withdrawEnable = this.safeValue (networkItem, 'canWithdraw');
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[network] = withdrawFee;
            }
            const active = (isWithdrawEnabled && isDepositEnabled);
            result[code] = {
                'id': id,
                'name': undefined,
                'code': code,
                'precision': undefined,
                'info': currency,
                'active': active,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'fee': undefined,
                'fees': fees,
                'limits': this.limits,
            };
        }
        return result;
    }

    parseBalance (response) {
        const balances = this.safeValue (response['result'], 'coins');
        const result = {
            'info': response,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            //     {        enName: "BTC",
            //               freez: "0.00000000",
            //         unitDecimal:  8, // always 8
            //              cnName: "BTC",
            //       isCanRecharge:  true, // TODO: should use this
            //             unitTag: "฿",
            //       isCanWithdraw:  true,  // TODO: should use this
            //           available: "0.00000000",
            //                 key: "btc"         }
            const account = this.account ();
            const currencyId = this.safeString (balance, 'key');
            const code = this.safeCurrencyCode (currencyId);
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'freez');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseSwapBalance (response) {
        const result = {
            'info': response,
        };
        const data = this.safeValue (response, 'data', {});
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            //
            //     {
            //         "userId": "6896693805014120448",
            //         "currencyId": "6",
            //         "currencyName": "usdt",
            //         "amount": "30.56585118",
            //         "freezeAmount": "0",
            //         "contractType": 1,
            //         "id": "6899113714763638819",
            //         "createTime": "1644876888934",
            //         "modifyTime": "1645787446037",
            //         "accountBalance": "30.56585118",
            //         "allMargin": "0",
            //         "allowTransferOutAmount": "30.56585118"
            //     },
            //
            const code = this.safeCurrencyCode (this.safeString (balance, 'currencyName'));
            const account = this.account ();
            account['total'] = this.safeString (balance, 'accountBalance');
            account['free'] = this.safeString (balance, 'allowTransferOutAmount');
            account['used'] = this.safeString (balance, 'freezeAmount');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseMarginBalance (response, marginMode) {
        const result = {
            'info': response,
        };
        let levers = undefined;
        if (marginMode === 'isolated') {
            const message = this.safeValue (response, 'message', {});
            const data = this.safeValue (message, 'datas', {});
            levers = this.safeValue (data, 'levers', []);
        } else {
            const crossResponse = this.safeValue (response, 'result', {});
            levers = this.safeValue (crossResponse, 'list', []);
        }
        for (let i = 0; i < levers.length; i++) {
            const balance = levers[i];
            //
            // Isolated Margin
            //
            //     {
            //         "cNetUSD": "0.00",
            //         "repayLeverShow": "-",
            //         "cCanLoanIn": "0.002115400000000",
            //         "fNetCNY": "147.76081161",
            //         "fLoanIn": "0.00",
            //         "repayLevel": 0,
            //         "level": 1,
            //         "netConvertCNY": "147.760811613032",
            //         "cFreeze": "0.00",
            //         "cUnitTag": "BTC",
            //         "version": 1646783178609,
            //         "cAvailableUSD": "0.00",
            //         "cNetCNY": "0.00",
            //         "riskRate": "-",
            //         "fAvailableUSD": "20.49273433",
            //         "fNetUSD": "20.49273432",
            //         "cShowName": "BTC",
            //         "leverMultiple": "5.00",
            //         "couldTransferOutFiat": "20.49273433",
            //         "noticeLine": "1.13",
            //         "fFreeze": "0.00",
            //         "cUnitDecimal": 8,
            //         "fCanLoanIn": "81.970937320000000",
            //         "cAvailable": "0.00",
            //         "repayLock": false,
            //         "status": 1,
            //         "forbidType": 0,
            //         "totalConvertCNY": "147.760811613032",
            //         "cAvailableCNY": "0.00",
            //         "unwindPrice": "0.00",
            //         "fOverdraft": "0.00",
            //         "fShowName": "USDT",
            //         "statusShow": "%E6%AD%A3%E5%B8%B8",
            //         "cOverdraft": "0.00",
            //         "netConvertUSD": "20.49273433",
            //         "cNetBtc": "0.00",
            //         "loanInConvertCNY": "0.00",
            //         "fAvailableCNY": "147.760811613032",
            //         "key": "btcusdt",
            //         "fNetBtc": "0.0005291",
            //         "fUnitDecimal": 8,
            //         "loanInConvertUSD": "0.00",
            //         "showName": "BTC/USDT",
            //         "startLine": "1.25",
            //         "totalConvertUSD": "20.49273433",
            //         "couldTransferOutCoin": "0.00",
            //         "cEnName": "BTC",
            //         "leverMultipleInterest": "3.00",
            //         "fAvailable": "20.49273433",
            //         "fEnName": "USDT",
            //         "forceRepayLine": "1.08",
            //         "cLoanIn": "0.00"
            //     }
            //
            // Cross Margin
            //
            //     [
            //         {
            //             "fundType": 2,
            //             "loanIn": 0,
            //             "amount": 0,
            //             "freeze": 0,
            //             "overdraft": 0,
            //             "key": "BTC",
            //             "canTransferOut": 0
            //         },
            //     ],
            //
            const account = this.account ();
            if (marginMode === 'isolated') {
                const code = this.safeCurrencyCode (this.safeString (balance, 'fShowName'));
                account['total'] = this.safeString (balance, 'fAvailableUSD'); // total amount in USD
                account['free'] = this.safeString (balance, 'couldTransferOutFiat');
                account['used'] = this.safeString (balance, 'fFreeze');
                result[code] = account;
            } else {
                const code = this.safeCurrencyCode (this.safeString (balance, 'key'));
                account['total'] = this.safeString (balance, 'amount');
                account['free'] = this.safeString (balance, 'canTransferOut');
                account['used'] = this.safeString (balance, 'freeze');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name zb#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the zb api endpoint
         * @param {string} params.marginMode 'cross' or 'isolated'
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const [ marketType, marketTypeQuery ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchBalance', marketTypeQuery);
        const swap = (marketType === 'swap');
        const marginMethod = (marginMode === 'cross') ? 'spotV1PrivateGetGetCrossAssets' : 'spotV1PrivateGetGetLeverAssetsInfo';
        let method = this.getSupportedMapping (marketType, {
            'spot': 'spotV1PrivateGetGetAccountInfo',
            'swap': 'contractV2PrivateGetFundBalance',
            'margin': marginMethod,
        });
        if (marginMode === 'isolated') {
            method = 'spotV1PrivateGetGetLeverAssetsInfo';
        } else if (marginMode === 'cross') {
            method = 'spotV1PrivateGetGetCrossAssets';
        }
        const request = {
            // 'futuresAccountType': 1, // SWAP
            // 'currencyId': currency['id'], // SWAP
            // 'currencyName': 'usdt', // SWAP
        };
        if (swap) {
            request['futuresAccountType'] = 1;
        }
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     {
        //         "result": {
        //             "coins": [
        //                 {
        //                     "isCanWithdraw": "true",
        //                     "canLoan": false,
        //                     "fundstype": 51,
        //                     "showName": "ZB",
        //                     "isCanRecharge": "true",
        //                     "cnName": "ZB",
        //                     "enName": "ZB",
        //                     "available": "0",
        //                     "freez": "0",
        //                     "unitTag": "ZB",
        //                     "key": "zb",
        //                     "unitDecimal": 8
        //                 },
        //             ],
        //             "version": 1645856691340,
        //             "base": {
        //                 "auth_google_enabled": true,
        //                 "auth_mobile_enabled": false,
        //                 "trade_password_enabled": true,
        //                 "username": "blank@gmail.com"
        //             }
        //         },
        //         "leverPerm": true,
        //         "otcPerm": false,
        //         "assetPerm": true,
        //         "moneyPerm": true,
        //         "subUserPerm": true,
        //         "entrustPerm": true
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "data": [
        //             {
        //                 "userId": "6896693805014120448",
        //                 "currencyId": "6",
        //                 "currencyName": "usdt",
        //                 "amount": "30.56585118",
        //                 "freezeAmount": "0",
        //                 "contractType": 1,
        //                 "id": "6899113714763638819",
        //                 "createTime": "1644876888934",
        //                 "modifyTime": "1645787446037",
        //                 "accountBalance": "30.56585118",
        //                 "allMargin": "0",
        //                 "allowTransferOutAmount": "30.56585118"
        //             },
        //         ],
        //         "desc": "操作成功"
        //     }
        //
        // Isolated Margin
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "leverPerm": true,
        //                 "levers": [
        //                     {
        //                         "cNetUSD": "0.00",
        //                         "repayLeverShow": "-",
        //                         "cCanLoanIn": "0.002115400000000",
        //                         "fNetCNY": "147.76081161",
        //                         "fLoanIn": "0.00",
        //                         "repayLevel": 0,
        //                         "level": 1,
        //                         "netConvertCNY": "147.760811613032",
        //                         "cFreeze": "0.00",
        //                         "cUnitTag": "BTC",
        //                         "version": 1646783178609,
        //                         "cAvailableUSD": "0.00",
        //                         "cNetCNY": "0.00",
        //                         "riskRate": "-",
        //                         "fAvailableUSD": "20.49273433",
        //                         "fNetUSD": "20.49273432",
        //                         "cShowName": "BTC",
        //                         "leverMultiple": "5.00",
        //                         "couldTransferOutFiat": "20.49273433",
        //                         "noticeLine": "1.13",
        //                         "fFreeze": "0.00",
        //                         "cUnitDecimal": 8,
        //                         "fCanLoanIn": "81.970937320000000",
        //                         "cAvailable": "0.00",
        //                         "repayLock": false,
        //                         "status": 1,
        //                         "forbidType": 0,
        //                         "totalConvertCNY": "147.760811613032",
        //                         "cAvailableCNY": "0.00",
        //                         "unwindPrice": "0.00",
        //                         "fOverdraft": "0.00",
        //                         "fShowName": "USDT",
        //                         "statusShow": "%E6%AD%A3%E5%B8%B8",
        //                         "cOverdraft": "0.00",
        //                         "netConvertUSD": "20.49273433",
        //                         "cNetBtc": "0.00",
        //                         "loanInConvertCNY": "0.00",
        //                         "fAvailableCNY": "147.760811613032",
        //                         "key": "btcusdt",
        //                         "fNetBtc": "0.0005291",
        //                         "fUnitDecimal": 8,
        //                         "loanInConvertUSD": "0.00",
        //                         "showName": "BTC/USDT",
        //                         "startLine": "1.25",
        //                         "totalConvertUSD": "20.49273433",
        //                         "couldTransferOutCoin": "0.00",
        //                         "cEnName": "BTC",
        //                         "leverMultipleInterest": "3.00",
        //                         "fAvailable": "20.49273433",
        //                         "fEnName": "USDT",
        //                         "forceRepayLine": "1.08",
        //                         "cLoanIn": "0.00"
        //                     }
        //                 ]
        //             }
        //         }
        //     }
        //
        // Cross Margin
        //
        //     {
        //         "code": 1000,
        //         "message": "操作成功",
        //         "result": {
        //             "loanIn": 0,
        //             "total": 71.167,
        //             "riskRate": "-",
        //             "list" :[
        //                 {
        //                     "fundType": 2,
        //                     "loanIn": 0,
        //                     "amount": 0,
        //                     "freeze": 0,
        //                     "overdraft": 0,
        //                     "key": "BTC",
        //                     "canTransferOut": 0
        //                 },
        //             ],
        //             "net": 71.167
        //         }
        //     }
        //
        // todo: use this somehow
        // let permissions = response['result']['base'];
        if (swap) {
            return this.parseSwapBalance (response);
        } else if (marginMode !== undefined) {
            return this.parseMarginBalance (response, marginMode);
        } else {
            return this.parseBalance (response);
        }
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        // fetchDepositAddress
        //
        //     {
        //         "key": "0x0af7f36b8f09410f3df62c81e5846da673d4d9a9"
        //     }
        //
        // fetchDepositAddresses
        //
        //     {
        //         "blockChain": "btc",
        //         "isUseMemo": false,
        //         "address": "1LL5ati6pXHZnTGzHSA3rWdqi4mGGXudwM",
        //         "canWithdraw": true,
        //         "canDeposit": true
        //     }
        //     {
        //         "blockChain": "bts",
        //         "isUseMemo": true,
        //         "account": "btstest",
        //         "memo": "123",
        //         "canWithdraw": true,
        //         "canDeposit": true
        //     }
        //
        let address = this.safeString2 (depositAddress, 'key', 'address');
        let tag = undefined;
        const memo = this.safeString (depositAddress, 'memo');
        if (memo !== undefined) {
            tag = memo;
        } else if (address.indexOf ('_') >= 0) {
            const parts = address.split ('_');
            address = parts[0];  // WARNING: MAY BE tag_address INSTEAD OF address_tag FOR SOME CURRENCIES!!
            tag = parts[1];
        }
        this.checkAddress (address);
        const currencyId = this.safeString (depositAddress, 'blockChain');
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.spotV1PrivateGetGetPayinAddress (params);
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": [
        //                 {
        //                     "blockChain": "btc",
        //                     "isUseMemo": false,
        //                     "address": "1LL5ati6pXHZnTGzHSA3rWdqi4mGGXudwM",
        //                     "canWithdraw": true,
        //                     "canDeposit": true
        //                 },
        //                 {
        //                     "blockChain": "bts",
        //                     "isUseMemo": true,
        //                     "account": "btstest",
        //                     "memo": "123",
        //                     "canWithdraw": true,
        //                     "canDeposit": true
        //                 },
        //             ]
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', []);
        return this.parseDepositAddresses (datas, codes);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name zb#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spotV1PrivateGetGetUserAddress (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "key": "0x0af7f36b8f09410f3df62c81e5846da673d4d9a9"
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        return this.parseDepositAddress (datas, currency);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'market': market['id'], // only applicable to SPOT
            // 'symbol': market['id'], // only applicable to SWAP
            // 'size': limit, // 1-50 applicable to SPOT and SWAP
            // 'merge': 5.0, // float default depth only applicable to SPOT
            // 'scale': 5, // int accuracy, only applicable to SWAP
        };
        const marketIdField = market['swap'] ? 'symbol' : 'market';
        request[marketIdField] = market['id'];
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PublicGetDepth',
            'swap': 'contractV1PublicGetDepth',
        });
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "asks":[
        //             [35000.0,0.2741],
        //             [34949.0,0.0173],
        //             [34900.0,0.5004],
        //         ],
        //         "bids":[
        //             [34119.32,0.0030],
        //             [34107.83,0.1500],
        //             [34104.42,0.1500],
        //         ],
        //         "timestamp":1624536510
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": {
        //             "asks": [
        //                 [43416.6,0.02],
        //                 [43418.25,0.04],
        //                 [43425.82,0.02]
        //             ],
        //             "bids": [
        //                 [43414.61,0.1],
        //                 [43414.18,0.04],
        //                 [43413.03,0.05]
        //             ],
        //             "time": 1645087743071
        //         }
        //     }
        //
        let result = undefined;
        let timestamp = undefined;
        if (market['type'] === 'swap') {
            result = this.safeValue (response, 'data');
            timestamp = this.safeInteger (result, 'time');
        } else {
            result = response;
            timestamp = this.safeTimestamp (response, 'timestamp');
        }
        return this.parseOrderBook (result, symbol, timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.spotV1PublicGetAllTicker (params);
        const result = {};
        const marketsByIdWithoutUnderscore = {};
        const marketIds = this.ids;
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const tickerId = marketId.replace ('_', '');
            marketsByIdWithoutUnderscore[tickerId] = marketId;
        }
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const marketId = this.safeValue (marketsByIdWithoutUnderscore, ids[i]);
            const market = this.safeMarket (marketId, undefined, '_');
            if (market !== undefined) {
                const symbol = market['symbol'];
                const ticker = this.safeValue (response, ids[i]);
                if (ticker !== undefined) {
                    result[symbol] = this.parseTicker (ticker, market);
                }
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name zb#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'market': market['id'], // only applicable to SPOT
            // 'symbol': market['id'], // only applicable to SWAP
        };
        const marketIdField = market['swap'] ? 'symbol' : 'market';
        request[marketIdField] = market['id'];
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PublicGetTicker',
            'swap': 'contractV1PublicGetTicker',
        });
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "date":"1624399623587",
        //         "ticker":{
        //             "high":"33298.38",
        //             "vol":"56152.9012",
        //             "last":"32578.55",
        //             "low":"28808.19",
        //             "buy":"32572.68",
        //             "sell":"32615.37",
        //             "turnover":"1764201303.6100",
        //             "open":"31664.85",
        //             "riseRate":"2.89"
        //         }
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": {
        //             "BTC_USDT": [44053.47,44357.77,42911.54,43297.79,53471.264,-1.72,1645093002,302201.255084]
        //         }
        //     }
        //
        let ticker = undefined;
        if (market['type'] === 'swap') {
            ticker = {};
            const data = this.safeValue (response, 'data');
            const values = this.safeValue (data, market['id'], []);
            for (let i = 0; i < values.length; i++) {
                ticker['open'] = this.safeValue (values, 0);
                ticker['high'] = this.safeValue (values, 1);
                ticker['low'] = this.safeValue (values, 2);
                ticker['last'] = this.safeValue (values, 3);
                ticker['vol'] = this.safeValue (values, 4);
                ticker['riseRate'] = this.safeValue (values, 5);
            }
        } else {
            ticker = this.safeValue (response, 'ticker', {});
            ticker['date'] = this.safeValue (response, 'date');
        }
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // Spot
        //
        //     {
        //         "date":"1624399623587", // injected from outside
        //         "high":"33298.38",
        //         "vol":"56152.9012",
        //         "last":"32578.55",
        //         "low":"28808.19",
        //         "buy":"32572.68",
        //         "sell":"32615.37",
        //         "turnover":"1764201303.6100",
        //         "open":"31664.85",
        //         "riseRate":"2.89"
        //     }
        //
        // Swap
        //
        //     {
        //         open: 44083.82,
        //         high: 44357.77,
        //         low: 42911.54,
        //         last: 43097.87,
        //         vol: 53451.641,
        //         riseRate: -2.24
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date', this.milliseconds ());
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    parseOHLCV (ohlcv, market = undefined) {
        if (market['swap']) {
            const ohlcvLength = ohlcv.length;
            if (ohlcvLength > 5) {
                return [
                    this.safeTimestamp (ohlcv, 5),
                    this.safeNumber (ohlcv, 0),
                    this.safeNumber (ohlcv, 1),
                    this.safeNumber (ohlcv, 2),
                    this.safeNumber (ohlcv, 3),
                    this.safeNumber (ohlcv, 4),
                ];
            } else {
                return [
                    this.safeTimestamp (ohlcv, 4),
                    this.safeNumber (ohlcv, 0),
                    this.safeNumber (ohlcv, 1),
                    this.safeNumber (ohlcv, 2),
                    this.safeNumber (ohlcv, 3),
                    undefined,
                ];
            }
        } else {
            return [
                this.safeInteger (ohlcv, 0),
                this.safeNumber (ohlcv, 1),
                this.safeNumber (ohlcv, 2),
                this.safeNumber (ohlcv, 3),
                this.safeNumber (ohlcv, 4),
                this.safeNumber (ohlcv, 5),
            ];
        }
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const spot = market['spot'];
        const options = this.safeValue (this.options, 'timeframes', {});
        const timeframes = this.safeValue (options, market['type'], {});
        const timeframeValue = this.safeString (timeframes, timeframe);
        if (timeframeValue === undefined) {
            throw new NotSupported (this.id + ' fetchOHLCV() does not support ' + timeframe + ' timeframe for ' + market['type'] + ' markets');
        }
        if (limit === undefined) {
            limit = 1000;
        }
        const request = {
            'size': limit,
            // 'market': market['id'], // spot only
            // 'symbol': market['id'], // swap only
            // 'type': timeframeValue, // spot only
            // 'period': timeframeValue, // swap only
            // 'since': since, // spot only
            // 'size': limit, // spot and swap
        };
        const marketIdField = swap ? 'symbol' : 'market';
        request[marketIdField] = market['id'];
        const periodField = swap ? 'period' : 'type';
        request[periodField] = timeframeValue;
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        let method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PublicGetKline',
            'swap': 'contractV1PublicGetKline',
        });
        if (swap) {
            if (price === 'mark') {
                method = 'contractV1PublicGetMarkKline';
            } else if (price === 'index') {
                method = 'contractV1PublicGetIndexKline';
            }
        } else if (spot) {
            if (since !== undefined) {
                request['since'] = since;
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "symbol": "BTC",
        //         "data": [
        //             [1645091400000,43183.24,43187.49,43145.92,43182.28,0.9110],
        //             [1645091460000,43182.18,43183.15,43182.06,43183.15,1.4393],
        //             [1645091520000,43182.11,43240.1,43182.11,43240.1,0.3802]
        //         ],
        //         "moneyType": "USDT"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": [
        //             [41433.44,41433.44,41405.88,41408.75,21.368,1646366460],
        //             [41409.25,41423.74,41408.8,41423.42,9.828,1646366520],
        //             [41423.96,41429.39,41369.98,41370.31,123.104,1646366580]
        //         ]
        //     }
        //
        // Mark
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": [
        //             [41603.39,41603.39,41591.59,41600.81,1646381760],
        //             [41600.36,41605.75,41587.69,41601.97,1646381820],
        //             [41601.97,41601.97,41562.62,41593.96,1646381880]
        //         ]
        //     }
        //
        // Index
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": [
        //             [41697.53,41722.29,41689.16,41689.16,1646381640],
        //             [41690.1,41691.73,41611.61,41611.61,1646381700],
        //             [41611.61,41619.49,41594.87,41594.87,1646381760]
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // Spot
        //
        //     {
        //         "date":1624537391,
        //         "amount":"0.0142",
        //         "price":"33936.42",
        //         "trade_type":"ask",
        //         "type":"sell",
        //         "tid":1718869018
        //     }
        //
        // Swap
        //
        //     {
        //         "amount": "0.002",
        //         "createTime": "1645787446034",
        //         "feeAmount": "-0.05762699",
        //         "feeCurrency": "USDT",
        //         "id": "6902932868050395136",
        //         "maker": false,
        //         "orderId": "6902932868042006528",
        //         "price": "38417.99",
        //         "relizedPnl": "0.30402",
        //         "side": 4,
        //         "userId": "6896693805014120448"
        //     },
        //
        const sideField = market['swap'] ? 'side' : 'trade_type';
        let side = this.safeString (trade, sideField);
        let takerOrMaker = undefined;
        const maker = this.safeValue (trade, 'maker');
        if (maker !== undefined) {
            takerOrMaker = maker ? 'maker' : 'taker';
        }
        if (market['spot']) {
            side = (side === 'bid') ? 'buy' : 'sell';
        } else {
            if (side === '3') {
                side = 'sell'; // close long
            } else if (side === '4') {
                side = 'buy'; // close short
            } else if (side === '1') {
                side = 'buy'; // open long
            } else if (side === '2') {
                side = 'sell'; // open short
            }
        }
        let timestamp = undefined;
        if (market['swap']) {
            timestamp = this.safeInteger (trade, 'createTime');
        } else {
            timestamp = this.safeTimestamp (trade, 'date');
        }
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'feeAmount');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            fee = {
                'cost': feeCostString,
                'currency': this.safeCurrencyCode (feeCurrencyId),
            };
        }
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'tid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'order': this.safeString (trade, 'orderId'),
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const request = {
            // 'market': market['id'], // SPOT
            // 'symbol': market['id'], // SWAP
            // 'side': 1, // SWAP
            // 'dateRange': 0, // SWAP
            // 'startTime': since, // SWAP
            // 'endtime': this.milliseconds (), // SWAP
            // 'pageNum': 1, // SWAP
            // 'pageSize': limit,  // SWAP default is 10
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const marketIdField = swap ? 'symbol' : 'market';
        request[marketIdField] = market['id'];
        if (swap && params['pageNum'] === undefined) {
            request['pageNum'] = 1;
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PublicGetTrades',
            'swap': 'contractV2PrivateGetTradeTradeHistory',
        });
        let response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     [
        //         {"date":1624537391,"amount":"0.0142","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869018},
        //         {"date":1624537391,"amount":"0.0010","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869020},
        //         {"date":1624537391,"amount":"0.0133","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869021},
        //     ]
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "amount": "0.002",
        //                     "createTime": "1645787446034",
        //                     "feeAmount": "-0.05762699",
        //                     "feeCurrency": "USDT",
        //                     "id": "6902932868050395136",
        //                     "maker": false,
        //                     "orderId": "6902932868042006528",
        //                     "price": "38417.99",
        //                     "relizedPnl": "0.30402",
        //                     "side": 4,
        //                     "userId": "6896693805014120448"
        //                 },
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 10
        //         },
        //         "desc": "操作成功"
        //     }
        //
        if (swap) {
            const data = this.safeValue (response, 'data');
            response = this.safeValue (data, 'list');
        }
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name zb#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the zb api endpoint
         * @param {string} params.marginMode 'cross' or 'isolated'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('createOrder', params);
        const swap = market['swap'];
        const spot = market['spot'];
        const timeInForce = this.safeString (params, 'timeInForce');
        let reduceOnly = this.safeValue (params, 'reduceOnly');
        const triggerPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isStopLoss = stopLossPrice !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        const isTriggerOrder = triggerPrice !== undefined;
        if (this.sum (isStopLoss, isTakeProfit, isTriggerOrder)) {
            throw new ExchangeError (this.id + ' createOrder() stopLossPrice and takeProfitPrice cannot both be defined');
        }
        const isStopOrder = isStopLoss || isTakeProfit || isTriggerOrder;
        if (isStopOrder && spot) {
            throw new ExchangeError (this.id + ' createOrder() it is not possible to make a stop order on spot markets');
        }
        if (type === 'market') {
            throw new InvalidOrder (this.id + ' createOrder() on ' + market['type'] + ' markets does not allow market orders');
        }
        let method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PrivateGetOrder',
            'margin': 'spotV1PrivateGetOrder',
            'swap': 'contractV2PrivatePostTradeOrder',
        });
        const request = {
            'amount': this.amountToPrecision (symbol, amount),
            // 'symbol': market['id'],
            // 'acctType': 0, // Spot, Margin 0/1/2 [Spot/Isolated/Cross] Optional, Default to: 0 Spot
            // 'customerOrderId': '1f2g', // Spot, Margin
            // 'orderType': 1, // Spot, Margin order type 1/2 [PostOnly/IOC] Optional
            // 'triggerPrice': 30000.0, // Stop trigger price
            // 'algoPrice': 29000.0, // Stop order price
            // 'priceType': 1, // Stop Loss Take Profit, 1: Mark price, 2: Last price
            // 'bizType': 1, // Stop Loss Take Profit, 1: TP, 2: SL
        };
        if (spot) {
            const exchangeSpecificParam = this.safeInteger (params, 'orderType', type) === 1;
            const postOnly = this.isPostOnly (false, exchangeSpecificParam, params);
            request['tradeType'] = (side === 'buy') ? 1 : 0;
            request['currency'] = market['id'];
            if (postOnly) {
                request['orderType'] = 1;
            } else if (timeInForce === 'IOC') {
                request['orderType'] = 2;
            }
            if (price !== undefined) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (marginMode !== undefined) {
                if (marginMode === 'isolated') {
                    request['acctType'] = 1;
                } else if (marginMode === 'cross') {
                    request['acctType'] = 2;
                }
            }
        } else if (swap) {
            const exchangeSpecificParam = this.safeInteger (params, 'action', type) === 4;
            const postOnly = this.isPostOnly (false, exchangeSpecificParam, params);
            // the default mode on zb is one way mode
            // currently ccxt does not support hedge mode natively
            if (isStopLoss || isTakeProfit) {
                reduceOnly = true;
            }
            if (reduceOnly) {
                request['side'] = 0;
            } else {
                request['side'] = (side === 'buy') ? 5 : 6;
            }
            if (isStopOrder) {
                method = 'contractV2PrivatePostTradeOrderAlgo';
                if (isStopLoss) {
                    request['orderType'] = 2;
                    request['bizType'] = 2;
                    request['triggerPrice'] = this.priceToPrecision (symbol, stopLossPrice);
                } else if (isTakeProfit) {
                    request['orderType'] = 2;
                    request['bizType'] = 1;
                    request['triggerPrice'] = this.priceToPrecision (symbol, takeProfitPrice);
                } else if (isTriggerOrder) {
                    request['orderType'] = 1;
                    request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                }
                request['algoPrice'] = this.priceToPrecision (symbol, price);
                request['pricetype'] = 2;
            } else {
                if (timeInForce === 'IOC') {
                    request['action'] = 3;
                } else if (postOnly) {
                    request['action'] = 4;
                } else if (timeInForce === 'FOK') {
                    request['action'] = 5;
                } else if (type === 'limit') {
                    request['action'] = 1;
                } else {
                    request['action'] = type;
                }
            }
            if (price !== undefined) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            request['symbol'] = market['id'];
            const clientOrderId = this.safeString (params, 'clientOrderId'); // OPTIONAL '^[a-zA-Z0-9-_]{1,36}$', // The user-defined order number
            if (clientOrderId !== undefined) {
                request['clientOrderId'] = clientOrderId;
            }
            // using extend as const name causes issues in python
            const extendOrderAlgos = this.safeValue (params, 'extend', undefined); // OPTIONAL {"orderAlgos":[{"bizType":1,"priceType":1,"triggerPrice":"70000"},{"bizType":2,"priceType":1,"triggerPrice":"40000"}]}
            if (extendOrderAlgos !== undefined) {
                request['extend'] = extendOrderAlgos;
            }
        }
        params = this.omit (query, [ 'takeProfitPrice', 'stopLossPrice', 'stopPrice', 'reduceOnly', 'orderType', 'triggerPrice', 'priceType', 'clientOrderId', 'extend' ]);
        const response = await this[method] (this.extend (request, params));
        //
        // Spot and Margin
        //
        //     {
        //         "code": 1000,
        //         "message": "操作成功",
        //         "id": "202202224851151555"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": {
        //             "orderId": "6901786759944937472",
        //             "orderCode": null
        //         }
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": 10000,
        //         "data": "6919884551305242624",
        //         "desc": "操作成功"
        //     }
        //
        let result = response;
        if (swap && !isStopOrder) {
            result = this.safeValue (response, 'data');
        }
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name zb#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const request = {
            // 'currency': this.marketId (symbol), // only applicable to SPOT
            // 'id': id.toString (), // only applicable to SPOT
            // 'symbol': this.marketId (symbol), // only applicable to SWAP
            // 'orderId': id.toString (), // only applicable to SWAP
            // 'clientOrderId': params['clientOrderId'], // only applicable to SWAP
        };
        const marketIdField = swap ? 'symbol' : 'currency';
        request[marketIdField] = this.marketId (symbol);
        const orderIdField = swap ? 'orderId' : 'id';
        request[orderIdField] = id.toString ();
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PrivateGetCancelOrder',
            'swap': 'contractV2PrivatePostTradeCancelOrder',
        });
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         "code": 1000,
        //         "message": "Success。"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10007,
        //         "desc": "orderId与clientOrderId选填1个"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name zb#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const stop = this.safeValue (params, 'stop');
        if (market['spot']) {
            throw new NotSupported (this.id + ' cancelAllOrders() is not supported on ' + market['type'] + ' markets');
        }
        const request = {
            'symbol': market['id'],
            // 'ids': [ 6904603200733782016, 6819506476072247297 ], // STOP
            // 'side': params['side'], // STOP, for stop orders: 1 Open long (buy), 2 Open short (sell), 3 Close long (sell), 4 Close Short (Buy). One-Way Positions: 5 Buy, 6 Sell, 0 Close Only
        };
        let method = 'contractV2PrivatePostTradeCancelAllOrders';
        if (stop) {
            method = 'contractV2PrivatePostTradeCancelAlgos';
        }
        const query = this.omit (params, 'stop');
        return await this[method] (this.extend (request, query));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = this.safeInteger (params, 'orderType');
        if (orderType !== undefined) {
            throw new ExchangeError (this.id + ' fetchOrder() it is not possible to fetch a single conditional order, use fetchOrders() instead');
        }
        const swap = market['swap'];
        const request = {
            // 'currency': this.marketId (symbol), // only applicable to SPOT
            // 'id': id.toString (), // only applicable to SPOT
            // 'orderId': id.toString (), // only applicable to SWAP
            // 'clientOrderId': params['clientOrderId'], // only applicable to SWAP
            // 'symbol': market['id'], // STOP and SWAP
            // 'side': params['side'], // STOP and SWAP, for stop orders: 1 Open long (buy), 2 Open short (sell), 3 Close long (sell), 4 Close Short (Buy). One-Way Positions: 5 Buy, 6 Sell, 0 Close Only
            // 'orderType': 1, // STOP, 1: Plan order, 2: SP/SL
            // 'bizType': 1, // Plan order, 1: TP, 2: SL
            // 'status': 1, // STOP, 1: untriggered, 2: cancelled, 3:triggered, 4:failed, 5:completed
            // 'startTime': since, // STOP and SWAP
            // 'endTime': params['endTime'], // STOP and SWAP
            // 'pageNum': 1, // STOP and SWAP, default 1
            // 'pageSize': limit, // STOP, default 10
        };
        const marketIdField = swap ? 'symbol' : 'currency';
        request[marketIdField] = this.marketId (symbol);
        const orderIdField = swap ? 'orderId' : 'id';
        request[orderIdField] = id.toString ();
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PrivateGetGetOrder',
            'swap': 'contractV2PrivateGetTradeGetOrder',
        });
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     {
        //         'total_amount': 0.01,
        //         'id': '20180910244276459',
        //         'price': 180.0,
        //         'trade_date': 1536576744960,
        //         'status': 2,
        //         'trade_money': '1.96742',
        //         'trade_amount': 0.01,
        //         'type': 0,
        //         'currency': 'eth_usdt'
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "action": 1,
        //             "amount": "0.002",
        //             "availableAmount": "0.002",
        //             "availableValue": "60",
        //             "avgPrice": "0",
        //             "canCancel": true,
        //             "cancelStatus": 20,
        //             "createTime": "1646185684379",
        //             "entrustType": 1,
        //             "id": "6904603200733782016",
        //             "leverage": 2,
        //             "margin": "30",
        //             "marketId": "100",
        //             "modifyTime": "1646185684416",
        //             "price": "30000",
        //             "priority": 0,
        //             "showStatus": 1,
        //             "side": 1,
        //             "sourceType": 4,
        //             "status": 12,
        //             "tradeAmount": "0",
        //             "tradeValue": "0",
        //             "type": 1,
        //             "userId": "6896693805014120448",
        //             "value": "60"
        //         },
        //         "desc":"操作成功"
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "action": 1,
        //                     "algoPrice": "30000",
        //                     "amount": "0.003",
        //                     "bizType": 0,
        //                     "canCancel": true,
        //                     "createTime": "1649913941109",
        //                     "errorCode": 0,
        //                     "id": "6920240642849449984",
        //                     "isLong": false,
        //                     "leverage": 10,
        //                     "marketId": "100",
        //                     "modifyTime": "1649913941109",
        //                     "orderType": 1,
        //                     "priceType": 2,
        //                     "side": 5,
        //                     "sourceType": 4,
        //                     "status": 1,
        //                     "submitPrice": "41270.53",
        //                     "symbol": "BTC_USDT",
        //                     "tradedAmount": "0",
        //                     "triggerCondition": "<=",
        //                     "triggerPrice": "31000",
        //                     "triggerTime": "0",
        //                     "userId": "6896693805014120448"
        //                 },
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 10
        //         },
        //         "desc": "操作成功"
        //     }
        //
        let result = response;
        if (swap) {
            result = this.safeValue (response, 'data');
        }
        return this.parseOrder (result, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = this.safeInteger (params, 'orderType');
        const swap = market['swap'];
        const request = {
            'pageSize': limit, // default pageSize is 50 for spot, 30 for swap
            // 'currency': market['id'], // only applicable to SPOT
            // 'pageIndex': 1, // only applicable to SPOT
            // 'type': params['type'], // only applicable to SWAP
            // 'dateRange': params['dateRange'], // only applicable to SWAP
            // 'action': params['action'], // only applicable to SWAP
            // 'symbol': market['id'], // STOP and SWAP
            // 'side': params['side'], // STOP and SWAP, for stop orders: 1 Open long (buy), 2 Open short (sell), 3 Close long (sell), 4 Close Short (Buy). One-Way Positions: 5 Buy, 6 Sell, 0 Close Only
            // 'orderType': 1, // STOP, 1: Plan order, 2: SP/SL
            // 'bizType': 1, // Plan order, 1: TP, 2: SL
            // 'status': 1, // STOP, 1: untriggered, 2: cancelled, 3:triggered, 4:failed, 5:completed
            // 'startTime': since, // STOP and SWAP
            // 'endTime': params['endTime'], // STOP and SWAP
            // 'pageNum': 1, // STOP and SWAP, default 1
            // 'pageSize': limit, // STOP, default 10
        };
        const marketIdField = market['swap'] ? 'symbol' : 'currency';
        request[marketIdField] = market['id'];
        const pageNumField = market['swap'] ? 'pageNum' : 'pageIndex';
        request[pageNumField] = 1;
        if (swap) {
            request['startTime'] = since;
        }
        let method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PrivateGetGetOrdersIgnoreTradeType',
            'swap': 'contractV2PrivateGetTradeGetAllOrders',
        });
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'spotV1PrivateGetGetOrdersNew';
        }
        if (orderType !== undefined) {
            method = 'contractV2PrivateGetTradeGetOrderAlgos';
        }
        const response = await this[method] (this.extend (request, params));
        // Spot
        //
        //     [
        //         {
        //             "acctType": 0,
        //             "currency": "btc_usdt",
        //             "fees": 0,
        //             "id": "202202234857482656",
        //             "price": 30000.0,
        //             "status": 3,
        //             "total_amount": 0.0006,
        //             "trade_amount": 0.0000,
        //             "trade_date": 1645610254524,
        //             "trade_money": 0.000000,
        //             "type": 1,
        //             "useZbFee": false,
        //             "webId": 0
        //         }
        //     ]
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "action": 1,
        //                     "amount": "0.004",
        //                     "availableAmount": "0.004",
        //                     "availableValue": "120",
        //                     "avgPrice": "0",
        //                     "canCancel": true,
        //                     "cancelStatus": 20,
        //                     "createTime": "1645609643885",
        //                     "entrustType": 1,
        //                     "id": "6902187111785635850",
        //                     "leverage": 5,
        //                     "margin": "24",
        //                     "marketId": "100",
        //                     "marketName": "BTC_USDT",
        //                     "modifyTime": "1645609643889",
        //                     "price": "30000",
        //                     "showStatus": 1,
        //                     "side": 1,
        //                     "sourceType": 1,
        //                     "status": 12,
        //                     "tradeAmount": "0",
        //                     "tradeValue": "0",
        //                     "type": 1,
        //                     "userId": "6896693805014120448",
        //                     "value": "120"
        //                 },
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 10
        //         },
        //         "desc": "操作成功"
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "action": 1,
        //                     "algoPrice": "30000",
        //                     "amount": "0.003",
        //                     "bizType": 0,
        //                     "canCancel": true,
        //                     "createTime": "1649913941109",
        //                     "errorCode": 0,
        //                     "id": "6920240642849449984",
        //                     "isLong": false,
        //                     "leverage": 10,
        //                     "marketId": "100",
        //                     "modifyTime": "1649913941109",
        //                     "orderType": 1,
        //                     "priceType": 2,
        //                     "side": 5,
        //                     "sourceType": 4,
        //                     "status": 1,
        //                     "submitPrice": "41270.53",
        //                     "symbol": "BTC_USDT",
        //                     "tradedAmount": "0",
        //                     "triggerCondition": "<=",
        //                     "triggerPrice": "31000",
        //                     "triggerTime": "0",
        //                     "userId": "6896693805014120448"
        //                 },
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 10
        //         },
        //         "desc": "操作成功"
        //     }
        //
        let result = response;
        if (swap) {
            const data = this.safeValue (response, 'data', {});
            result = this.safeValue (data, 'list', []);
        }
        return this.parseOrders (result, market, since, limit);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        /**
         * @method
         * @name zb#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order, default is undefined
         * @param {int|undefined} limit max number of orders to return, default is undefined
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchCanceledOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        const stop = this.safeValue (params, 'stop');
        const request = {
            'pageSize': limit, // SPOT and STOP, default pageSize is 10, doesn't work with other values now
            // 'currency': market['id'], // SPOT
            // 'pageIndex': 1, // SPOT, default pageIndex is 1
            // 'symbol': market['id'], // STOP
            // 'side': params['side'], // STOP, for stop orders: 1 Open long (buy), 2 Open short (sell), 3 Close long (sell), 4 Close Short (Buy). One-Way Positions: 5 Buy, 6 Sell, 0 Close Only
            // 'orderType': 1, // STOP, 1: Plan order, 2: SP/SL
            // 'bizType': 1, // Plan order, 1: TP, 2: SL
            // 'status': 1, // STOP, 1: untriggered, 2: cancelled, 3:triggered, 4:failed, 5:completed
            // 'startTime': since, // STOP
            // 'endTime': params['endTime'], // STOP
            // 'pageNum': 1, // STOP, default 1
        };
        const marketIdField = market['spot'] ? 'currency' : 'symbol';
        request[marketIdField] = market['id'];
        const pageNumField = market['spot'] ? 'pageIndex' : 'pageNum';
        request[pageNumField] = 1;
        let method = 'spotV1PrivateGetGetOrdersIgnoreTradeType';
        if (stop) {
            method = 'contractV2PrivateGetTradeGetOrderAlgos';
            const orderType = this.safeInteger (params, 'orderType');
            if (orderType === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchCanceledOrders() requires an orderType parameter for stop orders');
            }
            const side = this.safeValue (params, 'side');
            const bizType = this.safeInteger (params, 'bizType');
            if (side === 'sell' && reduceOnly) {
                request['side'] = 3; // close long
            } else if (side === 'buy' && reduceOnly) {
                request['side'] = 4; // close short
            } else if (side === 'buy') {
                request['side'] = 1; // open long
            } else if (side === 'sell') {
                request['side'] = 2; // open short
            } else if (side === 5) {
                request['side'] = 5; // one way position buy
            } else if (side === 6) {
                request['side'] = 6; // one way position sell
            } else if (side === 0) {
                request['side'] = 0; // one way position close only
            }
            if (orderType === 1) {
                request['orderType'] = 1;
            } else if (orderType === 2 || bizType) {
                request['orderType'] = 2;
                request['bizType'] = bizType;
            }
            request['status'] = 2;
        }
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'spotV1PrivateGetGetOrdersNew';
        }
        let response = undefined;
        try {
            response = await this[method] (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        const query = this.omit (params, [ 'reduceOnly', 'stop', 'side', 'orderType', 'bizType' ]);
        response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     [
        //         {
        //             "acctType": 0,
        //             "currency": "btc_usdt",
        //             "fees": 0,
        //             "id": "202202234857482656",
        //             "price": 30000.0,
        //             "status": 1,
        //             "total_amount": 0.0006,
        //             "trade_amount": 0.0000,
        //             "trade_date": 1645610254524,
        //             "trade_money": 0.000000,
        //             "type": 1,
        //             "useZbFee": false,
        //             "webId": 0
        //         }
        //     ]
        //
        // Algo order
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "action": 1,
        //                     "algoPrice": "30000",
        //                     "amount": "0.003",
        //                     "bizType": 0,
        //                     "canCancel": true,
        //                     "createTime": "1649913941109",
        //                     "errorCode": 0,
        //                     "id": "6920240642849449984",
        //                     "isLong": false,
        //                     "leverage": 10,
        //                     "marketId": "100",
        //                     "modifyTime": "1649913941109",
        //                     "orderType": 1,
        //                     "priceType": 2,
        //                     "side": 5,
        //                     "sourceType": 4,
        //                     "status": 2,
        //                     "submitPrice": "41270.53",
        //                     "symbol": "BTC_USDT",
        //                     "tradedAmount": "0",
        //                     "triggerCondition": "<=",
        //                     "triggerPrice": "31000",
        //                     "triggerTime": "0",
        //                     "userId": "6896693805014120448"
        //                 },
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 10
        //         },
        //         "desc": "操作成功"
        //     }
        //
        if (stop) {
            const data = this.safeValue (response, 'data', {});
            response = this.safeValue (data, 'list', []);
        }
        const result = [];
        if (market['type'] === 'spot') {
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const status = this.safeString (entry, 'status');
                if (status === '1') {
                    result.push (entry);
                }
            }
            response = result;
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        /**
         * @method
         * @name zb#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const swap = market['swap'];
        const orderType = this.safeInteger (params, 'orderType');
        const request = {
            'pageSize': limit, // SPOT and STOP, default pageSize is 10, doesn't work with other values now
            // 'currency': market['id'], // SPOT
            // 'pageIndex': 1, // SPOT, default pageIndex is 1
            // 'symbol': market['id'], // STOP
            // 'side': params['side'], // STOP, for stop orders: 1 Open long (buy), 2 Open short (sell), 3 Close long (sell), 4 Close Short (Buy). One-Way Positions: 5 Buy, 6 Sell, 0 Close Only
            // 'orderType': 1, // STOP, 1: Plan order, 2: SP/SL
            // 'bizType': 1, // Plan order, 1: TP, 2: SL
            // 'status': 1, // STOP, 1: untriggered, 2: cancelled, 3:triggered, 4:failed, 5:completed
            // 'startTime': since, // STOP
            // 'endTime': params['endTime'], // STOP
            // 'pageNum': 1, // STOP, default 1
        };
        const marketIdField = market['spot'] ? 'currency' : 'symbol';
        request[marketIdField] = market['id'];
        const pageNumField = market['spot'] ? 'pageIndex' : 'pageNum';
        request[pageNumField] = 1;
        if (swap && (since !== undefined)) {
            request['startTime'] = since;
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PrivateGetGetFinishedAndPartialOrders',
            'swap': 'contractV2PrivateGetTradeGetOrderAlgos',
        });
        if (swap && (orderType === undefined)) {
            throw new ExchangeError (this.id + ' fetchClosedOrders() can not fetch swap orders, use fetchOrders instead');
        }
        if (swap) {
            // a status of 2 would mean canceled and could also be valid
            request['status'] = 5; // complete
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     [
        //         {
        //             "acctType": 0,
        //             "currency": "btc_usdt",
        //             "fees": 0.00823354,
        //             "id": "202204145086706337",
        //             "price": 41167.7,
        //             "status": 2,
        //             "total_amount": 0.0001,
        //             "trade_amount": 0.0001,
        //             "trade_date": 1649917867370,
        //             "trade_money": 4.116770,
        //             "type": 0,
        //             "useZbFee": false,
        //             "webId": 0
        //         },
        //     ]
        //
        // Algo order
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "action": 1,
        //                     "algoPrice": "30000",
        //                     "amount": "0.003",
        //                     "bizType": 0,
        //                     "canCancel": true,
        //                     "createTime": "1649913941109",
        //                     "errorCode": 0,
        //                     "id": "6920240642849449984",
        //                     "isLong": false,
        //                     "leverage": 10,
        //                     "marketId": "100",
        //                     "modifyTime": "1649913941109",
        //                     "orderType": 1,
        //                     "priceType": 2,
        //                     "side": 5,
        //                     "sourceType": 4,
        //                     "status": 1,
        //                     "submitPrice": "41270.53",
        //                     "symbol": "BTC_USDT",
        //                     "tradedAmount": "0",
        //                     "triggerCondition": "<=",
        //                     "triggerPrice": "31000",
        //                     "triggerTime": "0",
        //                     "userId": "6896693805014120448"
        //                 },
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 10
        //         },
        //         "desc": "操作成功"
        //     }
        //
        let result = response;
        if (swap) {
            const data = this.safeValue (response, 'data', {});
            result = this.safeValue (data, 'list', []);
        }
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = this.safeInteger (params, 'orderType');
        const swap = market['swap'];
        const request = {
            // 'pageSize': limit, // default pageSize is 10 for spot, 30 for swap
            // 'currency': market['id'], // SPOT
            // 'pageIndex': 1, // SPOT
            // 'symbol': market['id'], // SWAP and STOP
            // 'pageNum': 1, // SWAP and STOP, default 1
            // 'type': params['type'], // swap only
            // 'side': params['side'], // SWAP and STOP, for stop orders: 1 Open long (buy), 2 Open short (sell), 3 Close long (sell), 4 Close Short (Buy). One-Way Positions: 5 Buy, 6 Sell, 0 Close Only
            // 'action': params['action'], // SWAP
            // 'orderType': 1, // STOP, 1: Plan order, 2: SP/SL
            // 'bizType': 1, // Plan order, 1: TP, 2: SL
            // 'status': 1, // STOP, 1: untriggered, 2: cancelled, 3:triggered, 4:failed, 5:completed
            // 'startTime': since, // SWAP and STOP
            // 'endTime': params['endTime'], // STOP
        };
        if (limit !== undefined) {
            request['pageSize'] = limit; // default pageSize is 10 for spot, 30 for swap
        }
        const marketIdField = market['swap'] ? 'symbol' : 'currency';
        request[marketIdField] = market['id'];
        const pageNumField = market['swap'] ? 'pageNum' : 'pageIndex';
        request[pageNumField] = 1;
        if (swap && (since !== undefined)) {
            request['startTime'] = since;
        }
        let method = this.getSupportedMapping (market['type'], {
            'spot': 'spotV1PrivateGetGetUnfinishedOrdersIgnoreTradeType',
            'swap': 'contractV2PrivateGetTradeGetUndoneOrders',
        });
        if (orderType !== undefined) {
            method = 'contractV2PrivateGetTradeGetOrderAlgos';
            // value 3 would mean triggered but still open orders
            request['status'] = 1; // untriggered
        }
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'spotV1PrivateGetGetOrdersNew';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Spot
        //
        //     [
        //         {
        //             "currency": "btc_usdt",
        //             "id": "20150928158614292",
        //             "price": 1560,
        //             "status": 3,
        //             "total_amount": 0.1,
        //             "trade_amount": 0,
        //             "trade_date": 1443410396717,
        //             "trade_money": 0,
        //             "type": 0,
        //             "fees": "0.03",
        //             "useZbFee": true
        //         },
        //     ]
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "action": 1,
        //                     "amount": "0.003",
        //                     "availableAmount": "0.003",
        //                     "availableValue": "90",
        //                     "avgPrice": "0",
        //                     "canCancel": true,
        //                     "cancelStatus": 20,
        //                     "createTime": "1645694610880",
        //                     "entrustType": 1,
        //                     "id": "6902543489192632320",
        //                     "leverage": 5,
        //                     "margin": "18",
        //                     "marketId": "100",
        //                     "modifyTime": "1645694610883",
        //                     "price": "30000",
        //                     "priority": 0,
        //                     "showStatus": 1,
        //                     "side": 1,
        //                     "sourceType": 1,
        //                     "status": 12,
        //                     "tradeAmount": "0",
        //                     "tradeValue": "0",
        //                     "type": 1,
        //                     "userId": "6896693805014120448",
        //                     "value": "90"
        //                 }
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 30
        //         },
        //         "desc": "操作成功"
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "action": 1,
        //                     "algoPrice": "30000",
        //                     "amount": "0.003",
        //                     "bizType": 0,
        //                     "canCancel": true,
        //                     "createTime": "1649913941109",
        //                     "errorCode": 0,
        //                     "id": "6920240642849449984",
        //                     "isLong": false,
        //                     "leverage": 10,
        //                     "marketId": "100",
        //                     "modifyTime": "1649913941109",
        //                     "orderType": 1,
        //                     "priceType": 2,
        //                     "side": 5,
        //                     "sourceType": 4,
        //                     "status": 1,
        //                     "submitPrice": "41270.53",
        //                     "symbol": "BTC_USDT",
        //                     "tradedAmount": "0",
        //                     "triggerCondition": "<=",
        //                     "triggerPrice": "31000",
        //                     "triggerTime": "0",
        //                     "userId": "6896693805014120448"
        //                 },
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 10
        //         },
        //         "desc": "操作成功"
        //     }
        //
        let result = response;
        if (swap) {
            const data = this.safeValue (response, 'data', {});
            result = this.safeValue (data, 'list', []);
        }
        return this.parseOrders (result, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        // Spot fetchOrder, fetchClosedOrders
        //
        //     {
        //         acctType: 0,
        //         currency: 'btc_usdt',
        //         fees: 3.6e-7,
        //         id: '202102282829772463',
        //         price: 45177.5,
        //         status: 2,
        //         total_amount: 0.0002,
        //         trade_amount: 0.0002,
        //         trade_date: 1614515104998,
        //         trade_money: 8.983712,
        //         type: 1,
        //         useZbFee: false
        //     },
        //
        // Swap fetchOrder
        //
        //     {
        //         "action": 1,
        //         "amount": "0.002",
        //         "availableAmount": "0.002",
        //         "availableValue": "60",
        //         "avgPrice": "0",
        //         "canCancel": true,
        //         "cancelStatus": 20,
        //         "createTime": "1646185684379",
        //         "entrustType": 1,
        //         "id": "6904603200733782016",
        //         "leverage": 2,
        //         "margin": "30",
        //         "marketId": "100",
        //         "modifyTime": "1646185684416",
        //         "price": "30000",
        //         "priority": 0,
        //         "showStatus": 1,
        //         "side": 1,
        //         "sourceType": 4,
        //         "status": 12,
        //         "tradeAmount": "0",
        //         "tradeValue": "0",
        //         "type": 1,
        //         "userId": "6896693805014120448",
        //         "value": "60"
        //     },
        //
        // Algo fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "action": 1,
        //         "algoPrice": "30000",
        //         "amount": "0.003",
        //         "bizType": 0,
        //         "canCancel": true,
        //         "createTime": "1649913941109",
        //         "errorCode": 0,
        //         "id": "6920240642849449984",
        //         "isLong": false,
        //         "leverage": 10,
        //         "marketId": "100",
        //         "modifyTime": "1649913941109",
        //         "orderType": 1,
        //         "priceType": 2,
        //         "side": 5,
        //         "sourceType": 4,
        //         "status": 1,
        //         "submitPrice": "41270.53",
        //         "symbol": "BTC_USDT",
        //         "tradedAmount": "0",
        //         "triggerCondition": "<=",
        //         "triggerPrice": "31000",
        //         "triggerTime": "0",
        //         "userId": "6896693805014120448"
        //     },
        //
        // Spot createOrder
        //
        //     {
        //         code: '1000',
        //         message: '操作成功',
        //         id: '202202224851151555',
        //         type: '1',
        //         total_amount: 0.0002,
        //         price: 30000
        //     }
        //
        // Swap createOrder
        //
        //     {
        //         orderId: '6901786759944937472',
        //         orderCode: null,
        //         timeInForce: 'IOC',
        //         total_amount: 0.0002,
        //         price: 30000
        //     }
        //
        // Algo createOrder
        //
        //     {
        //         "code": 10000,
        //         "data": "6919884551305242624",
        //         "desc": "操作成功"
        //     }
        //
        let orderId = market['swap'] ? this.safeString2 (order, 'orderId', 'data') : this.safeString (order, 'id');
        if (orderId === undefined) {
            orderId = this.safeValue (order, 'id');
        }
        let side = this.safeInteger2 (order, 'type', 'side');
        if (side === undefined) {
            side = undefined;
        } else {
            if (market['spot']) {
                side = (side === 1) ? 'buy' : 'sell';
            } else if (market['swap']) {
                if (side === 0) {
                    side = undefined;
                } else if ((side === 1) || (side === 4) || (side === 5)) {
                    side = 'buy';
                } else if ((side === 2) || (side === 3) || (side === 6)) {
                    side = 'sell';
                }
            }
        }
        let timestamp = this.safeInteger (order, 'trade_date');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (order, 'createTime');
        }
        const marketId = this.safeString (order, 'currency');
        market = this.safeMarket (marketId, market, '_');
        const price = this.safeString2 (order, 'price', 'algoPrice');
        const filled = market['swap'] ? this.safeString (order, 'tradeAmount') : this.safeString (order, 'trade_amount');
        let amount = this.safeString (order, 'total_amount');
        if (amount === undefined) {
            amount = this.safeString (order, 'amount');
        }
        const cost = this.safeString (order, 'trade_money');
        const status = this.parseOrderStatus (this.safeString (order, 'status'), market);
        const timeInForce = this.safeString (order, 'timeInForce');
        const postOnly = (timeInForce === 'PO');
        const feeCost = this.safeNumber (order, 'fees');
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            const zbFees = this.safeValue (order, 'useZbFee');
            if (zbFees === true) {
                feeCurrency = 'ZB';
            } else {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': orderId,
            'clientOrderId': this.safeString (order, 'userId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': 'limit', // market order is not available on ZB
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': this.safeNumber (order, 'triggerPrice'),
            'average': this.safeString (order, 'avgPrice'),
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status, market = undefined) {
        let statuses = {};
        if (market['type'] === 'spot') {
            statuses = {
                '0': 'open',
                '1': 'canceled',
                '2': 'closed',
                '3': 'open', // partial
            };
        } else {
            statuses = {
                '1': 'open',
                '2': 'canceled',
                '3': 'open', // stop order triggered
                '4': 'rejected',
                '5': 'closed',
            };
        }
        return this.safeString (statuses, status, status);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '0': 'pending', // submitted, pending confirmation
            '1': 'failed',
            '2': 'ok',
            '3': 'canceled',
            '5': 'ok', // confirmed
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "id": "withdrawalId"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amount": 0.01,
        //         "fees": 0.001,
        //         "id": 2016042556231,
        //         "manageTime": 1461579340000,
        //         "status": 3,
        //         "submitTime": 1461579288000,
        //         "toAddress": "14fxEPirL9fyfw1i9EF439Pq6gQ5xijUmp",
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "address": "1FKN1DZqCm8HaTujDioRL2Aezdh7Qj7xxx",
        //         "amount": "1.00000000",
        //         "confirmTimes": 1,
        //         "currency": "BTC",
        //         "description": "Successfully Confirm",
        //         "hash": "7ce842de187c379abafadd64a5fe66c5c61c8a21fb04edff9532234a1dae6xxx",
        //         "id": 558,
        //         "itransfer": 1,
        //         "status": 2,
        //         "submit_time": "2016-12-07 18:51:57",
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'hash');
        const amount = this.safeNumber (transaction, 'amount');
        let timestamp = this.parse8601 (this.safeString (transaction, 'submit_time'));
        timestamp = this.safeInteger (transaction, 'submitTime', timestamp);
        let address = this.safeString2 (transaction, 'toAddress', 'address');
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split ('_');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        const confirmTimes = this.safeInteger (transaction, 'confirmTimes');
        const updated = this.safeInteger (transaction, 'manageTime');
        let type = undefined;
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        if (address !== undefined) {
            type = (confirmTimes === undefined) ? 'withdrawal' : 'deposit';
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fees');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name zb#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} response from the exchange
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 1) || (leverage > 125)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and 125');
        }
        const market = this.market (symbol);
        let accountType = undefined;
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' setLeverage() supports swap contracts only');
        } else {
            accountType = 1;
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
            'futuresAccountType': accountType, // 1: USDT perpetual swaps
        };
        return await this.contractV2PrivatePostSettingSetLeverage (this.extend (request, params));
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the zb api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest funding rate to fetch
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'startTime': since,
            // 'endTime': endTime, // current time by default
            // 'limit': limit, // default 100, max 1000
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'endTime', 'till', 'until' ]);
        if (until !== undefined) {
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.contractV2PublicGetFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "fundingRate": "0.0001",
        //                 "fundingTime": "1645171200000"
        //             },
        //         ],
        //         "desc": "操作成功"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.safeInteger (entry, 'fundingTime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name zb#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() does not supports contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.contractV1PublicGetFundingRate (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "desc": "操作成功",
        //         "data": {
        //             "fundingRate": "0.0001",
        //             "nextCalculateTime": "2022-02-19 00:00:00"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market = undefined) {
        //
        // fetchFundingRate
        //
        //     {
        //         "fundingRate": "0.0001",
        //         "nextCalculateTime": "2022-02-19 00:00:00"
        //     }
        //
        // fetchFundingRates
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "markPrice": "43254.42",
        //         "indexPrice": "43278.61",
        //         "lastFundingRate": "0.0001",
        //         "nextFundingTime": "1646121600000"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const fundingRate = this.safeNumber2 (contract, 'fundingRate', 'lastFundingRate');
        const nextFundingTimestamp = this.parse8601 (this.safeString (contract, 'nextCalculateTime'));
        const fundingTimestamp = this.safeInteger (contract, 'nextFundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeString (contract, 'markPrice'),
            'indexPrice': this.safeString (contract, 'indexPrice'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRates (symbols = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.contractV2PublicGetPremiumIndex (params);
        //
        //     {
        //         "code": 10000,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "markPrice": "43254.42",
        //                 "indexPrice": "43278.61",
        //                 "lastFundingRate": "0.0001",
        //                 "nextFundingTime": "1646121600000"
        //             },
        //         ],
        //         "desc":"操作成功"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = this.parseFundingRates (data);
        return this.filterByArray (result, 'symbol', symbols);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name zb#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        const password = this.safeString (params, 'safePwd', this.password);
        if (password === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires exchange.password or a safePwd parameter');
        }
        const fees = this.safeNumber (params, 'fees');
        if (fees === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a fees parameter');
        }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag !== undefined) {
            address += '_' + tag;
        }
        const request = {
            'amount': this.currencyToPrecision (code, amount),
            'currency': currency['id'],
            'fees': this.currencyToPrecision (code, fees),
            // 'itransfer': 0, // agree for an internal transfer, 0 disagree, 1 agree, the default is to disagree
            'method': 'withdraw',
            'receiveAddr': address,
            'safePwd': password,
        };
        const response = await this.spotV1PrivateGetWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "id": "withdrawalId"
        //     }
        //
        const transaction = this.parseTransaction (response, currency);
        return this.extend (transaction, {
            'type': 'withdrawal',
            'address': address,
            'addressTo': address,
            'amount': amount,
        });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'pageIndex': 1,
            // 'pageSize': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.spotV1PrivateGetGetWithdrawRecord (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "list": [
        //                     {
        //                         "amount": 0.01,
        //                         "fees": 0.001,
        //                         "id": 2016042556231,
        //                         "manageTime": 1461579340000,
        //                         "status": 3,
        //                         "submitTime": 1461579288000,
        //                         "toAddress": "14fxEPirL9fyfw1i9EF439Pq6gQ5xijUmp",
        //                     },
        //                 ],
        //                 "pageIndex": 1,
        //                 "pageSize": 10,
        //                 "totalCount": 4,
        //                 "totalPage": 1
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        const withdrawals = this.safeValue (datas, 'list', []);
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'pageIndex': 1,
            // 'pageSize': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.spotV1PrivateGetGetChargeRecord (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "list": [
        //                     {
        //                         "address": "1FKN1DZqCm8HaTujDioRL2Aezdh7Qj7xxx",
        //                         "amount": "1.00000000",
        //                         "confirmTimes": 1,
        //                         "currency": "BTC",
        //                         "description": "Successfully Confirm",
        //                         "hash": "7ce842de187c379abafadd64a5fe66c5c61c8a21fb04edff9532234a1dae6xxx",
        //                         "id": 558,
        //                         "itransfer": 1,
        //                         "status": 2,
        //                         "submit_time": "2016-12-07 18:51:57",
        //                     },
        //                 ],
        //                 "pageIndex": 1,
        //                 "pageSize": 10,
        //                 "total": 8
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        const deposits = this.safeValue (datas, 'list', []);
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchPosition (symbol, params = {}) {
        /**
         * @method
         * @name zb#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'futuresAccountType': 1, // 1: USDT-M Perpetual Futures
            // 'symbol': market['id'],
            // 'marketId': market['id'],
            // 'side': params['side'],
        };
        const response = await this.contractV2PrivateGetPositionsGetPositions (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "data": [
        //             {
        //                 "amount": "0.002",
        //                 "appendAmount": "0",
        //                 "autoLightenRatio": "0",
        //                 "avgPrice": "38570",
        //                 "bankruptcyPrice": "46288.41",
        //                 "contractType": 1,
        //                 "createTime": "1645784751867",
        //                 "freezeAmount": "0",
        //                 "freezeList": [
        //                     {
        //                         "amount": "15.436832",
        //                         "currencyId": "6",
        //                         "currencyName": "usdt",
        //                         "modifyTime": "1645784751867"
        //                     }
        //                 ],
        //                 "id": "6902921567894972486",
        //                 "lastAppendAmount": "0",
        //                 "leverage": 5,
        //                 "liquidateLevel": 1,
        //                 "liquidatePrice": "46104",
        //                 "maintainMargin": "0.30912384",
        //                 "margin": "15.436832",
        //                 "marginAppendCount": 0,
        //                 "marginBalance": "15.295872",
        //                 "marginMode": 1,
        //                 "marginRate": "0.020209",
        //                 "marketId": "100",
        //                 "marketName": "BTC_USDT",
        //                 "modifyTime": "1645784751867",
        //                 "nominalValue": "77.14736",
        //                 "originAppendAmount": "0",
        //                 "originId": "6902921567894972591",
        //                 "refreshType": "Timer",
        //                 "returnRate": "-0.0091",
        //                 "side": 0,
        //                 "status": 1,
        //                 "unrealizedPnl": "-0.14096",
        //                 "userId": "6896693805014120448"
        //             }
        //         ],
        //         "desc": "操作成功"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const firstPosition = this.safeValue (data, 0);
        return this.parsePosition (firstPosition, market);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const request = {
            'futuresAccountType': 1, // 1: USDT-M Perpetual Futures
            // 'symbol': market['id'],
            // 'marketId': market['id'],
            // 'side': params['side'],
        };
        const response = await this.contractV2PrivateGetPositionsGetPositions (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "data": [
        //             {
        //                 "amount": "0.002",
        //                 "appendAmount": "0",
        //                 "autoLightenRatio": "0",
        //                 "avgPrice": "38570",
        //                 "bankruptcyPrice": "46288.41",
        //                 "contractType": 1,
        //                 "createTime": "1645784751867",
        //                 "freezeAmount": "0",
        //                 "freezeList": [
        //                     {
        //                         "amount": "15.436832",
        //                         "currencyId": "6",
        //                         "currencyName": "usdt",
        //                         "modifyTime": "1645784751867"
        //                     }
        //                 ],
        //                 "id": "6902921567894972486",
        //                 "lastAppendAmount": "0",
        //                 "leverage": 5,
        //                 "liquidateLevel": 1,
        //                 "liquidatePrice": "46104",
        //                 "maintainMargin": "0.30912384",
        //                 "margin": "15.436832",
        //                 "marginAppendCount": 0,
        //                 "marginBalance": "15.295872",
        //                 "marginMode": 1,
        //                 "marginRate": "0.020209",
        //                 "marketId": "100",
        //                 "marketName": "BTC_USDT",
        //                 "modifyTime": "1645784751867",
        //                 "nominalValue": "77.14736",
        //                 "originAppendAmount": "0",
        //                 "originId": "6902921567894972591",
        //                 "refreshType": "Timer",
        //                 "returnRate": "-0.0091",
        //                 "side": 0,
        //                 "status": 1,
        //                 "unrealizedPnl": "-0.14096",
        //                 "userId": "6896693805014120448"
        //             },
        //         ],
        //         "desc": "操作成功"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         "amount": "0.002",
        //         "appendAmount": "0",
        //         "autoLightenRatio": "0",
        //         "avgPrice": "38570",
        //         "bankruptcyPrice": "46288.41",
        //         "contractType": 1,
        //         "createTime": "1645784751867",
        //         "freezeAmount": "0",
        //         "freezeList": [
        //             {
        //                 "amount": "15.436832",
        //                 "currencyId": "6",
        //                 "currencyName": "usdt",
        //                 "modifyTime": "1645784751867"
        //             }
        //         ],
        //         "id": "6902921567894972486",
        //         "lastAppendAmount": "0",
        //         "leverage": 5,
        //         "liquidateLevel": 1,
        //         "liquidatePrice": "46104",
        //         "maintainMargin": "0.30912384",
        //         "margin": "15.436832",
        //         "marginAppendCount": 0,
        //         "marginBalance": "15.295872",
        //         "marginMode": 1,
        //         "marginRate": "0.020209",
        //         "marketId": "100",
        //         "marketName": "BTC_USDT",
        //         "modifyTime": "1645784751867",
        //         "nominalValue": "77.14736",
        //         "originAppendAmount": "0",
        //         "originId": "6902921567894972591",
        //         "refreshType": "Timer",
        //         "returnRate": "-0.0091",
        //         "side": 0,
        //         "status": 1,
        //         "unrealizedPnl": "-0.14096",
        //         "userId": "6896693805014120448"
        //     }
        //
        const marketId = this.safeString (position, 'marketName');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const contracts = this.safeString (position, 'amount');
        const entryPrice = this.safeNumber (position, 'avgPrice');
        const initialMargin = this.safeString (position, 'margin');
        const rawSide = this.safeString (position, 'side');
        const side = (rawSide === '1') ? 'long' : 'short';
        const openType = this.safeString (position, 'marginMode');
        const marginMode = (openType === '1') ? 'isolated' : 'cross';
        const leverage = this.safeString (position, 'leverage');
        const liquidationPrice = this.safeNumber (position, 'liquidatePrice');
        const unrealizedProfit = this.safeNumber (position, 'unrealizedPnl');
        const maintenanceMargin = this.safeNumber (position, 'maintainMargin');
        const marginRatio = this.safeNumber (position, 'marginRate');
        const notional = this.safeNumber (position, 'nominalValue');
        const percentage = Precise.stringMul (this.safeString (position, 'returnRate'), '100');
        const timestamp = this.safeNumber (position, 'createTime');
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': this.parseNumber (contracts),
            'contractSize': undefined,
            'entryPrice': entryPrice,
            'collateral': undefined,
            'side': side,
            'unrealizedProfit': unrealizedProfit,
            'leverage': this.parseNumber (leverage),
            'percentage': percentage,
            'marginMode': marginMode,
            'notional': notional,
            'markPrice': undefined,
            'liquidationPrice': liquidationPrice,
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': undefined,
            'marginRatio': marginRatio,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            '1': 'realized pnl',
            '2': 'commission',
            '3': 'funding fee subtract',
            '4': 'funding fee addition',
            '5': 'insurance clear',
            '6': 'transfer in',
            '7': 'transfer out',
            '8': 'margin addition',
            '9': 'margin subtraction',
            '10': 'commission addition',
            '11': 'bill type freeze',
            '12': 'bill type unfreeze',
            '13': 'system take over margin',
            '14': 'transfer',
            '15': 'realized pnl collection',
            '16': 'funding fee collection',
            '17': 'recommender return commission',
            '18': 'by level subtract positions',
            '19': 'system add',
            '20': 'system subtract',
            '23': 'trading competition take over fund',
            '24': 'trading contest tickets',
            '25': 'return of trading contest tickets',
            '26': 'experience expired recall',
            '50': 'test register gift',
            '51': 'register gift',
            '52': 'deposit gift',
            '53': 'trading volume gift',
            '54': 'awards gift',
            '55': 'trading volume gift',
            '56': 'awards gift expire',
            '201': 'open positions',
            '202': 'close positions',
            '203': 'take over positions',
            '204': 'trading competition take over positions',
            '205': 'one way open long',
            '206': 'one way open short',
            '207': 'one way close long',
            '208': 'one way close short',
            '301': 'coupon deduction service charge',
            '302': 'experience deduction',
            '303': 'experience expired',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     [
        //         {
        //             "type": 3,
        //             "changeAmount": "0.00434664",
        //             "isIn": 0,
        //             "beforeAmount": "30.53353135",
        //             "beforeFreezeAmount": "21.547",
        //             "createTime": "1646121604997",
        //             "available": "30.52918471",
        //             "unit": "usdt",
        //             "symbol": "BTC_USDT"
        //         },
        //     ],
        //
        const timestamp = this.safeInteger (item, 'createTime');
        let direction = undefined;
        const changeDirection = this.safeNumber (item, 'isIn');
        if (changeDirection === 1) {
            direction = 'increase';
        } else {
            direction = 'reduce';
        }
        let fee = undefined;
        const feeCost = this.safeNumber (item, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (item, 'unit')),
            };
        }
        return {
            'id': this.safeString (item, 'id'),
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': this.safeString (item, 'userId'),
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType (this.safeInteger (item, 'type')),
            'currency': this.safeCurrencyCode (this.safeString (item, 'unit')),
            'amount': this.safeNumber (item, 'changeAmount'),
            'before': this.safeNumber (item, 'beforeAmount'),
            'after': this.safeNumber (item, 'available'),
            'status': undefined,
            'fee': fee,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name zb#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchLedger() requires a code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'futuresAccountType': 1,
            // 'currencyId': '11',
            // 'type': 1,
            // 'endTime': this.milliseconds (),
            // 'pageNum': 1,
        };
        if (code !== undefined) {
            request['currencyName'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.contractV2PrivateGetFundGetBill (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "list": [
        //                 {
        //                     "type": 3,
        //                     "changeAmount": "0.00434664",
        //                     "isIn": 0,
        //                     "beforeAmount": "30.53353135",
        //                     "beforeFreezeAmount": "21.547",
        //                     "createTime": "1646121604997",
        //                     "available": "30.52918471",
        //                     "unit": "usdt",
        //                     "symbol": "BTC_USDT"
        //                 },
        //             ],
        //             "pageNum": 1,
        //             "pageSize": 10
        //         },
        //         "desc": "操作成功"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const list = this.safeValue (data, 'list', []);
        return this.parseLedger (list, currency, since, limit);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name zb#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the zb api endpoint
         * @param {string} params.marginMode 'cross' or 'isolated'
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const [ marketType, marketTypeQuery ] = this.handleMarketTypeAndParams ('transfer', undefined, params);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('transfer', marketTypeQuery);
        const currency = this.currency (code);
        const swap = (marketType === 'swap');
        const amountToPrecision = this.currencyToPrecision (code, amount);
        const request = {
            'amount': amountToPrecision, // Swap, Cross Margin, Isolated Margin
            // 'coin': currency['id'], // Margin
            // 'currencyName': currency['id'], // Swap
            // 'clientId': this.safeString (params, 'clientId'), // Swap "2sdfsdfsdf232342"
            // 'side': side, // Swap, 1：Deposit (zb account -> futures account)，0：Withdrawal (futures account -> zb account)
            // 'marketName': this.safeString (params, 'marketName'), // Isolated Margin
        };
        let method = undefined;
        let side = undefined;
        if (swap) {
            method = 'contractV2PrivatePostFundTransferFund';
            if (fromAccount === 'spot' || toAccount === 'future') {
                side = 1;
            } else {
                side = 0;
            }
            request['currencyName'] = currency['id'];
            request['clientId'] = this.safeString (params, 'clientId');
            request['side'] = side;
        } else {
            if ((marginMode === 'isolated') || (toAccount === 'isolated') || (fromAccount === 'isolated')) {
                if (fromAccount === 'spot' || toAccount === 'isolated') {
                    method = 'spotV1PrivateGetTransferInLever';
                } else {
                    method = 'spotV1PrivateGetTransferOutLever';
                }
                const symbol = this.safeString2 (params, 'marketName', 'symbol');
                if (symbol === undefined) {
                    throw new ArgumentsRequired (this.id + ' transfer() requires a symbol argument for isolated margin');
                }
                const market = this.market (symbol);
                request['marketName'] = this.safeSymbol (market['id'], market, '_');
            } else if ((marginMode === 'cross') || (toAccount === 'cross') || (fromAccount === 'cross')) {
                if (fromAccount === 'spot' || toAccount === 'cross') {
                    method = 'spotV1PrivateGetTransferInCross';
                } else {
                    method = 'spotV1PrivateGetTransferOutCross';
                }
            }
            request['coin'] = currency['id'];
        }
        const response = await this[method] (this.extend (request, query));
        //
        // Swap
        //
        //     {
        //         "code": 10000,
        //         "data": "2sdfsdfsdf232342",
        //         "desc": "Success"
        //     }
        //
        // Margin
        //
        //     {
        //         "code": 1000,
        //         "message": "Success"
        //     }
        //
        return this.extend (this.parseTransfer (response, currency), {
            'amount': this.parseNumber (amountToPrecision),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }

    parseTransfer (transfer, currency = undefined) {
        // response samples in 'transfer'
        const timestamp = this.milliseconds ();
        return {
            'id': this.safeString (transfer, 'data'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (undefined, 'currency'),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }

    async modifyMarginHelper (symbol, amount, type, params = {}) {
        if (params['positionsId'] === undefined) {
            throw new ArgumentsRequired (this.id + ' modifyMarginHelper() requires a positionsId argument in the params');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        amount = this.amountToPrecision (symbol, amount);
        const position = this.safeString (params, 'positionsId');
        const request = {
            'positionsId': position,
            'amount': amount,
            'type': type, // 1 increase, 0 reduce
            'futuresAccountType': 1, // 1: USDT Perpetual Futures
        };
        const response = await this.contractV2PrivatePostPositionsUpdateMargin (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "data": {
        //             "amount": "0.002",
        //             "appendAmount": "0",
        //             "avgPrice": "43927.23",
        //             "bankruptcyPrice": "41730.86",
        //             "createTime": "1646208695609",
        //             "freezeAmount": "0",
        //             "id": "6900781818669377576",
        //             "keyMark": "6896693805014120448-100-1-",
        //             "lastAppendAmount": "0",
        //             "lastTime": "1646209235505",
        //             "leverage": 20,
        //             "liquidateLevel": 1,
        //             "liquidatePrice": "41898.46",
        //             "maintainMargin": "0",
        //             "margin": "4.392723",
        //             "marginAppendCount": 0,
        //             "marginBalance": "0",
        //             "marginMode": 1,
        //             "marginRate": "0",
        //             "marketId": "100",
        //             "marketName": "BTC_USDT",
        //             "modifyTime": "1646209235505",
        //             "nominalValue": "87.88828",
        //             "originAppendAmount": "0",
        //             "originId": "6904699716827818029",
        //             "positionsMode": 2,
        //             "sellerCurrencyId": "1",
        //             "side": 1,
        //             "status": 1,
        //             "unrealizedPnl": "0.03382",
        //             "usable": true,
        //             "userId": "6896693805014120448"
        //         },
        //         "desc":"操作成功"
        //     }
        //
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
        });
    }

    parseMarginModification (data, market = undefined) {
        const innerData = this.safeValue (data, 'data', {});
        const sideRaw = this.safeInteger (innerData, 'side');
        const side = (sideRaw === 1) ? 'add' : 'reduce';
        const statusCode = this.safeInteger (innerData, 'status');
        const status = (statusCode === 1) ? 'ok' : 'failed';
        return {
            'info': data,
            'type': side,
            'amount': undefined,
            'code': market['quote'],
            'symbol': market['symbol'],
            'status': status,
        };
    }

    async addMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name zb#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#add-margin-structure}
         */
        if (params['positionsId'] === undefined) {
            throw new ArgumentsRequired (this.id + ' addMargin() requires a positionsId argument in the params');
        }
        return await this.modifyMarginHelper (symbol, amount, 1, params);
    }

    async reduceMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name zb#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#reduce-margin-structure}
         */
        if (params['positionsId'] === undefined) {
            throw new ArgumentsRequired (this.id + ' reduceMargin() requires a positionsId argument in the params');
        }
        return await this.modifyMarginHelper (symbol, amount, 0, params);
    }

    async fetchBorrowRate (code, params = {}) {
        /**
         * @method
         * @name zb#fetchBorrowRate
         * @description fetch the rate of interest to borrow a currency for margin trading
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.spotV1PrivateGetGetLoans (this.extend (request, params));
        //
        //     {
        //         code: '1000',
        //         message: '操作成功',
        //         result: [
        //             {
        //                 interestRateOfDay: '0.0005',
        //                 repaymentDay: '30',
        //                 amount: '148804.4841',
        //                 balance: '148804.4841',
        //                 rateOfDayShow: '0.05 %',
        //                 coinName: 'USDT',
        //                 lowestAmount: '0.01'
        //             },
        //         ]
        //     }
        //
        const timestamp = this.milliseconds ();
        const data = this.safeValue (response, 'result', []);
        const rate = this.safeValue (data, 0, {});
        return {
            'currency': this.safeCurrencyCode (this.safeString (rate, 'coinName')),
            'rate': this.safeNumber (rate, 'interestRateOfDay'),
            'period': this.safeNumber (rate, 'repaymentDay'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': rate,
        };
    }

    async fetchBorrowRates (params = {}) {
        /**
         * @method
         * @name zb#fetchBorrowRates
         * @description fetch the borrow interest rates of all currencies
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure}
         */
        if (params['coin'] === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBorrowRates() requires a coin argument in the params');
        }
        await this.loadMarkets ();
        const currency = this.currency (this.safeString (params, 'coin'));
        const request = {
            'coin': currency['id'],
        };
        const response = await this.spotV1PrivateGetGetLoans (this.extend (request, params));
        //
        //     {
        //         code: '1000',
        //         message: '操作成功',
        //         result: [
        //             {
        //                 interestRateOfDay: '0.0005',
        //                 repaymentDay: '30',
        //                 amount: '148804.4841',
        //                 balance: '148804.4841',
        //                 rateOfDayShow: '0.05 %',
        //                 coinName: 'USDT',
        //                 lowestAmount: '0.01'
        //             },
        //         ]
        //     }
        //
        const timestamp = this.milliseconds ();
        const data = this.safeValue (response, 'result', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            rates.push ({
                'currency': this.safeCurrencyCode (this.safeString (entry, 'coinName')),
                'rate': this.safeNumber (entry, 'interestRateOfDay'),
                'period': this.safeNumber (entry, 'repaymentDay'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'info': entry,
            });
        }
        return rates;
    }

    async setPositionMode (hedged, symbol = undefined, params = {}) {
        /**
         * @method
         * @name zb#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the zb api endpoint
         * @returns {object} response from the exchange
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setPositionMode() requires a symbol argument');
        }
        const market = this.market (symbol);
        let accountType = undefined;
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' setPositionMode() supports swap contracts only');
        } else {
            accountType = 1;
        }
        const request = {
            'marketId': market['id'],
            'positionMode': hedged ? 2 : 1,
            'futuresAccountType': accountType, // 1: USDT perpetual swaps, 2: QC perpetual futures
        };
        const response = await this.contractV2PrivatePostSettingSetPositionsMode (this.extend (request, params));
        //
        //     {
        //         "code": 10000,
        //         "desc": "success",
        //         "data": {
        //             "userId": 111,
        //             "marketId": 100,
        //             "leverage": 20,
        //             "marginMode": 1,
        //             "positionsMode": 2,
        //             "enableAutoAppend": 1,
        //             "maxAppendAmount": "11212",
        //             "marginCoins": "qc,usdt,eth",
        //             "id": 6737268451833817088,
        //             "createTime": 1606289971312,
        //             "modifyTime": 0,
        //             "extend": null
        //         }
        //     }
        //
        return response;
    }

    async borrowMargin (code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name zb#borrowMargin
         * @description create a loan to borrow margin
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {string|undefined} symbol unified market symbol, required for isolated margin
         * @param {object} params extra parameters specific to the zb api endpoint
         * @param {string} params.safePwd transaction password, extra parameter required for cross margin
         * @param {string} params.marginMode 'cross' or 'isolated'
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/en/latest/manual.html#margin-loan-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('borrowMargin', params);
        if (marginMode === undefined) {
            if (symbol !== undefined) {
                marginMode = 'isolated'; // default to isolated if the symbol is defined
            } else {
                marginMode = 'cross'; // default to cross
            }
        }
        const password = this.safeString (params, 'safePwd', this.password);
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'safePwd': password, // transaction password
        };
        let method = undefined;
        if (marginMode === 'isolated') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' borrowMargin() requires a symbol argument for isolated margin');
            }
            const market = this.market (symbol);
            request['marketName'] = this.safeSymbol (market['id'], market, '_');
            method = 'spotV1PrivateGetBorrow';
        } else if (marginMode === 'cross') {
            method = 'spotV1PrivateGetDoCrossLoan';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "操作成功"
        //     }
        //
        const transaction = this.parseMarginLoan (response, currency);
        return this.extend (transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }

    parseMarginLoan (info, currency = undefined) {
        //
        //     {
        //         "code": 1000,
        //         "message": "操作成功"
        //     }
        //
        return {
            'id': undefined,
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, version, access ] = api;
        let url = this.implodeHostname (this.urls['api'][section][version][access]);
        if (access === 'public') {
            if (path === 'getFeeInfo') {
                url = this.implodeHostname (this.urls['api'][section][version]['private']) + '/' + path;
            } else {
                url += '/' + version + '/' + path;
            }
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (section === 'contract') {
            const timestamp = this.milliseconds ();
            const iso8601 = this.iso8601 (timestamp);
            let signedString = iso8601 + method + '/Server/api/' + version + '/' + path;
            params = this.keysort (params);
            headers = {
                'ZB-APIKEY': this.apiKey,
                'ZB-TIMESTAMP': iso8601,
                // 'ZB-LAN': 'cn', // cn, en, kr
            };
            url += '/' + version + '/' + path;
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (params);
                signedString += this.urlencode (params);
            } else {
                if (Object.keys (params).length) {
                    const query = this.urlencode (params);
                    url += '?' + query;
                    signedString += query;
                }
            }
            const secret = this.hash (this.encode (this.secret), 'sha1');
            const signature = this.hmac (this.encode (signedString), this.encode (secret), 'sha256', 'base64');
            headers['ZB-SIGN'] = signature;
        } else {
            let query = this.keysort (this.extend ({
                'method': path,
                'accesskey': this.apiKey,
            }, params));
            const nonce = this.nonce ();
            query = this.keysort (query);
            const auth = this.rawencode (query);
            const secret = this.hash (this.encode (this.secret), 'sha1');
            const signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            const suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (body[0] === '{') {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            if ('code' in response) {
                const code = this.safeString (response, 'code');
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                if ((code !== '1000') && (code !== '10000')) {
                    throw new ExchangeError (feedback);
                }
            }
            // special case for {"result":false,"message":"服务端忙碌"} (a "Busy Server" reply)
            const result = this.safeValue (response, 'result');
            if (result !== undefined) {
                if (!result) {
                    const message = this.safeString (response, 'message');
                    if (message === '服务端忙碌') {
                        throw new ExchangeNotAvailable (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
