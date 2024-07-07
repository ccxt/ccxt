'use strict';

var xt$1 = require('./abstract/xt.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var errors = require('./base/errors.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class xt extends xt$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'xt',
            'name': 'XT',
            'countries': ['SC'],
            // spot api ratelimits are undefined, 10/s/ip, 50/s/ip, 100/s/ip or 200/s/ip
            // futures 3 requests per second => 1000ms / (100 * 3.33) = 3.003 (get assets -> fetchMarkets & fetchCurrencies)
            // futures 10 requests per second => 1000ms / (100 * 1) = 10 (all other)
            // futures 1000 times per minute for each single IP -> Otherwise account locked for 10min
            'rateLimit': 100,
            'version': 'v4',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL3OrderBook': false,
                'fetchLedger': true,
                'fetchLedgerEntry': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrdersByStatus': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': true,
                'repayMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
            },
            'precisionMode': number.TICK_SIZE,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/14319357/232636712-466df2fc-560a-4ca4-aab2-b1d954a58e24.jpg',
                'api': {
                    'spot': 'https://sapi.xt.com',
                    'linear': 'https://fapi.xt.com',
                    'inverse': 'https://dapi.xt.com',
                    'user': 'https://api.xt.com',
                },
                'www': 'https://xt.com',
                'referral': 'https://www.xt.com/en/accounts/register?ref=9PTM9VW',
                'doc': [
                    'https://doc.xt.com/',
                    'https://github.com/xtpub/api-doc',
                ],
                'fees': 'https://www.xt.com/en/rate',
            },
            'api': {
                'public': {
                    'spot': {
                        'get': {
                            'currencies': 1,
                            'depth': 0.05,
                            'kline': 0.1,
                            'symbol': 1,
                            'ticker': 1,
                            'ticker/book': 1,
                            'ticker/price': 1,
                            'ticker/24h': 1,
                            'time': 1,
                            'trade/history': 0.1,
                            'trade/recent': 0.1,
                            'wallet/support/currency': 1,
                        },
                    },
                    'linear': {
                        'get': {
                            'future/market/v1/public/contract/risk-balance': 1,
                            'future/market/v1/public/contract/open-interest': 1,
                            'future/market/v1/public/leverage/bracket/detail': 1,
                            'future/market/v1/public/leverage/bracket/list': 1,
                            'future/market/v1/public/q/agg-ticker': 1,
                            'future/market/v1/public/q/agg-tickers': 1,
                            'future/market/v1/public/q/deal': 1,
                            'future/market/v1/public/q/depth': 1,
                            'future/market/v1/public/q/funding-rate': 1,
                            'future/market/v1/public/q/funding-rate-record': 1,
                            'future/market/v1/public/q/index-price': 1,
                            'future/market/v1/public/q/kline': 1,
                            'future/market/v1/public/q/mark-price': 1,
                            'future/market/v1/public/q/symbol-index-price': 1,
                            'future/market/v1/public/q/symbol-mark-price': 1,
                            'future/market/v1/public/q/ticker': 1,
                            'future/market/v1/public/q/tickers': 1,
                            'future/market/v1/public/symbol/coins': 3.33,
                            'future/market/v1/public/symbol/detail': 3.33,
                            'future/market/v1/public/symbol/list': 1,
                        },
                    },
                    'inverse': {
                        'get': {
                            'future/market/v1/public/contract/risk-balance': 1,
                            'future/market/v1/public/contract/open-interest': 1,
                            'future/market/v1/public/leverage/bracket/detail': 1,
                            'future/market/v1/public/leverage/bracket/list': 1,
                            'future/market/v1/public/q/agg-ticker': 1,
                            'future/market/v1/public/q/agg-tickers': 1,
                            'future/market/v1/public/q/deal': 1,
                            'future/market/v1/public/q/depth': 1,
                            'future/market/v1/public/q/funding-rate': 1,
                            'future/market/v1/public/q/funding-rate-record': 1,
                            'future/market/v1/public/q/index-price': 1,
                            'future/market/v1/public/q/kline': 1,
                            'future/market/v1/public/q/mark-price': 1,
                            'future/market/v1/public/q/symbol-index-price': 1,
                            'future/market/v1/public/q/symbol-mark-price': 1,
                            'future/market/v1/public/q/ticker': 1,
                            'future/market/v1/public/q/tickers': 1,
                            'future/market/v1/public/symbol/coins': 3.33,
                            'future/market/v1/public/symbol/detail': 3.33,
                            'future/market/v1/public/symbol/list': 1,
                        },
                    },
                },
                'private': {
                    'spot': {
                        'get': {
                            'balance': 1,
                            'balances': 1,
                            'batch-order': 1,
                            'deposit/address': 1,
                            'deposit/history': 1,
                            'history-order': 1,
                            'open-order': 1,
                            'order': 1,
                            'order/{orderId}': 1,
                            'trade': 1,
                            'withdraw/history': 1,
                        },
                        'post': {
                            'order': 0.2,
                            'withdraw': 1,
                            'balance/transfer': 1,
                            'balance/account/transfer': 1,
                        },
                        'delete': {
                            'batch-order': 1,
                            'open-order': 1,
                            'order/{orderId}': 1,
                        },
                    },
                    'linear': {
                        'get': {
                            'future/trade/v1/entrust/plan-detail': 1,
                            'future/trade/v1/entrust/plan-list': 1,
                            'future/trade/v1/entrust/plan-list-history': 1,
                            'future/trade/v1/entrust/profit-detail': 1,
                            'future/trade/v1/entrust/profit-list': 1,
                            'future/trade/v1/order/detail': 1,
                            'future/trade/v1/order/list': 1,
                            'future/trade/v1/order/list-history': 1,
                            'future/trade/v1/order/trade-list': 1,
                            'future/user/v1/account/info': 1,
                            'future/user/v1/balance/bills': 1,
                            'future/user/v1/balance/detail': 1,
                            'future/user/v1/balance/funding-rate-list': 1,
                            'future/user/v1/balance/list': 1,
                            'future/user/v1/position/adl': 1,
                            'future/user/v1/position/list': 1,
                            'future/user/v1/user/collection/list': 1,
                            'future/user/v1/user/listen-key': 1,
                        },
                        'post': {
                            'future/trade/v1/entrust/cancel-all-plan': 1,
                            'future/trade/v1/entrust/cancel-all-profit-stop': 1,
                            'future/trade/v1/entrust/cancel-plan': 1,
                            'future/trade/v1/entrust/cancel-profit-stop': 1,
                            'future/trade/v1/entrust/create-plan': 1,
                            'future/trade/v1/entrust/create-profit': 1,
                            'future/trade/v1/entrust/update-profit-stop': 1,
                            'future/trade/v1/order/cancel': 1,
                            'future/trade/v1/order/cancel-all': 1,
                            'future/trade/v1/order/create': 1,
                            'future/trade/v1/order/create-batch': 1,
                            'future/user/v1/account/open': 1,
                            'future/user/v1/position/adjust-leverage': 1,
                            'future/user/v1/position/auto-margin': 1,
                            'future/user/v1/position/close-all': 1,
                            'future/user/v1/position/margin': 1,
                            'future/user/v1/user/collection/add': 1,
                            'future/user/v1/user/collection/cancel': 1,
                        },
                    },
                    'inverse': {
                        'get': {
                            'future/trade/v1/entrust/plan-detail': 1,
                            'future/trade/v1/entrust/plan-list': 1,
                            'future/trade/v1/entrust/plan-list-history': 1,
                            'future/trade/v1/entrust/profit-detail': 1,
                            'future/trade/v1/entrust/profit-list': 1,
                            'future/trade/v1/order/detail': 1,
                            'future/trade/v1/order/list': 1,
                            'future/trade/v1/order/list-history': 1,
                            'future/trade/v1/order/trade-list': 1,
                            'future/user/v1/account/info': 1,
                            'future/user/v1/balance/bills': 1,
                            'future/user/v1/balance/detail': 1,
                            'future/user/v1/balance/funding-rate-list': 1,
                            'future/user/v1/balance/list': 1,
                            'future/user/v1/position/adl': 1,
                            'future/user/v1/position/list': 1,
                            'future/user/v1/user/collection/list': 1,
                            'future/user/v1/user/listen-key': 1,
                        },
                        'post': {
                            'future/trade/v1/entrust/cancel-all-plan': 1,
                            'future/trade/v1/entrust/cancel-all-profit-stop': 1,
                            'future/trade/v1/entrust/cancel-plan': 1,
                            'future/trade/v1/entrust/cancel-profit-stop': 1,
                            'future/trade/v1/entrust/create-plan': 1,
                            'future/trade/v1/entrust/create-profit': 1,
                            'future/trade/v1/entrust/update-profit-stop': 1,
                            'future/trade/v1/order/cancel': 1,
                            'future/trade/v1/order/cancel-all': 1,
                            'future/trade/v1/order/create': 1,
                            'future/trade/v1/order/create-batch': 1,
                            'future/user/v1/account/open': 1,
                            'future/user/v1/position/adjust-leverage': 1,
                            'future/user/v1/position/auto-margin': 1,
                            'future/user/v1/position/close-all': 1,
                            'future/user/v1/position/margin': 1,
                            'future/user/v1/user/collection/add': 1,
                            'future/user/v1/user/collection/cancel': 1,
                        },
                    },
                    'user': {
                        'get': {
                            'user/account': 1,
                            'user/account/api-key': 1,
                        },
                        'post': {
                            'user/account': 1,
                            'user/account/api-key': 1,
                        },
                        'put': {
                            'user/account/api-key': 1,
                        },
                        'delete': {
                            'user/account/{apikeyId}': 1,
                        },
                    },
                },
            },
            'fees': {
                'spot': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber('0.002'),
                    'taker': this.parseNumber('0.002'),
                    'tiers': {
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.002')],
                            [this.parseNumber('5000'), this.parseNumber('0.0018')],
                            [this.parseNumber('10000'), this.parseNumber('0.0016')],
                            [this.parseNumber('20000'), this.parseNumber('0.0014')],
                            [this.parseNumber('50000'), this.parseNumber('0.0012')],
                            [this.parseNumber('150000'), this.parseNumber('0.0010')],
                            [this.parseNumber('300000'), this.parseNumber('0.0008')],
                            [this.parseNumber('600000'), this.parseNumber('0.0007')],
                            [this.parseNumber('1200000'), this.parseNumber('0.0006')],
                            [this.parseNumber('2500000'), this.parseNumber('0.0005')],
                            [this.parseNumber('6000000'), this.parseNumber('0.0004')],
                            [this.parseNumber('15000000'), this.parseNumber('0.0003')],
                            [this.parseNumber('30000000'), this.parseNumber('0.0002')],
                        ],
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.002')],
                            [this.parseNumber('5000'), this.parseNumber('0.0018')],
                            [this.parseNumber('10000'), this.parseNumber('0.0016')],
                            [this.parseNumber('20000'), this.parseNumber('0.0014')],
                            [this.parseNumber('50000'), this.parseNumber('0.0012')],
                            [this.parseNumber('150000'), this.parseNumber('0.0010')],
                            [this.parseNumber('300000'), this.parseNumber('0.0008')],
                            [this.parseNumber('600000'), this.parseNumber('0.0007')],
                            [this.parseNumber('1200000'), this.parseNumber('0.0006')],
                            [this.parseNumber('2500000'), this.parseNumber('0.0005')],
                            [this.parseNumber('6000000'), this.parseNumber('0.0004')],
                            [this.parseNumber('15000000'), this.parseNumber('0.0003')],
                            [this.parseNumber('30000000'), this.parseNumber('0.0002')],
                        ],
                    },
                },
                'contract': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber('0.0004'),
                    'taker': this.parseNumber('0.0006'),
                    'tiers': {
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.0004')],
                            [this.parseNumber('200000'), this.parseNumber('0.00038')],
                            [this.parseNumber('1000000'), this.parseNumber('0.00036')],
                            [this.parseNumber('5000000'), this.parseNumber('0.00034')],
                            [this.parseNumber('10000000'), this.parseNumber('0.00032')],
                            [this.parseNumber('15000000'), this.parseNumber('0.00028')],
                            [this.parseNumber('30000000'), this.parseNumber('0.00024')],
                            [this.parseNumber('50000000'), this.parseNumber('0.0002')],
                            [this.parseNumber('100000000'), this.parseNumber('0.00016')],
                            [this.parseNumber('300000000'), this.parseNumber('0.00012')],
                            [this.parseNumber('500000000'), this.parseNumber('0.00008')],
                        ],
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0006')],
                            [this.parseNumber('200000'), this.parseNumber('0.000588')],
                            [this.parseNumber('1000000'), this.parseNumber('0.00057')],
                            [this.parseNumber('5000000'), this.parseNumber('0.00054')],
                            [this.parseNumber('10000000'), this.parseNumber('0.00051')],
                            [this.parseNumber('15000000'), this.parseNumber('0.00048')],
                            [this.parseNumber('30000000'), this.parseNumber('0.00045')],
                            [this.parseNumber('50000000'), this.parseNumber('0.00045')],
                            [this.parseNumber('100000000'), this.parseNumber('0.00036')],
                            [this.parseNumber('300000000'), this.parseNumber('0.00033')],
                            [this.parseNumber('500000000'), this.parseNumber('0.0003')],
                        ],
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '400': errors.NetworkError,
                    '404': errors.ExchangeError,
                    '429': errors.RateLimitExceeded,
                    '500': errors.ExchangeError,
                    '502': errors.ExchangeError,
                    '503': errors.OnMaintenance,
                    'AUTH_001': errors.AuthenticationError,
                    'AUTH_002': errors.AuthenticationError,
                    'AUTH_003': errors.AuthenticationError,
                    'AUTH_004': errors.AuthenticationError,
                    'AUTH_005': errors.AuthenticationError,
                    'AUTH_006': errors.AuthenticationError,
                    'AUTH_007': errors.AuthenticationError,
                    'AUTH_101': errors.AuthenticationError,
                    'AUTH_102': errors.AuthenticationError,
                    'AUTH_103': errors.AuthenticationError,
                    'AUTH_104': errors.AuthenticationError,
                    'AUTH_105': errors.AuthenticationError,
                    'AUTH_106': errors.PermissionDenied,
                    'SYMBOL_001': errors.BadSymbol,
                    'SYMBOL_002': errors.BadSymbol,
                    'SYMBOL_003': errors.BadSymbol,
                    'SYMBOL_004': errors.BadSymbol,
                    'SYMBOL_005': errors.BadSymbol,
                    'ORDER_001': errors.InvalidOrder,
                    'ORDER_002': errors.InsufficientFunds,
                    'ORDER_003': errors.InvalidOrder,
                    'ORDER_004': errors.InvalidOrder,
                    'ORDER_005': errors.InvalidOrder,
                    'ORDER_006': errors.InvalidOrder,
                    'ORDER_007': errors.PermissionDenied,
                    'ORDER_F0101': errors.InvalidOrder,
                    'ORDER_F0102': errors.InvalidOrder,
                    'ORDER_F0103': errors.InvalidOrder,
                    'ORDER_F0201': errors.InvalidOrder,
                    'ORDER_F0202': errors.InvalidOrder,
                    'ORDER_F0203': errors.InvalidOrder,
                    'ORDER_F0301': errors.InvalidOrder,
                    'ORDER_F0401': errors.InvalidOrder,
                    'ORDER_F0501': errors.InvalidOrder,
                    'ORDER_F0502': errors.InvalidOrder,
                    'ORDER_F0601': errors.InvalidOrder,
                    'COMMON_001': errors.ExchangeError,
                    'COMMON_002': errors.ExchangeError,
                    'COMMON_003': errors.BadRequest,
                    'CURRENCY_001': errors.BadRequest,
                    'DEPOSIT_001': errors.BadRequest,
                    'DEPOSIT_002': errors.PermissionDenied,
                    'DEPOSIT_003': errors.BadRequest,
                    'DEPOSIT_004': errors.BadRequest,
                    'DEPOSIT_005': errors.BadRequest,
                    'DEPOSIT_006': errors.BadRequest,
                    'DEPOSIT_007': errors.BadRequest,
                    'DEPOSIT_008': errors.BadRequest,
                    'WITHDRAW_001': errors.BadRequest,
                    'WITHDRAW_002': errors.BadRequest,
                    'WITHDRAW_003': errors.PermissionDenied,
                    'WITHDRAW_004': errors.BadRequest,
                    'WITHDRAW_005': errors.BadRequest,
                    'WITHDRAW_006': errors.BadRequest,
                    'WITHDRAW_008': errors.PermissionDenied,
                    'WITHDRAW_009': errors.PermissionDenied,
                    'WITHDRAW_010': errors.BadRequest,
                    'WITHDRAW_011': errors.InsufficientFunds,
                    'WITHDRAW_012': errors.PermissionDenied,
                    'WITHDRAW_013': errors.PermissionDenied,
                    'WITHDRAW_014': errors.BadRequest,
                    'WITHDRAW_015': errors.BadRequest,
                    'WITHDRAW_016': errors.BadRequest,
                    'WITHDRAW_017': errors.BadRequest,
                    'WITHDRAW_018': errors.BadRequest,
                    'WITHDRAW_019': errors.BadRequest,
                    'WITHDRAW_020': errors.PermissionDenied,
                    'WITHDRAW_021': errors.PermissionDenied,
                    'WITHDRAW_022': errors.BadRequest,
                    'WITHDRAW_023': errors.BadRequest,
                    'WITHDRAW_024': errors.BadRequest,
                    'WITHDRAW_025': errors.BadRequest,
                    'FUND_001': errors.BadRequest,
                    'FUND_002': errors.InsufficientFunds,
                    'FUND_003': errors.BadRequest,
                    'FUND_004': errors.ExchangeError,
                    'FUND_005': errors.PermissionDenied,
                    'FUND_014': errors.BadRequest,
                    'FUND_015': errors.BadRequest,
                    'FUND_016': errors.BadRequest,
                    'FUND_017': errors.BadRequest,
                    'FUND_018': errors.BadRequest,
                    'FUND_019': errors.BadRequest,
                    'FUND_020': errors.BadRequest,
                    'FUND_021': errors.BadRequest,
                    'FUND_022': errors.BadRequest,
                    'FUND_044': errors.BadRequest,
                    'TRANSFER_001': errors.BadRequest,
                    'TRANSFER_002': errors.InsufficientFunds,
                    'TRANSFER_003': errors.BadRequest,
                    'TRANSFER_004': errors.PermissionDenied,
                    'TRANSFER_005': errors.PermissionDenied,
                    'TRANSFER_006': errors.PermissionDenied,
                    'TRANSFER_007': errors.RequestTimeout,
                    'TRANSFER_008': errors.BadRequest,
                    'TRANSFER_009': errors.BadRequest,
                    'TRANSFER_010': errors.PermissionDenied,
                    'TRANSFER_011': errors.PermissionDenied,
                    'TRANSFER_012': errors.PermissionDenied,
                    'symbol_not_support_trading_via_api': errors.BadSymbol,
                    'open_order_min_nominal_value_limit': errors.InvalidOrder, // {"returnCode":1,"msgInfo":"failure","error":{"code":"open_order_min_nominal_value_limit","msg":"Exceeds the minimum notional value of a single order"},"result":null}
                },
                'broad': {
                    'The symbol does not support trading via API': errors.BadSymbol,
                    'Exceeds the minimum notional value of a single order': errors.InvalidOrder, // {"returnCode":1,"msgInfo":"failure","error":{"code":"open_order_min_nominal_value_limit","msg":"Exceeds the minimum notional value of a single order"},"result":null}
                },
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
                '8h': '8h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M', // spot only
            },
            'commonCurrencies': {},
            'options': {
                'adjustForTimeDifference': false,
                'timeDifference': 0,
                'accountsById': {
                    'spot': 'SPOT',
                    'leverage': 'LEVER',
                    'finance': 'FINANCE',
                    'swap': 'FUTURES_U',
                    'future': 'FUTURES_U',
                    'linear': 'FUTURES_U',
                    'inverse': 'FUTURES_C',
                },
                'networks': {
                    'ERC20': 'Ethereum',
                    'TRC20': 'Tron',
                    'BEP20': 'BNB Smart Chain',
                    'BEP2': 'BNB-BEP2',
                    'ETH': 'Ethereum',
                    'TRON': 'Tron',
                    'BNB': 'BNB Smart Chain',
                    'AVAX': 'AVAX C-Chain',
                    'GAL': 'GAL(FT)',
                    'ALEO': 'ALEO(IOU)',
                    'BTC': 'Bitcoin',
                    'XT': 'XT Smart Chain',
                    'ETC': 'Ethereum Classic',
                    'MATIC': 'Polygon',
                    'LTC': 'Litecoin',
                    'BTS': 'BitShares',
                    'XRP': 'Ripple',
                    'XLM': 'Stellar Network',
                    'ADA': 'Cardano',
                    'XWC': 'XWC-XWC',
                    'DOGE': 'dogecoin',
                    'DCR': 'Decred',
                    'SC': 'Siacoin',
                    'XTZ': 'Tezos',
                    'ZEC': 'Zcash',
                    'XMR': 'Monero',
                    'LSK': 'Lisk',
                    'ATOM': 'Cosmos',
                    'ONT': 'Ontology',
                    'ALGO': 'Algorand',
                    'SOL': 'SOL-SOL',
                    'DOT': 'Polkadot',
                    'ZEN': 'Horizen',
                    'FIL': 'Filecoin',
                    'CHZ': 'chz',
                    'ICP': 'Internet Computer',
                    'KSM': 'Kusama',
                    'LUNA': 'Terra',
                    'THETA': 'Theta Token',
                    'FTM': 'Fantom',
                    'VET': 'VeChain',
                    'NEAR': 'NEAR Protocol',
                    'ONE': 'Harmony',
                    'KLAY': 'Klaytn',
                    'AR': 'Arweave',
                    'CELT': 'OKT',
                    'EGLD': 'Elrond eGold',
                    'CRO': 'CRO-CRONOS',
                    'BCH': 'Bitcoin Cash',
                    'GLMR': 'Moonbeam',
                    'LOOP': 'LOOP-LRC',
                    'REI': 'REI Network',
                    'ASTR': 'Astar Network',
                    'OP': 'OPT',
                    'MMT': 'MMT-MMT',
                    'TBC': 'TBC-TBC',
                    'OMAX': 'OMAX-OMAX CHAIN',
                    'GMMT': 'GMMT chain',
                    'ZIL': 'Zilliqa',
                },
                'networksById': {
                    'Ethereum': 'ERC20',
                    'Tron': 'TRC20',
                    'BNB Smart Chain': 'BEP20',
                    'BNB-BEP2': 'BEP2',
                    'Bitcoin': 'BTC',
                    'XT Smart Chain': 'XT',
                    'Ethereum Classic': 'ETC',
                    'Polygon': 'MATIC',
                    'Litecoin': 'LTC',
                    'BitShares': 'BTS',
                    'Ripple': 'XRP',
                    'Stellar Network': 'XLM',
                    'Cardano': 'ADA',
                    'XWC-XWC': 'XWC',
                    'dogecoin': 'DOGE',
                    'Decred': 'DCR',
                    'Siacoin': 'SC',
                    'Tezos': 'XTZ',
                    'Zcash': 'ZEC',
                    'Monero': 'XMR',
                    'Lisk': 'LSK',
                    'Cosmos': 'ATOM',
                    'Ontology': 'ONT',
                    'Algorand': 'ALGO',
                    'SOL-SOL': 'SOL',
                    'Polkadot': 'DOT',
                    'Horizen': 'ZEN',
                    'Filecoin': 'FIL',
                    'chz': 'CHZ',
                    'Internet Computer': 'ICP',
                    'Kusama': 'KSM',
                    'Terra': 'LUNA',
                    'Theta Token': 'THETA',
                    'Fantom': 'FTM',
                    'VeChain': 'VET',
                    'AVAX C-Chain': 'AVAX',
                    'NEAR Protocol': 'NEAR',
                    'Harmony': 'ONE',
                    'Klaytn': 'KLAY',
                    'Arweave': 'AR',
                    'OKT': 'CELT',
                    'Elrond eGold': 'EGLD',
                    'CRO-CRONOS': 'CRO',
                    'Bitcoin Cash': 'BCH',
                    'Moonbeam': 'GLMR',
                    'LOOP-LRC': 'LOOP',
                    'REI Network': 'REI',
                    'Astar Network': 'ASTR',
                    'GAL(FT)': 'GAL',
                    'ALEO(IOU)': 'ALEO',
                    'OPT': 'OP',
                    'MMT-MMT': 'MMT',
                    'TBC-TBC': 'TBC',
                    'OMAX-OMAX CHAIN': 'OMAX',
                    'GMMT chain': 'GMMT',
                    'Zilliqa': 'ZIL',
                },
                'createMarketBuyOrderRequiresPrice': true,
                'recvWindow': '5000', // in milliseconds, spot only
            },
        });
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name xt#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the xt server
         * @see https://doc.xt.com/#market1serverInfo
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the xt server
         */
        const response = await this.publicSpotGetTime(params);
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "serverTime": 1677823301643
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result');
        return this.safeInteger(data, 'serverTime');
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name xt#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://doc.xt.com/#deposit_withdrawalsupportedCurrenciesGet
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const promisesRaw = [this.publicSpotGetWalletSupportCurrency(params), this.publicSpotGetCurrencies(params)];
        const [chainsResponse, currenciesResponse] = await Promise.all(promisesRaw);
        //
        // currencies
        //
        //    {
        //        "time": "1686626116145",
        //        "version": "5dbbb2f2527c22b2b2e3b47187ef13d1",
        //        "currencies": [
        //            {
        //                "id": "2",
        //                "currency": "btc",
        //                "fullName": "Bitcoin",
        //                "logo": "https://a.static-global.com/1/currency/btc.png",
        //                "cmcLink": "https://coinmarketcap.com/currencies/bitcoin/",
        //                "weight": "99999",
        //                "maxPrecision": "10",
        //                "depositStatus": "1",
        //                "withdrawStatus": "1",
        //                "convertEnabled": "1",
        //                "transferEnabled": "1",
        //                "isChainExist": "1",
        //                "plates": [152]
        //            },
        //        ],
        //    }
        //
        //
        // chains
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "currency": "btc",
        //                 "supportChains": [
        //                     {
        //                         "chain": "Bitcoin",
        //                         "depositEnabled": true,
        //                         "withdrawEnabled": true,
        //                         "withdrawFeeAmount": 0.0009,
        //                         "withdrawMinAmount": 0.0005,
        //                         "depositFeeRate": 0
        //                     },
        //                 ]
        //             },
        //         ]
        //     }
        //
        // note: individual network's full data is available on per-currency endpoint: https://www.xt.com/sapi/v4/balance/public/currency/11
        //
        const chainsData = this.safeValue(chainsResponse, 'result', []);
        const currenciesResult = this.safeValue(currenciesResponse, 'result', []);
        const currenciesData = this.safeValue(currenciesResult, 'currencies', []);
        const chainsDataIndexed = this.indexBy(chainsData, 'currency');
        const result = {};
        for (let i = 0; i < currenciesData.length; i++) {
            const entry = currenciesData[i];
            const currencyId = this.safeString(entry, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const minPrecision = this.parseNumber(this.parsePrecision(this.safeString(entry, 'maxPrecision')));
            const networkEntry = this.safeValue(chainsDataIndexed, currencyId, {});
            const rawNetworks = this.safeValue(networkEntry, 'supportChains', []);
            const networks = {};
            let minWithdrawString = undefined;
            let minWithdrawFeeString = undefined;
            let active = false;
            let deposit = false;
            let withdraw = false;
            for (let j = 0; j < rawNetworks.length; j++) {
                const rawNetwork = rawNetworks[j];
                const networkId = this.safeString(rawNetwork, 'chain');
                const network = this.networkIdToCode(networkId);
                const depositEnabled = this.safeValue(rawNetwork, 'depositEnabled');
                deposit = (depositEnabled) ? depositEnabled : deposit;
                const withdrawEnabled = this.safeValue(rawNetwork, 'withdrawEnabled');
                withdraw = (withdrawEnabled) ? withdrawEnabled : withdraw;
                const networkActive = depositEnabled && withdrawEnabled;
                active = (networkActive) ? networkActive : active;
                const withdrawFeeString = this.safeString(rawNetwork, 'withdrawFeeAmount');
                if (withdrawFeeString !== undefined) {
                    minWithdrawFeeString = (minWithdrawFeeString === undefined) ? withdrawFeeString : Precise["default"].stringMin(withdrawFeeString, minWithdrawFeeString);
                }
                const minNetworkWithdrawString = this.safeString(rawNetwork, 'withdrawMinAmount');
                if (minNetworkWithdrawString !== undefined) {
                    minWithdrawString = (minWithdrawString === undefined) ? minNetworkWithdrawString : Precise["default"].stringMin(minNetworkWithdrawString, minWithdrawString);
                }
                networks[network] = {
                    'info': rawNetwork,
                    'id': networkId,
                    'network': network,
                    'name': undefined,
                    'active': networkActive,
                    'fee': this.parseNumber(withdrawFeeString),
                    'precision': minPrecision,
                    'deposit': depositEnabled,
                    'withdraw': withdrawEnabled,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.parseNumber(minNetworkWithdrawString),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = {
                'info': entry,
                'id': currencyId,
                'code': code,
                'name': this.safeString(entry, 'fullName'),
                'active': active,
                'fee': this.parseNumber(minWithdrawFeeString),
                'precision': undefined,
                'deposit': deposit,
                'withdraw': withdraw,
                'networks': networks,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.parseNumber(minWithdrawString),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name xt#fetchMarkets
         * @description retrieves data on all markets for xt
         * @see https://doc.xt.com/#market2symbol
         * @see https://doc.xt.com/#futures_quotesgetSymbols
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const promisesUnresolved = [
            this.fetchSpotMarkets(params),
            this.fetchSwapAndFutureMarkets(params),
        ];
        const promises = await Promise.all(promisesUnresolved);
        const spotMarkets = promises[0];
        const swapAndFutureMarkets = promises[1];
        return this.arrayConcat(spotMarkets, swapAndFutureMarkets);
    }
    async fetchSpotMarkets(params = {}) {
        const response = await this.publicSpotGetSymbol(params);
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "time": 1677881368812,
        //             "version": "abb101d1543e54bee40687b135411ba0",
        //             "symbols": [
        //                 {
        //                     "id": 640,
        //                     "symbol": "xt_usdt",
        //                     "state": "ONLINE",
        //                     "stateTime": 1554048000000,
        //                     "tradingEnabled": true,
        //                     "openapiEnabled": true,
        //                     "nextStateTime": null,
        //                     "nextState": null,
        //                     "depthMergePrecision": 5,
        //                     "baseCurrency": "xt",
        //                     "baseCurrencyPrecision": 8,
        //                     "baseCurrencyId": 128,
        //                     "quoteCurrency": "usdt",
        //                     "quoteCurrencyPrecision": 8,
        //                     "quoteCurrencyId": 11,
        //                     "pricePrecision": 4,
        //                     "quantityPrecision": 2,
        //                     "orderTypes": ["LIMIT","MARKET"],
        //                     "timeInForces": ["GTC","IOC"],
        //                     "displayWeight": 10002,
        //                     "displayLevel": "FULL",
        //                     "plates": [],
        //                     "filters":[
        //                         {
        //                             "filter": "QUOTE_QTY",
        //                             "min": "1"
        //                         },
        //                         {
        //                             "filter": "PROTECTION_LIMIT",
        //                             "buyMaxDeviation": "0.8",
        //                             "sellMaxDeviation": "4"
        //                         },
        //                         {
        //                             "filter": "PROTECTION_MARKET",
        //                             "maxDeviation": "0.02"
        //                         }
        //                     ]
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const symbols = this.safeValue(data, 'symbols', []);
        return this.parseMarkets(symbols);
    }
    async fetchSwapAndFutureMarkets(params = {}) {
        const markets = await Promise.all([this.publicLinearGetFutureMarketV1PublicSymbolList(params), this.publicInverseGetFutureMarketV1PublicSymbolList(params)]);
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "id": 52,
        //                 "symbolGroupId": 71,
        //                 "symbol": "xt_usdt",
        //                 "pair": "xt_usdt",
        //                 "contractType": "PERPETUAL",
        //                 "productType": "perpetual",
        //                 "predictEventType": null,
        //                 "underlyingType": "U_BASED",
        //                 "contractSize": "1",
        //                 "tradeSwitch": true,
        //                 "isDisplay": true,
        //                 "isOpenApi": false,
        //                 "state": 0,
        //                 "initLeverage": 20,
        //                 "initPositionType": "CROSSED",
        //                 "baseCoin": "xt",
        //                 "quoteCoin": "usdt",
        //                 "baseCoinPrecision": 8,
        //                 "baseCoinDisplayPrecision": 4,
        //                 "quoteCoinPrecision": 8,
        //                 "quoteCoinDisplayPrecision": 4,
        //                 "quantityPrecision": 0,
        //                 "pricePrecision": 4,
        //                 "supportOrderType": "LIMIT,MARKET",
        //                 "supportTimeInForce": "GTC,FOK,IOC,GTX",
        //                 "supportEntrustType": "TAKE_PROFIT,STOP,TAKE_PROFIT_MARKET,STOP_MARKET,TRAILING_STOP_MARKET",
        //                 "supportPositionType": "CROSSED,ISOLATED",
        //                 "minQty": "1",
        //                 "minNotional": "5",
        //                 "maxNotional": "20000000",
        //                 "multiplierDown": "0.1",
        //                 "multiplierUp": "0.1",
        //                 "maxOpenOrders": 200,
        //                 "maxEntrusts": 200,
        //                 "makerFee": "0.0004",
        //                 "takerFee": "0.0006",
        //                 "liquidationFee": "0.01",
        //                 "marketTakeBound": "0.1",
        //                 "depthPrecisionMerge": 5,
        //                 "labels": ["HOT"],
        //                 "onboardDate": 1657101601000,
        //                 "enName": "XTUSDT ",
        //                 "cnName": "XTUSDT",
        //                 "minStepPrice": "0.0001",
        //                 "minPrice": null,
        //                 "maxPrice": null,
        //                 "deliveryDate": 1669879634000,
        //                 "deliveryPrice": null,
        //                 "deliveryCompletion": false,
        //                 "cnDesc": null,
        //                 "enDesc": null
        //             },
        //         ]
        //     }
        //
        const swapAndFutureMarkets = this.arrayConcat(this.safeValue(markets[0], 'result', []), this.safeValue(markets[1], 'result', []));
        return this.parseMarkets(swapAndFutureMarkets);
    }
    parseMarkets(markets) {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push(this.parseMarket(markets[i]));
        }
        return result;
    }
    parseMarket(market) {
        //
        // spot
        //
        //     {
        //         "id": 640,
        //         "symbol": "xt_usdt",
        //         "state": "ONLINE",
        //         "stateTime": 1554048000000,
        //         "tradingEnabled": true,
        //         "openapiEnabled": true,
        //         "nextStateTime": null,
        //         "nextState": null,
        //         "depthMergePrecision": 5,
        //         "baseCurrency": "xt",
        //         "baseCurrencyPrecision": 8,
        //         "baseCurrencyId": 128,
        //         "quoteCurrency": "usdt",
        //         "quoteCurrencyPrecision": 8,
        //         "quoteCurrencyId": 11,
        //         "pricePrecision": 4,
        //         "quantityPrecision": 2,
        //         "orderTypes": ["LIMIT","MARKET"],
        //         "timeInForces": ["GTC","IOC"],
        //         "displayWeight": 10002,
        //         "displayLevel": "FULL",
        //         "plates": [],
        //         "filters":[
        //             {
        //                 "filter": "QUOTE_QTY",
        //                 "min": "1"
        //             },
        //             {
        //                 "filter": "PRICE",
        //                 "min": null,
        //                 "max": null,
        //                 "tickSize": null
        //             },
        //             {
        //                 "filter": "QUANTITY",
        //                 "min": null,
        //                 "max": null,
        //                 "tickSize": null
        //             },
        //             {
        //                 "filter": "PROTECTION_LIMIT",
        //                 "buyMaxDeviation": "0.8",
        //                 "sellMaxDeviation": "4"
        //             },
        //             {
        //                 "filter": "PROTECTION_MARKET",
        //                 "maxDeviation": "0.02"
        //             },
        //             {
        //                  "filter": "PROTECTION_ONLINE",
        //                  "durationSeconds": "300",
        //                  "maxPriceMultiple": "5"
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "id": 52,
        //         "symbolGroupId": 71,
        //         "symbol": "xt_usdt",
        //         "pair": "xt_usdt",
        //         "contractType": "PERPETUAL",
        //         "productType": "perpetual",
        //         "predictEventType": null,
        //         "underlyingType": "U_BASED",
        //         "contractSize": "1",
        //         "tradeSwitch": true,
        //         "isDisplay": true,
        //         "isOpenApi": false,
        //         "state": 0,
        //         "initLeverage": 20,
        //         "initPositionType": "CROSSED",
        //         "baseCoin": "xt",
        //         "quoteCoin": "usdt",
        //         "baseCoinPrecision": 8,
        //         "baseCoinDisplayPrecision": 4,
        //         "quoteCoinPrecision": 8,
        //         "quoteCoinDisplayPrecision": 4,
        //         "quantityPrecision": 0,
        //         "pricePrecision": 4,
        //         "supportOrderType": "LIMIT,MARKET",
        //         "supportTimeInForce": "GTC,FOK,IOC,GTX",
        //         "supportEntrustType": "TAKE_PROFIT,STOP,TAKE_PROFIT_MARKET,STOP_MARKET,TRAILING_STOP_MARKET",
        //         "supportPositionType": "CROSSED,ISOLATED",
        //         "minQty": "1",
        //         "minNotional": "5",
        //         "maxNotional": "20000000",
        //         "multiplierDown": "0.1",
        //         "multiplierUp": "0.1",
        //         "maxOpenOrders": 200,
        //         "maxEntrusts": 200,
        //         "makerFee": "0.0004",
        //         "takerFee": "0.0006",
        //         "liquidationFee": "0.01",
        //         "marketTakeBound": "0.1",
        //         "depthPrecisionMerge": 5,
        //         "labels": ["HOT"],
        //         "onboardDate": 1657101601000,
        //         "enName": "XTUSDT ",
        //         "cnName": "XTUSDT",
        //         "minStepPrice": "0.0001",
        //         "minPrice": null,
        //         "maxPrice": null,
        //         "deliveryDate": 1669879634000,
        //         "deliveryPrice": null,
        //         "deliveryCompletion": false,
        //         "cnDesc": null,
        //         "enDesc": null
        //     }
        //
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString2(market, 'baseCurrency', 'baseCoin');
        const quoteId = this.safeString2(market, 'quoteCurrency', 'quoteCoin');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const state = this.safeString(market, 'state');
        let symbol = base + '/' + quote;
        const filters = this.safeValue(market, 'filters', []);
        let minAmount = undefined;
        let maxAmount = undefined;
        let minCost = undefined;
        let maxCost = undefined;
        let minPrice = undefined;
        let maxPrice = undefined;
        for (let i = 0; i < filters.length; i++) {
            const entry = filters[i];
            const filter = this.safeString(entry, 'filter');
            if (filter === 'QUANTITY') {
                minAmount = this.safeNumber(entry, 'min');
                maxAmount = this.safeNumber(entry, 'max');
            }
            if (filter === 'QUOTE_QTY') {
                minCost = this.safeNumber(entry, 'min');
            }
            if (filter === 'PRICE') {
                minPrice = this.safeNumber(entry, 'min');
                maxPrice = this.safeNumber(entry, 'max');
            }
        }
        const underlyingType = this.safeString(market, 'underlyingType');
        let linear = undefined;
        let inverse = undefined;
        let settleId = undefined;
        let settle = undefined;
        let expiry = undefined;
        let future = false;
        let swap = false;
        let contract = false;
        let spot = true;
        let type = 'spot';
        if (underlyingType === 'U_BASED') {
            symbol = symbol + ':' + quote;
            settleId = baseId;
            settle = quote;
            linear = true;
            inverse = false;
        }
        else if (underlyingType === 'COIN_BASED') {
            symbol = symbol + ':' + base;
            settleId = baseId;
            settle = base;
            linear = false;
            inverse = true;
        }
        if (underlyingType !== undefined) {
            expiry = this.safeInteger(market, 'deliveryDate');
            const productType = this.safeString(market, 'productType');
            if (productType !== 'perpetual') {
                symbol = symbol + '-' + this.yymmdd(expiry);
                type = 'future';
                future = true;
            }
            else {
                type = 'swap';
                swap = true;
            }
            minAmount = this.safeNumber(market, 'minQty');
            minCost = this.safeNumber(market, 'minNotional');
            maxCost = this.safeNumber(market, 'maxNotional');
            minPrice = this.safeNumber(market, 'minPrice');
            maxPrice = this.safeNumber(market, 'maxPrice');
            contract = true;
            spot = false;
        }
        let isActive = false;
        if (contract) {
            isActive = this.safeValue(market, 'isOpenApi', false);
        }
        else {
            if ((state === 'ONLINE') && (this.safeValue(market, 'tradingEnabled')) && (this.safeValue(market, 'openapiEnabled'))) {
                isActive = true;
            }
        }
        return this.safeMarketStructure({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'margin': undefined,
            'swap': swap,
            'future': future,
            'option': false,
            'active': isActive,
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'taker': this.safeNumber(market, 'takerFee'),
            'maker': this.safeNumber(market, 'makerFee'),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'expiry': expiry,
            'expiryDatetime': this.iso8601(expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'pricePrecision'))),
                'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'quantityPrecision'))),
                'base': this.parseNumber(this.parsePrecision(this.safeString(market, 'baseCoinPrecision'))),
                'quote': this.parseNumber(this.parsePrecision(this.safeString(market, 'quoteCoinPrecision'))),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber('1'),
                    'max': undefined,
                },
                'amount': {
                    'min': minAmount,
                    'max': maxAmount,
                },
                'price': {
                    'min': minPrice,
                    'max': maxPrice,
                },
                'cost': {
                    'min': minCost,
                    'max': maxCost,
                },
            },
            'info': market,
        });
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://doc.xt.com/#market4kline
         * @see https://doc.xt.com/#futures_quotesgetKLine
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['linear']) {
            response = await this.publicLinearGetFutureMarketV1PublicQKline(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.publicInverseGetFutureMarketV1PublicQKline(this.extend(request, params));
        }
        else {
            response = await this.publicSpotGetKline(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "t": 1678167720000,
        //                 "o": "22467.85",
        //                 "c": "22465.87",
        //                 "h": "22468.86",
        //                 "l": "22465.21",
        //                 "q": "1.316656",
        //                 "v": "29582.73018498"
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "s": "btc_usdt",
        //                 "p": "btc_usdt",
        //                 "t": 1678168020000,
        //                 "o": "22450.0",
        //                 "c": "22441.5",
        //                 "h": "22450.0",
        //                 "l": "22441.5",
        //                 "a": "312931",
        //                 "v": "702461.58895"
        //             },
        //         ]
        //     }
        //
        const ohlcvs = this.safeValue(response, 'result', []);
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        // spot
        //
        //     {
        //         "t": 1678167720000,
        //         "o": "22467.85",
        //         "c": "22465.87",
        //         "h": "22468.86",
        //         "l": "22465.21",
        //         "q": "1.316656",
        //         "v": "29582.73018498"
        //     }
        //
        // swap and future
        //
        //     {
        //         "s": "btc_usdt",
        //         "p": "btc_usdt",
        //         "t": 1678168020000,
        //         "o": "22450.0",
        //         "c": "22441.5",
        //         "h": "22450.0",
        //         "l": "22441.5",
        //         "a": "312931",
        //         "v": "702461.58895"
        //     }
        //
        const volumeIndex = (market['inverse']) ? 'v' : 'a';
        return [
            this.safeInteger(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber2(ohlcv, volumeIndex, 'v'),
        ];
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOrderBook
         * @see https://doc.xt.com/#market3depth
         * @see https://doc.xt.com/#futures_quotesgetDepth
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified market symbol to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            if (limit !== undefined) {
                request['limit'] = Math.min(limit, 500);
            }
            response = await this.publicSpotGetDepth(this.extend(request, params));
        }
        else {
            if (limit !== undefined) {
                request['level'] = Math.min(limit, 50);
            }
            else {
                request['level'] = 50;
            }
            if (market['linear']) {
                response = await this.publicLinearGetFutureMarketV1PublicQDepth(this.extend(request, params));
            }
            else if (market['inverse']) {
                response = await this.publicInverseGetFutureMarketV1PublicQDepth(this.extend(request, params));
            }
        }
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "timestamp": 1678169975184,
        //             "lastUpdateId": 1675333221812,
        //             "bids": [
        //                 ["22444.51", "0.129887"],
        //                 ["22444.49", "0.114245"],
        //                 ["22444.30", "0.225956"]
        //             ],
        //             "asks": [
        //                 ["22446.19", "0.095330"],
        //                 ["22446.24", "0.224413"],
        //                 ["22446.28", "0.329095"]
        //             ]
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "t": 1678170311005,
        //             "s": "btc_usdt",
        //             "u": 471694545627,
        //             "b": [
        //                 ["22426", "198623"],
        //                 ["22423.5", "80295"],
        //                 ["22423", "163580"]
        //             ],
        //             "a": [
        //                 ["22427", "3417"],
        //                 ["22428.5", "43532"],
        //                 ["22429", "119"]
        //             ]
        //         }
        //     }
        //
        const orderBook = this.safeValue(response, 'result', {});
        const timestamp = this.safeInteger2(orderBook, 'timestamp', 't');
        if (market['spot']) {
            return this.parseOrderBook(orderBook, symbol, timestamp);
        }
        return this.parseOrderBook(orderBook, symbol, timestamp, 'b', 'a');
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name xt#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://doc.xt.com/#market10ticker24h
         * @see https://doc.xt.com/#futures_quotesgetAggTicker
         * @param {string} symbol unified market symbol to fetch the ticker for
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['linear']) {
            response = await this.publicLinearGetFutureMarketV1PublicQAggTicker(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.publicInverseGetFutureMarketV1PublicQAggTicker(this.extend(request, params));
        }
        else {
            response = await this.publicSpotGetTicker24h(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "s": "btc_usdt",
        //                 "t": 1678172693931,
        //                 "cv": "34.00",
        //                 "cr": "0.0015",
        //                 "o": "22398.05",
        //                 "l": "22323.72",
        //                 "h": "22600.50",
        //                 "c": "22432.05",
        //                 "q": "7962.256931",
        //                 "v": "178675209.47416856"
        //             }
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "t": 1678172848572,
        //             "s": "btc_usdt",
        //             "c": "22415.5",
        //             "h": "22590.0",
        //             "l": "22310.0",
        //             "a": "623654031",
        //             "v": "1399166074.31675",
        //             "o": "22381.5",
        //             "r": "0.0015",
        //             "i": "22424.5",
        //             "m": "22416.5",
        //             "bp": "22415",
        //             "ap": "22415.5"
        //         }
        //     }
        //
        const ticker = this.safeValue(response, 'result');
        if (market['spot']) {
            return this.parseTicker(ticker[0], market);
        }
        return this.parseTicker(ticker, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://doc.xt.com/#market10ticker24h
         * @see https://doc.xt.com/#futures_quotesgetAggTickers
         * @param {string} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            market = this.market(symbols[0]);
        }
        const request = {};
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        [subType, params] = this.handleSubTypeAndParams('fetchTickers', market, params);
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicQAggTickers(this.extend(request, params));
        }
        else if ((subType === 'linear') || (type === 'swap') || (type === 'future')) {
            response = await this.publicLinearGetFutureMarketV1PublicQAggTickers(this.extend(request, params));
        }
        else {
            response = await this.publicSpotGetTicker24h(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "s": "btc_usdt",
        //                 "t": 1678172693931,
        //                 "cv": "34.00",
        //                 "cr": "0.0015",
        //                 "o": "22398.05",
        //                 "l": "22323.72",
        //                 "h": "22600.50",
        //                 "c": "22432.05",
        //                 "q": "7962.256931",
        //                 "v": "178675209.47416856"
        //             }
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "t": 1680738775108,
        //                 "s": "badger_usdt",
        //                 "c": "2.7176",
        //                 "h": "2.7917",
        //                 "l": "2.6818",
        //                 "a": "88332",
        //                 "v": "242286.3520",
        //                 "o": "2.7422",
        //                 "r": "-0.0089",
        //                 "i": "2.7155",
        //                 "m": "2.7161",
        //                 "bp": "2.7152",
        //                 "ap": "2.7176"
        //             },
        //         ]
        //     }
        //
        const tickers = this.safeValue(response, 'result', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker(tickers[i], market);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray(result, 'symbol', symbols);
    }
    async fetchBidsAsks(symbols = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple markets
         * @see https://doc.xt.com/#market9tickerBook
         * @param {string} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            market = this.market(symbols[0]);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchBidsAsks', market, params);
        if (subType !== undefined) {
            throw new errors.NotSupported(this.id + ' fetchBidsAsks() is not available for swap and future markets, only spot markets are supported');
        }
        const response = await this.publicSpotGetTickerBook(this.extend(request, params));
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "s": "kas_usdt",
        //                 "t": 1679539891853,
        //                 "ap": "0.016298",
        //                 "aq": "5119.09",
        //                 "bp": "0.016290",
        //                 "bq": "135.37"
        //             },
        //         ]
        //     }
        //
        const tickers = this.safeValue(response, 'result', []);
        return this.parseTickers(tickers, symbols);
    }
    parseTicker(ticker, market = undefined) {
        //
        // spot: fetchTicker, fetchTickers
        //
        //     {
        //         "s": "btc_usdt",
        //         "t": 1678172693931,
        //         "cv": "34.00",
        //         "cr": "0.0015",
        //         "o": "22398.05",
        //         "l": "22323.72",
        //         "h": "22600.50",
        //         "c": "22432.05",
        //         "q": "7962.256931",
        //         "v": "178675209.47416856"
        //     }
        //
        // swap and future: fetchTicker, fetchTickers
        //
        //     {
        //         "t": 1678172848572,
        //         "s": "btc_usdt",
        //         "c": "22415.5",
        //         "h": "22590.0",
        //         "l": "22310.0",
        //         "a": "623654031",
        //         "v": "1399166074.31675",
        //         "o": "22381.5",
        //         "r": "0.0015",
        //         "i": "22424.5",
        //         "m": "22416.5",
        //         "bp": "22415",
        //         "ap": "22415.5"
        //     }
        //
        // fetchBidsAsks
        //
        //     {
        //         "s": "kas_usdt",
        //         "t": 1679539891853,
        //         "ap": "0.016298",
        //         "aq": "5119.09",
        //         "bp": "0.016290",
        //         "bq": "135.37"
        //     }
        //
        const marketId = this.safeString(ticker, 's');
        let marketType = (market !== undefined) ? market['type'] : undefined;
        if (marketType === undefined) {
            marketType = ('cv' in ticker) || ('aq' in ticker) ? 'spot' : 'contract';
        }
        market = this.safeMarket(marketId, market, '_', marketType);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(ticker, 't');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeNumber(ticker, 'h'),
            'low': this.safeNumber(ticker, 'l'),
            'bid': this.safeNumber(ticker, 'bp'),
            'bidVolume': this.safeNumber(ticker, 'bq'),
            'ask': this.safeNumber(ticker, 'ap'),
            'askVolume': this.safeNumber(ticker, 'aq'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'o'),
            'close': this.safeString(ticker, 'c'),
            'last': this.safeString(ticker, 'c'),
            'previousClose': undefined,
            'change': this.safeNumber(ticker, 'cv'),
            'percentage': this.safeNumber2(ticker, 'cr', 'r'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeNumber2(ticker, 'a', 'v'),
            'info': ticker,
        }, market);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://doc.xt.com/#market5tradeRecent
         * @see https://doc.xt.com/#futures_quotesgetDeal
         * @param {string} symbol unified market symbol to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.publicSpotGetTradeRecent(this.extend(request, params));
        }
        else {
            if (limit !== undefined) {
                request['num'] = limit;
            }
            if (market['linear']) {
                response = await this.publicLinearGetFutureMarketV1PublicQDeal(this.extend(request, params));
            }
            else if (market['inverse']) {
                response = await this.publicInverseGetFutureMarketV1PublicQDeal(this.extend(request, params));
            }
        }
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "i": 203530723141917063,
        //                 "t": 1678227505815,
        //                 "p": "22038.81",
        //                 "q": "0.000978",
        //                 "v": "21.55395618",
        //                 "b": true
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "t": 1678227683897,
        //                 "s": "btc_usdt",
        //                 "p": "22031",
        //                 "a": "1067",
        //                 "m": "BID"
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue(response, 'result', []);
        return this.parseTrades(trades, market);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://doc.xt.com/#tradetradeGet
         * @see https://doc.xt.com/#futures_ordergetTrades
         * @param {string} [symbol] unified market symbol to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        [subType, params] = this.handleSubTypeAndParams('fetchMyTrades', market, params);
        if ((subType !== undefined) || (type === 'swap') || (type === 'future')) {
            if (limit !== undefined) {
                request['size'] = limit;
            }
            if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1OrderTradeList(this.extend(request, params));
            }
            else {
                response = await this.privateLinearGetFutureTradeV1OrderTradeList(this.extend(request, params));
            }
        }
        else {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchMyTrades', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.privateSpotGetTrade(this.extend(request, params));
        }
        //
        // spot and margin
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": false,
        //             "items": [
        //                 {
        //                     "symbol": "btc_usdt",
        //                     "tradeId": "206906233569974658",
        //                     "orderId": "206906233178463488",
        //                     "orderSide": "SELL",
        //                     "orderType": "MARKET",
        //                     "bizType": "SPOT",
        //                     "time": 1679032290215,
        //                     "price": "25703.46",
        //                     "quantity": "0.000099",
        //                     "quoteQty": "2.54464254",
        //                     "baseCurrency": "btc",
        //                     "quoteCurrency": "usdt",
        //                     "fee": "0.00508929",
        //                     "feeCurrency": "usdt",
        //                     "takerMaker": "TAKER"
        //                 },
        //             ]
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "page": 1,
        //             "ps": 10,
        //             "total": 2,
        //             "items": [
        //                 {
        //                     "orderId": "207260566170987200",
        //                     "execId": "207260566790603265",
        //                     "symbol": "btc_usdt",
        //                     "quantity": "13",
        //                     "price": "27368",
        //                     "fee": "0.02134704",
        //                     "feeCoin": "usdt",
        //                     "timestamp": 1679116769838,
        //                     "takerMaker": "TAKER"
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const trades = this.safeValue(data, 'items', []);
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // spot: fetchTrades
        //
        //     {
        //         "i": 203530723141917063,
        //         "t": 1678227505815,
        //         "p": "22038.81",
        //         "q": "0.000978",
        //         "v": "21.55395618",
        //         "b": true
        //     }
        //
        // swap and future: fetchTrades
        //
        //     {
        //         "t": 1678227683897,
        //         "s": "btc_usdt",
        //         "p": "22031",
        //         "a": "1067",
        //         "m": "BID"
        //     }
        //
        // spot: fetchMyTrades
        //
        //     {
        //         "symbol": "btc_usdt",
        //         "tradeId": "206906233569974658",
        //         "orderId": "206906233178463488",
        //         "orderSide": "SELL",
        //         "orderType": "MARKET",
        //         "bizType": "SPOT",
        //         "time": 1679032290215,
        //         "price": "25703.46",
        //         "quantity": "0.000099",
        //         "quoteQty": "2.54464254",
        //         "baseCurrency": "btc",
        //         "quoteCurrency": "usdt",
        //         "fee": "0.00508929",
        //         "feeCurrency": "usdt",
        //         "takerMaker": "TAKER"
        //     }
        //
        // swap and future: fetchMyTrades
        //
        //     {
        //         "orderId": "207260566170987200",
        //         "execId": "207260566790603265",
        //         "symbol": "btc_usdt",
        //         "quantity": "13",
        //         "price": "27368",
        //         "fee": "0.02134704",
        //         "feeCoin": "usdt",
        //         "timestamp": 1679116769838,
        //         "takerMaker": "TAKER"
        //     }
        //
        const marketId = this.safeString2(trade, 's', 'symbol');
        let marketType = (market !== undefined) ? market['type'] : undefined;
        if (marketType === undefined) {
            marketType = ('b' in trade) || ('bizType' in trade) ? 'spot' : 'contract';
        }
        market = this.safeMarket(marketId, market, '_', marketType);
        const bidOrAsk = this.safeString(trade, 'm');
        let side = this.safeStringLower(trade, 'orderSide');
        if (bidOrAsk !== undefined) {
            side = (bidOrAsk === 'BID') ? 'buy' : 'sell';
        }
        const buyerMaker = this.safeValue(trade, 'b');
        let takerOrMaker = this.safeStringLower(trade, 'takerMaker');
        if (buyerMaker !== undefined) {
            takerOrMaker = buyerMaker ? 'maker' : 'taker';
        }
        const timestamp = this.safeIntegerN(trade, ['t', 'time', 'timestamp']);
        const quantity = this.safeString2(trade, 'q', 'quantity');
        let amount = undefined;
        if (marketType === 'spot') {
            amount = quantity;
        }
        else {
            if (quantity === undefined) {
                amount = Precise["default"].stringMul(this.safeString(trade, 'a'), this.numberToString(market['contractSize']));
            }
            else {
                amount = Precise["default"].stringMul(quantity, this.numberToString(market['contractSize']));
            }
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeStringN(trade, ['i', 'tradeId', 'execId']),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': this.safeString(trade, 'orderId'),
            'type': this.safeStringLower(trade, 'orderType'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString2(trade, 'p', 'price'),
            'amount': amount,
            'cost': undefined,
            'fee': {
                'currency': this.safeCurrencyCode(this.safeString2(trade, 'feeCurrency', 'feeCoin')),
                'cost': this.safeString(trade, 'fee'),
                'rate': undefined,
            },
        }, market);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name xt#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://doc.xt.com/#balancebalancesGet
         * @see https://doc.xt.com/#futures_usergetBalances
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        [subType, params] = this.handleSubTypeAndParams('fetchBalance', undefined, params);
        const isContractWallet = ((type === 'swap') || (type === 'future'));
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1BalanceList(params);
        }
        else if ((subType === 'linear') || isContractWallet) {
            response = await this.privateLinearGetFutureUserV1BalanceList(params);
        }
        else {
            response = await this.privateSpotGetBalances(params);
        }
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "totalUsdtAmount": "31.75931133",
        //             "totalBtcAmount": "0.00115951",
        //             "assets": [
        //                 {
        //                     "currency": "usdt",
        //                     "currencyId": 11,
        //                     "frozenAmount": "0.03834082",
        //                     "availableAmount": "31.70995965",
        //                     "totalAmount": "31.74830047",
        //                     "convertBtcAmount": "0.00115911",
        //                     "convertUsdtAmount": "31.74830047"
        //                 },
        //             ]
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "coin": "usdt",
        //                 "walletBalance": "19.29849875",
        //                 "openOrderMarginFrozen": "0",
        //                 "isolatedMargin": "0.709475",
        //                 "crossedMargin": "0",
        //                 "availableBalance": "18.58902375",
        //                 "bonus": "0",
        //                 "coupon":"0"
        //             }
        //         ]
        //     }
        //
        let balances = undefined;
        if ((subType !== undefined) || isContractWallet) {
            balances = this.safeValue(response, 'result', []);
        }
        else {
            const data = this.safeValue(response, 'result', {});
            balances = this.safeValue(data, 'assets', []);
        }
        return this.parseBalance(balances);
    }
    parseBalance(response) {
        //
        // spot
        //
        //     {
        //         "currency": "usdt",
        //         "currencyId": 11,
        //         "frozenAmount": "0.03834082",
        //         "availableAmount": "31.70995965",
        //         "totalAmount": "31.74830047",
        //         "convertBtcAmount": "0.00115911",
        //         "convertUsdtAmount": "31.74830047"
        //     }
        //
        // swap and future
        //
        //     {
        //         "coin": "usdt",
        //         "walletBalance": "19.29849875",
        //         "openOrderMarginFrozen": "0",
        //         "isolatedMargin": "0.709475",
        //         "crossedMargin": "0",
        //         "availableBalance": "18.58902375",
        //         "bonus": "0",
        //         "coupon":"0"
        //     }
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString2(balance, 'currency', 'coin');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            const free = this.safeString2(balance, 'availableAmount', 'availableBalance');
            let used = this.safeString(balance, 'frozenAmount');
            const total = this.safeString2(balance, 'totalAmount', 'walletBalance');
            if (used === undefined) {
                const crossedAndIsolatedMargin = Precise["default"].stringAdd(this.safeString(balance, 'crossedMargin'), this.safeString(balance, 'isolatedMargin'));
                used = Precise["default"].stringAdd(this.safeString(balance, 'openOrderMarginFrozen'), crossedAndIsolatedMargin);
            }
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        /**
         * @method
         * @name xt#createMarketBuyOrderWithCost
         * @see https://doc.xt.com/#orderorderPost
         * @description create a market buy order by providing the symbol and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        return await this.createOrder(symbol, 'market', 'buy', cost, 1, params);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name xt#createOrder
         * @description create a trade order
         * @see https://doc.xt.com/#orderorderPost
         * @see https://doc.xt.com/#futures_ordercreate
         * @see https://doc.xt.com/#futures_entrustcreatePlan
         * @see https://doc.xt.com/#futures_entrustcreateProfit
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, can be ignored in market orders
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'GTX'
         * @param {string} [params.entrustType] 'TAKE_PROFIT', 'STOP', 'TAKE_PROFIT_MARKET', 'STOP_MARKET', 'TRAILING_STOP_MARKET', required if stopPrice is defined, currently isn't functioning on xt's side
         * @param {string} [params.triggerPriceType] 'INDEX_PRICE', 'MARK_PRICE', 'LATEST_PRICE', required if stopPrice is defined
         * @param {float} [params.stopPrice] price to trigger a stop order
         * @param {float} [params.stopLoss] price to set a stop-loss on an open position
         * @param {float} [params.takeProfit] price to set a take-profit on an open position
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (market['spot']) {
            return await this.createSpotOrder(symbol, type, side, amount, price, params);
        }
        else {
            return await this.createContractOrder(symbol, type, side, amount, price, params);
        }
    }
    async createSpotOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase(),
            'type': type.toUpperCase(),
        };
        let timeInForce = undefined;
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
        const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
        request['bizType'] = marginOrSpotRequest;
        if (type === 'market') {
            timeInForce = this.safeStringUpper(params, 'timeInForce', 'FOK');
            if (side === 'buy') {
                const cost = this.safeString(params, 'cost');
                params = this.omit(params, 'cost');
                const createMarketBuyOrderRequiresPrice = this.safeBool(this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if (price === undefined && (cost === undefined)) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() requires a price argument or cost in params for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                    }
                    else {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        let costCalculated = undefined;
                        if (price !== undefined) {
                            costCalculated = Precise["default"].stringMul(amountString, priceString);
                        }
                        else {
                            costCalculated = cost;
                        }
                        request['quoteQty'] = this.costToPrecision(symbol, costCalculated);
                    }
                }
                else {
                    const amountCost = (cost !== undefined) ? cost : amount;
                    request['quoteQty'] = this.costToPrecision(symbol, amountCost);
                }
            }
        }
        else {
            timeInForce = this.safeStringUpper(params, 'timeInForce', 'GTC');
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if ((side === 'sell') || (type === 'limit')) {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        request['timeInForce'] = timeInForce;
        const response = await this.privateSpotPostOrder(this.extend(request, params));
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "orderId": "204371980095156544"
        //         }
        //     }
        //
        const order = this.safeValue(response, 'result', {});
        return this.parseOrder(order, market);
    }
    async createContractOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'origQty': this.amountToPrecision(symbol, amount),
        };
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        if (timeInForce !== undefined) {
            request['timeInForce'] = timeInForce;
        }
        const reduceOnly = this.safeValue(params, 'reduceOnly', false);
        if (side === 'buy') {
            const requestType = (reduceOnly) ? 'SHORT' : 'LONG';
            request['positionSide'] = requestType;
        }
        else {
            const requestType = (reduceOnly) ? 'LONG' : 'SHORT';
            request['positionSide'] = requestType;
        }
        let response = undefined;
        const triggerPrice = this.safeNumber2(params, 'triggerPrice', 'stopPrice');
        const stopLoss = this.safeNumber2(params, 'stopLoss', 'triggerStopPrice');
        const takeProfit = this.safeNumber2(params, 'takeProfit', 'triggerProfitPrice');
        const isTrigger = (triggerPrice !== undefined);
        const isStopLoss = (stopLoss !== undefined);
        const isTakeProfit = (takeProfit !== undefined);
        if (price !== undefined) {
            if (!(isStopLoss) && !(isTakeProfit)) {
                request['price'] = this.priceToPrecision(symbol, price);
            }
        }
        if (isTrigger) {
            request['timeInForce'] = this.safeStringUpper(params, 'timeInForce', 'GTC');
            request['triggerPriceType'] = this.safeString(params, 'triggerPriceType', 'LATEST_PRICE');
            request['orderSide'] = side.toUpperCase();
            request['stopPrice'] = this.priceToPrecision(symbol, triggerPrice);
            const entrustType = (type === 'market') ? 'STOP_MARKET' : 'STOP';
            request['entrustType'] = entrustType;
            params = this.omit(params, 'triggerPrice');
            if (market['linear']) {
                response = await this.privateLinearPostFutureTradeV1EntrustCreatePlan(this.extend(request, params));
            }
            else if (market['inverse']) {
                response = await this.privateInversePostFutureTradeV1EntrustCreatePlan(this.extend(request, params));
            }
        }
        else if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                request['triggerStopPrice'] = this.priceToPrecision(symbol, stopLoss);
            }
            else {
                request['triggerProfitPrice'] = this.priceToPrecision(symbol, takeProfit);
            }
            params = this.omit(params, ['stopLoss', 'takeProfit']);
            if (market['linear']) {
                response = await this.privateLinearPostFutureTradeV1EntrustCreateProfit(this.extend(request, params));
            }
            else if (market['inverse']) {
                response = await this.privateInversePostFutureTradeV1EntrustCreateProfit(this.extend(request, params));
            }
        }
        else {
            request['orderSide'] = side.toUpperCase();
            request['orderType'] = type.toUpperCase();
            if (market['linear']) {
                response = await this.privateLinearPostFutureTradeV1OrderCreate(this.extend(request, params));
            }
            else if (market['inverse']) {
                response = await this.privateInversePostFutureTradeV1OrderCreate(this.extend(request, params));
            }
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": "206410760006650176"
        //     }
        //
        return this.parseOrder(response, market);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://doc.xt.com/#orderorderGet
         * @see https://doc.xt.com/#futures_ordergetById
         * @see https://doc.xt.com/#futures_entrustgetPlanById
         * @see https://doc.xt.com/#futures_entrustgetProfitById
         * @param {string} id order id
         * @param {string} [symbol] unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {bool} [params.stop] if the order is a stop trigger order or not
         * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchOrder', market, params);
        [subType, params] = this.handleSubTypeAndParams('fetchOrder', market, params);
        const stop = this.safeValue(params, 'stop');
        const stopLossTakeProfit = this.safeValue(params, 'stopLossTakeProfit');
        if (stop) {
            request['entrustId'] = id;
        }
        else if (stopLossTakeProfit) {
            request['profitId'] = id;
        }
        else {
            request['orderId'] = id;
        }
        if (stop) {
            params = this.omit(params, 'stop');
            if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1EntrustPlanDetail(this.extend(request, params));
            }
            else {
                response = await this.privateLinearGetFutureTradeV1EntrustPlanDetail(this.extend(request, params));
            }
        }
        else if (stopLossTakeProfit) {
            params = this.omit(params, 'stopLossTakeProfit');
            if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1EntrustProfitDetail(this.extend(request, params));
            }
            else {
                response = await this.privateLinearGetFutureTradeV1EntrustProfitDetail(this.extend(request, params));
            }
        }
        else if (subType === 'inverse') {
            response = await this.privateInverseGetFutureTradeV1OrderDetail(this.extend(request, params));
        }
        else if ((subType === 'linear') || (type === 'swap') || (type === 'future')) {
            response = await this.privateLinearGetFutureTradeV1OrderDetail(this.extend(request, params));
        }
        else {
            response = await this.privateSpotGetOrderOrderId(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "symbol": "btc_usdt",
        //             "orderId": "207505997850909952",
        //             "clientOrderId": null,
        //             "baseCurrency": "btc",
        //             "quoteCurrency": "usdt",
        //             "side": "BUY",
        //             "type": "LIMIT",
        //             "timeInForce": "GTC",
        //             "price": "20000.00",
        //             "origQty": "0.001000",
        //             "origQuoteQty": "20.00",
        //             "executedQty": "0.000000",
        //             "leavingQty": "0.001000",
        //             "tradeBase": "0.000000",
        //             "tradeQuote": "0.00",
        //             "avgPrice": null,
        //             "fee": null,
        //             "feeCurrency": null,
        //             "closed": false,
        //             "state": "NEW",
        //             "time": 1679175285162,
        //             "updatedTime": 1679175285255
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "orderId": "211451874783183936",
        //             "clientOrderId": null,
        //             "symbol": "btc_usdt",
        //             "orderType": "LIMIT",
        //             "orderSide": "BUY",
        //             "positionSide": "LONG",
        //             "timeInForce": "GTC",
        //             "closePosition": false,
        //             "price": "20000",
        //             "origQty": "10",
        //             "avgPrice": "0",
        //             "executedQty": "0",
        //             "marginFrozen": "1.34533334",
        //             "remark": null,
        //             "triggerProfitPrice": null,
        //             "triggerStopPrice": null,
        //             "sourceId": null,
        //             "sourceType": "DEFAULT",
        //             "forceClose": false,
        //             "closeProfit": null,
        //             "state": "NEW",
        //             "createdTime": 1680116055693,
        //             "updatedTime": 1680116055693
        //         }
        //     }
        //
        // trigger
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "entrustId": "216300248132756992",
        //             "symbol": "btc_usdt",
        //             "entrustType": "STOP",
        //             "orderSide": "SELL",
        //             "positionSide": "SHORT",
        //             "timeInForce": "GTC",
        //             "closePosition": null,
        //             "price": "20000",
        //             "origQty": "1",
        //             "stopPrice": "19000",
        //             "triggerPriceType": "LATEST_PRICE",
        //             "state": "NOT_TRIGGERED",
        //             "marketOrderLevel": null,
        //             "createdTime": 1681271998064,
        //             "updatedTime": 1681271998064,
        //             "ordinary": false
        //         }
        //     }
        //
        // stop-loss and take-profit
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "profitId": "216306213226230400",
        //             "symbol": "btc_usdt",
        //             "positionSide": "LONG",
        //             "origQty": "1",
        //             "triggerPriceType": "LATEST_PRICE",
        //             "triggerProfitPrice": null,
        //             "triggerStopPrice": "20000",
        //             "entryPrice": null,
        //             "positionSize": null,
        //             "isolatedMargin": null,
        //             "executedQty": null,
        //             "avgPrice": null,
        //             "positionType": "ISOLATED",
        //             "state": "NOT_TRIGGERED",
        //             "createdTime": 1681273420039
        //         }
        //     }
        //
        const order = this.safeValue(response, 'result', {});
        return this.parseOrder(order, market);
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://doc.xt.com/#orderhistoryOrderGet
         * @see https://doc.xt.com/#futures_ordergetHistory
         * @see https://doc.xt.com/#futures_entrustgetPlanHistory
         * @param {string} [symbol] unified market symbol of the market the orders were made in
         * @param {int} [since] timestamp in ms of the earliest order
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {bool} [params.stop] if the order is a stop trigger order or not
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchOrders', market, params);
        [subType, params] = this.handleSubTypeAndParams('fetchOrders', market, params);
        const stop = this.safeValue(params, 'stop');
        if (stop) {
            params = this.omit(params, 'stop');
            if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1EntrustPlanListHistory(this.extend(request, params));
            }
            else {
                response = await this.privateLinearGetFutureTradeV1EntrustPlanListHistory(this.extend(request, params));
            }
        }
        else if (subType === 'inverse') {
            response = await this.privateInverseGetFutureTradeV1OrderListHistory(this.extend(request, params));
        }
        else if ((subType === 'linear') || (type === 'swap') || (type === 'future')) {
            response = await this.privateLinearGetFutureTradeV1OrderListHistory(this.extend(request, params));
        }
        else {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchOrders', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            response = await this.privateSpotGetHistoryOrder(this.extend(request, params));
        }
        //
        //  spot and margin
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": true,
        //             "items": [
        //                 {
        //                     "symbol": "btc_usdt",
        //                     "orderId": "207505997850909952",
        //                     "clientOrderId": null,
        //                     "baseCurrency": "btc",
        //                     "quoteCurrency": "usdt",
        //                     "side": "BUY",
        //                     "type": "LIMIT",
        //                     "timeInForce": "GTC",
        //                     "price": "20000.00",
        //                     "origQty": "0.001000",
        //                     "origQuoteQty": "20.00",
        //                     "executedQty": "0.000000",
        //                     "leavingQty": "0.000000",
        //                     "tradeBase": "0.000000",
        //                     "tradeQuote": "0.00",
        //                     "avgPrice": null,
        //                     "fee": null,
        //                     "feeCurrency": null,
        //                     "closed": true,
        //                     "state": "CANCELED",
        //                     "time": 1679175285162,
        //                     "updatedTime": 1679175488492
        //                 },
        //             ]
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": true,
        //             "items": [
        //                 {
        //                     "orderId": "207519546930995456",
        //                     "clientOrderId": null,
        //                     "symbol": "btc_usdt",
        //                     "orderType": "LIMIT",
        //                     "orderSide": "BUY",
        //                     "positionSide": "LONG",
        //                     "timeInForce": "GTC",
        //                     "closePosition": false,
        //                     "price": "20000",
        //                     "origQty": "100",
        //                     "avgPrice": "0",
        //                     "executedQty": "0",
        //                     "marginFrozen": "4.12",
        //                     "remark": null,
        //                     "triggerProfitPrice": null,
        //                     "triggerStopPrice": null,
        //                     "sourceId": null,
        //                     "sourceType": "DEFAULT",
        //                     "forceClose": false,
        //                     "closeProfit": null,
        //                     "state": "CANCELED",
        //                     "createdTime": 1679178515689,
        //                     "updatedTime": 1679180096172
        //                 },
        //             ]
        //         }
        //     }
        //
        // stop
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": false,
        //             "items": [
        //                 {
        //                     "entrustId": "216300248132756992",
        //                     "symbol": "btc_usdt",
        //                     "entrustType": "STOP",
        //                     "orderSide": "SELL",
        //                     "positionSide": "SHORT",
        //                     "timeInForce": "GTC",
        //                     "closePosition": null,
        //                     "price": "20000",
        //                     "origQty": "1",
        //                     "stopPrice": "19000",
        //                     "triggerPriceType": "LATEST_PRICE",
        //                     "state": "USER_REVOCATION",
        //                     "marketOrderLevel": null,
        //                     "createdTime": 1681271998064,
        //                     "updatedTime": 1681273188674,
        //                     "ordinary": false
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const orders = this.safeValue(data, 'items', []);
        return this.parseOrders(orders, market, since, limit);
    }
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchOrdersByStatus', market, params);
        [subType, params] = this.handleSubTypeAndParams('fetchOrdersByStatus', market, params);
        const stop = this.safeValue(params, 'stop');
        const stopLossTakeProfit = this.safeValue(params, 'stopLossTakeProfit');
        if (status === 'open') {
            if (stop || stopLossTakeProfit) {
                request['state'] = 'NOT_TRIGGERED';
            }
            else if (subType !== undefined) {
                request['state'] = 'NEW';
            }
        }
        else if (status === 'closed') {
            if (stop || stopLossTakeProfit) {
                request['state'] = 'TRIGGERED';
            }
            else {
                request['state'] = 'FILLED';
            }
        }
        else if (status === 'canceled') {
            if (stop || stopLossTakeProfit) {
                request['state'] = 'USER_REVOCATION';
            }
            else {
                request['state'] = 'CANCELED';
            }
        }
        else {
            request['state'] = status;
        }
        if (stop || stopLossTakeProfit || (subType !== undefined) || (type === 'swap') || (type === 'future')) {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['size'] = limit;
            }
        }
        if (stop) {
            params = this.omit(params, 'stop');
            if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1EntrustPlanList(this.extend(request, params));
            }
            else {
                response = await this.privateLinearGetFutureTradeV1EntrustPlanList(this.extend(request, params));
            }
        }
        else if (stopLossTakeProfit) {
            params = this.omit(params, 'stopLossTakeProfit');
            if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1EntrustProfitList(this.extend(request, params));
            }
            else {
                response = await this.privateLinearGetFutureTradeV1EntrustProfitList(this.extend(request, params));
            }
        }
        else if ((subType !== undefined) || (type === 'swap') || (type === 'future')) {
            if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1OrderList(this.extend(request, params));
            }
            else {
                response = await this.privateLinearGetFutureTradeV1OrderList(this.extend(request, params));
            }
        }
        else {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchOrdersByStatus', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            if (status !== 'open') {
                if (since !== undefined) {
                    request['startTime'] = since;
                }
                if (limit !== undefined) {
                    request['limit'] = limit;
                }
                response = await this.privateSpotGetHistoryOrder(this.extend(request, params));
            }
            else {
                response = await this.privateSpotGetOpenOrder(this.extend(request, params));
            }
        }
        //
        // spot and margin
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": true,
        //             "items": [
        //                 {
        //                     "symbol": "btc_usdt",
        //                     "orderId": "207505997850909952",
        //                     "clientOrderId": null,
        //                     "baseCurrency": "btc",
        //                     "quoteCurrency": "usdt",
        //                     "side": "BUY",
        //                     "type": "LIMIT",
        //                     "timeInForce": "GTC",
        //                     "price": "20000.00",
        //                     "origQty": "0.001000",
        //                     "origQuoteQty": "20.00",
        //                     "executedQty": "0.000000",
        //                     "leavingQty": "0.000000",
        //                     "tradeBase": "0.000000",
        //                     "tradeQuote": "0.00",
        //                     "avgPrice": null,
        //                     "fee": null,
        //                     "feeCurrency": null,
        //                     "closed": true,
        //                     "state": "CANCELED",
        //                     "time": 1679175285162,
        //                     "updatedTime": 1679175488492
        //                 },
        //             ]
        //         }
        //     }
        //
        // spot and margin: fetchOpenOrders
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "symbol": "eth_usdt",
        //                 "orderId": "208249323222264320",
        //                 "clientOrderId": null,
        //                 "baseCurrency": "eth",
        //                 "quoteCurrency": "usdt",
        //                 "side": "BUY",
        //                 "type": "LIMIT",
        //                 "timeInForce": "GTC",
        //                 "price": "1300.00",
        //                 "origQty": "0.0032",
        //                 "origQuoteQty": "4.16",
        //                 "executedQty": "0.0000",
        //                 "leavingQty": "0.0032",
        //                 "tradeBase": "0.0000",
        //                 "tradeQuote": "0.00",
        //                 "avgPrice": null,
        //                 "fee": null,
        //                 "feeCurrency": null,
        //                 "closed": false,
        //                 "state": "NEW",
        //                 "time": 1679352507741,
        //                 "updatedTime": 1679352507869
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "page": 1,
        //             "ps": 10,
        //             "total": 25,
        //             "items": [
        //                 {
        //                     "orderId": "207519546930995456",
        //                     "clientOrderId": null,
        //                     "symbol": "btc_usdt",
        //                     "orderType": "LIMIT",
        //                     "orderSide": "BUY",
        //                     "positionSide": "LONG",
        //                     "timeInForce": "GTC",
        //                     "closePosition": false,
        //                     "price": "20000",
        //                     "origQty": "100",
        //                     "avgPrice": "0",
        //                     "executedQty": "0",
        //                     "marginFrozen": "4.12",
        //                     "remark": null,
        //                     "triggerProfitPrice": null,
        //                     "triggerStopPrice": null,
        //                     "sourceId": null,
        //                     "sourceType": "DEFAULT",
        //                     "forceClose": false,
        //                     "closeProfit": null,
        //                     "state": "CANCELED",
        //                     "createdTime": 1679178515689,
        //                     "updatedTime": 1679180096172
        //                 },
        //             ]
        //         }
        //     }
        //
        // stop
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "page": 1,
        //             "ps": 3,
        //             "total": 8,
        //             "items": [
        //                 {
        //                     "entrustId": "216300248132756992",
        //                     "symbol": "btc_usdt",
        //                     "entrustType": "STOP",
        //                     "orderSide": "SELL",
        //                     "positionSide": "SHORT",
        //                     "timeInForce": "GTC",
        //                     "closePosition": null,
        //                     "price": "20000",
        //                     "origQty": "1",
        //                     "stopPrice": "19000",
        //                     "triggerPriceType": "LATEST_PRICE",
        //                     "state": "USER_REVOCATION",
        //                     "marketOrderLevel": null,
        //                     "createdTime": 1681271998064,
        //                     "updatedTime": 1681273188674,
        //                     "ordinary": false
        //                 },
        //             ]
        //         }
        //     }
        //
        // stop-loss and take-profit
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "page": 1,
        //             "ps": 3,
        //             "total": 2,
        //             "items": [
        //                 {
        //                     "profitId": "216306213226230400",
        //                     "symbol": "btc_usdt",
        //                     "positionSide": "LONG",
        //                     "origQty": "1",
        //                     "triggerPriceType": "LATEST_PRICE",
        //                     "triggerProfitPrice": null,
        //                     "triggerStopPrice": "20000",
        //                     "entryPrice": "0",
        //                     "positionSize": "0",
        //                     "isolatedMargin": "0",
        //                     "executedQty": "0",
        //                     "avgPrice": null,
        //                     "positionType": "ISOLATED",
        //                     "state": "USER_REVOCATION",
        //                     "createdTime": 1681273420039
        //                 },
        //             ]
        //         }
        //     }
        //
        const isSpotOpenOrders = ((status === 'open') && (subType === undefined));
        const data = this.safeValue(response, 'result', {});
        const orders = isSpotOpenOrders ? this.safeValue(response, 'result', []) : this.safeValue(data, 'items', []);
        return this.parseOrders(orders, market, since, limit);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://doc.xt.com/#orderopenOrderGet
         * @see https://doc.xt.com/#futures_ordergetOrders
         * @see https://doc.xt.com/#futures_entrustgetPlan
         * @see https://doc.xt.com/#futures_entrustgetProfit
         * @param {string} [symbol] unified market symbol of the market the orders were made in
         * @param {int} [since] timestamp in ms of the earliest order
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {bool} [params.stop] if the order is a stop trigger order or not
         * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus('open', symbol, since, limit, params);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://doc.xt.com/#orderhistoryOrderGet
         * @see https://doc.xt.com/#futures_ordergetOrders
         * @see https://doc.xt.com/#futures_entrustgetPlan
         * @see https://doc.xt.com/#futures_entrustgetProfit
         * @param {string} [symbol] unified market symbol of the market the orders were made in
         * @param {int} [since] timestamp in ms of the earliest order
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {bool} [params.stop] if the order is a stop trigger order or not
         * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus('closed', symbol, since, limit, params);
    }
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @see https://doc.xt.com/#orderhistoryOrderGet
         * @see https://doc.xt.com/#futures_ordergetOrders
         * @see https://doc.xt.com/#futures_entrustgetPlan
         * @see https://doc.xt.com/#futures_entrustgetProfit
         * @param {string} [symbol] unified market symbol of the market the orders were made in
         * @param {int} [since] timestamp in ms of the earliest order
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {bool} [params.stop] if the order is a stop trigger order or not
         * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus('canceled', symbol, since, limit, params);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name xt#cancelOrder
         * @description cancels an open order
         * @see https://doc.xt.com/#orderorderDel
         * @see https://doc.xt.com/#futures_ordercancel
         * @see https://doc.xt.com/#futures_entrustcancelPlan
         * @see https://doc.xt.com/#futures_entrustcancelProfit
         * @param {string} id order id
         * @param {string} [symbol] unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {bool} [params.stop] if the order is a stop trigger order or not
         * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('cancelOrder', market, params);
        [subType, params] = this.handleSubTypeAndParams('cancelOrder', market, params);
        const stop = this.safeValue(params, 'stop');
        const stopLossTakeProfit = this.safeValue(params, 'stopLossTakeProfit');
        if (stop) {
            request['entrustId'] = id;
        }
        else if (stopLossTakeProfit) {
            request['profitId'] = id;
        }
        else {
            request['orderId'] = id;
        }
        if (stop) {
            params = this.omit(params, 'stop');
            if (subType === 'inverse') {
                response = await this.privateInversePostFutureTradeV1EntrustCancelPlan(this.extend(request, params));
            }
            else {
                response = await this.privateLinearPostFutureTradeV1EntrustCancelPlan(this.extend(request, params));
            }
        }
        else if (stopLossTakeProfit) {
            params = this.omit(params, 'stopLossTakeProfit');
            if (subType === 'inverse') {
                response = await this.privateInversePostFutureTradeV1EntrustCancelProfitStop(this.extend(request, params));
            }
            else {
                response = await this.privateLinearPostFutureTradeV1EntrustCancelProfitStop(this.extend(request, params));
            }
        }
        else if (subType === 'inverse') {
            response = await this.privateInversePostFutureTradeV1OrderCancel(this.extend(request, params));
        }
        else if ((subType === 'linear') || (type === 'swap') || (type === 'future')) {
            response = await this.privateLinearPostFutureTradeV1OrderCancel(this.extend(request, params));
        }
        else {
            response = await this.privateSpotDeleteOrderOrderId(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "cancelId": "208322474307982720"
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": "208319789679471616"
        //     }
        //
        const isContractResponse = ((subType !== undefined) || (type === 'swap') || (type === 'future'));
        const order = isContractResponse ? response : this.safeValue(response, 'result', {});
        return this.parseOrder(order, market);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name xt#cancelAllOrders
         * @description cancel all open orders in a market
         * @see https://doc.xt.com/#orderopenOrderDel
         * @see https://doc.xt.com/#futures_ordercancelBatch
         * @see https://doc.xt.com/#futures_entrustcancelPlanBatch
         * @see https://doc.xt.com/#futures_entrustcancelProfitBatch
         * @param {string} [symbol] unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {bool} [params.stop] if the order is a stop trigger order or not
         * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        [subType, params] = this.handleSubTypeAndParams('cancelAllOrders', market, params);
        const stop = this.safeValue(params, 'stop');
        const stopLossTakeProfit = this.safeValue(params, 'stopLossTakeProfit');
        if (stop) {
            params = this.omit(params, 'stop');
            if (subType === 'inverse') {
                response = await this.privateInversePostFutureTradeV1EntrustCancelAllPlan(this.extend(request, params));
            }
            else {
                response = await this.privateLinearPostFutureTradeV1EntrustCancelAllPlan(this.extend(request, params));
            }
        }
        else if (stopLossTakeProfit) {
            params = this.omit(params, 'stopLossTakeProfit');
            if (subType === 'inverse') {
                response = await this.privateInversePostFutureTradeV1EntrustCancelAllProfitStop(this.extend(request, params));
            }
            else {
                response = await this.privateLinearPostFutureTradeV1EntrustCancelAllProfitStop(this.extend(request, params));
            }
        }
        else if (subType === 'inverse') {
            response = await this.privateInversePostFutureTradeV1OrderCancelAll(this.extend(request, params));
        }
        else if ((subType === 'linear') || (type === 'swap') || (type === 'future')) {
            response = await this.privateLinearPostFutureTradeV1OrderCancelAll(this.extend(request, params));
        }
        else {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('cancelAllOrders', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            response = await this.privateSpotDeleteOpenOrder(this.extend(request, params));
        }
        //
        // spot and margin
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": null
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": true
        //     }
        //
        return [
            this.safeOrder(response),
        ];
    }
    async cancelOrders(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name xt#cancelOrders
         * @description cancel multiple orders
         * @see https://doc.xt.com/#orderbatchOrderDel
         * @param {string[]} ids order ids
         * @param {string} [symbol] unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets();
        const request = {
            'orderIds': ids,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('cancelOrders', market, params);
        if (subType !== undefined) {
            throw new errors.NotSupported(this.id + ' cancelOrders() does not support swap and future orders, only spot orders are accepted');
        }
        const response = await this.privateSpotDeleteBatchOrder(this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": null
        //     }
        //
        return [
            this.safeOrder(response),
        ];
    }
    parseOrder(order, market = undefined) {
        //
        // spot: createOrder
        //
        //     {
        //         "orderId": "204371980095156544"
        //     }
        //
        // spot: cancelOrder
        //
        //     {
        //         "cancelId": "208322474307982720"
        //     }
        //
        // swap and future: createOrder, cancelOrder
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": "206410760006650176"
        //     }
        //
        // spot: fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrdersByStatus
        //
        //     {
        //         "symbol": "btc_usdt",
        //         "orderId": "207505997850909952",
        //         "clientOrderId": null,
        //         "baseCurrency": "btc",
        //         "quoteCurrency": "usdt",
        //         "side": "BUY",
        //         "type": "LIMIT",
        //         "timeInForce": "GTC",
        //         "price": "20000.00",
        //         "origQty": "0.001000",
        //         "origQuoteQty": "20.00",
        //         "executedQty": "0.000000",
        //         "leavingQty": "0.001000",
        //         "tradeBase": "0.000000",
        //         "tradeQuote": "0.00",
        //         "avgPrice": null,
        //         "fee": null,
        //         "feeCurrency": null,
        //         "closed": false,
        //         "state": "NEW",
        //         "time": 1679175285162,
        //         "updatedTime": 1679175285255
        //     }
        //
        // swap and future: fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrdersByStatus
        //
        //     {
        //         "orderId": "207519546930995456",
        //         "clientOrderId": null,
        //         "symbol": "btc_usdt",
        //         "orderType": "LIMIT",
        //         "orderSide": "BUY",
        //         "positionSide": "LONG",
        //         "timeInForce": "GTC",
        //         "closePosition": false,
        //         "price": "20000",
        //         "origQty": "100",
        //         "avgPrice": "0",
        //         "executedQty": "0",
        //         "marginFrozen": "4.12",
        //         "remark": null,
        //         "triggerProfitPrice": null,
        //         "triggerStopPrice": null,
        //         "sourceId": null,
        //         "sourceType": "DEFAULT",
        //         "forceClose": false,
        //         "closeProfit": null,
        //         "state": "CANCELED",
        //         "createdTime": 1679178515689,
        //         "updatedTime": 1679180096172
        //     }
        //
        // trigger: fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrdersByStatus
        //
        //     {
        //         "entrustId": "216300248132756992",
        //         "symbol": "btc_usdt",
        //         "entrustType": "STOP",
        //         "orderSide": "SELL",
        //         "positionSide": "SHORT",
        //         "timeInForce": "GTC",
        //         "closePosition": null,
        //         "price": "20000",
        //         "origQty": "1",
        //         "stopPrice": "19000",
        //         "triggerPriceType": "LATEST_PRICE",
        //         "state": "NOT_TRIGGERED",
        //         "marketOrderLevel": null,
        //         "createdTime": 1681271998064,
        //         "updatedTime": 1681271998064,
        //         "ordinary": false
        //     }
        //
        // stop-loss and take-profit: fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, fetchOrdersByStatus
        //
        //     {
        //         "profitId": "216306213226230400",
        //         "symbol": "btc_usdt",
        //         "positionSide": "LONG",
        //         "origQty": "1",
        //         "triggerPriceType": "LATEST_PRICE",
        //         "triggerProfitPrice": null,
        //         "triggerStopPrice": "20000",
        //         "entryPrice": null,
        //         "positionSize": null,
        //         "isolatedMargin": null,
        //         "executedQty": null,
        //         "avgPrice": null,
        //         "positionType": "ISOLATED",
        //         "state": "NOT_TRIGGERED",
        //         "createdTime": 1681273420039
        //     }
        //
        const marketId = this.safeString(order, 'symbol');
        const marketType = ('result' in order) || ('positionSide' in order) ? 'contract' : 'spot';
        market = this.safeMarket(marketId, market, undefined, marketType);
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        const timestamp = this.safeInteger2(order, 'time', 'createdTime');
        const quantity = this.safeNumber(order, 'origQty');
        const amount = (marketType === 'spot') ? quantity : Precise["default"].stringMul(this.numberToString(quantity), this.numberToString(market['contractSize']));
        const filledQuantity = this.safeNumber(order, 'executedQty');
        const filled = (marketType === 'spot') ? filledQuantity : Precise["default"].stringMul(this.numberToString(filledQuantity), this.numberToString(market['contractSize']));
        const lastUpdatedTimestamp = this.safeInteger(order, 'updatedTime');
        return this.safeOrder({
            'info': order,
            'id': this.safeStringN(order, ['orderId', 'result', 'cancelId', 'entrustId', 'profitId']),
            'clientOrderId': this.safeString(order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastUpdatedTimestamp,
            'lastUpdateTimestamp': lastUpdatedTimestamp,
            'symbol': symbol,
            'type': this.safeStringLower2(order, 'type', 'orderType'),
            'timeInForce': this.safeString(order, 'timeInForce'),
            'postOnly': undefined,
            'side': this.safeStringLower2(order, 'side', 'orderSide'),
            'price': this.safeNumber(order, 'price'),
            'stopPrice': this.safeNumber(order, 'stopPrice'),
            'stopLoss': this.safeNumber(order, 'triggerStopPrice'),
            'takeProfit': this.safeNumber(order, 'triggerProfitPrice'),
            'amount': amount,
            'filled': filled,
            'remaining': this.safeNumber(order, 'leavingQty'),
            'cost': undefined,
            'average': this.safeNumber(order, 'avgPrice'),
            'status': this.parseOrderStatus(this.safeString(order, 'state')),
            'fee': {
                'currency': this.safeCurrencyCode(this.safeString(order, 'feeCurrency')),
                'cost': this.safeNumber(order, 'fee'),
            },
            'trades': undefined,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
            'UNFINISHED': 'open',
            'NOT_TRIGGERED': 'open',
            'TRIGGERING': 'open',
            'TRIGGERED': 'closed',
            'USER_REVOCATION': 'canceled',
            'PLATFORM_REVOCATION': 'rejected',
            'HISTORY': 'expired',
        };
        return this.safeString(statuses, status, status);
    }
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
         * @see https://doc.xt.com/#futures_usergetBalanceBill
         * @param {string} [code] unified currency code
         * @param {int} [since] timestamp in ms of the earliest ledger entry
         * @param {int} [limit] max number of ledger entries to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let type = undefined;
        let subType = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchLedger', undefined, params);
        [subType, params] = this.handleSubTypeAndParams('fetchLedger', undefined, params);
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1BalanceBills(this.extend(request, params));
        }
        else if ((subType === 'linear') || (type === 'swap') || (type === 'future')) {
            response = await this.privateLinearGetFutureUserV1BalanceBills(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLedger() does not support spot transactions, only swap and future wallet transactions are supported');
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": false,
        //             "items": [
        //                 {
        //                     "id": "207260567109387524",
        //                     "coin": "usdt",
        //                     "symbol": "btc_usdt",
        //                     "type": "FEE",
        //                     "amount": "-0.0213",
        //                     "side": "SUB",
        //                     "afterAmount": null,
        //                     "createdTime": 1679116769914
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const ledger = this.safeValue(data, 'items', []);
        return this.parseLedger(ledger, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         "id": "207260567109387524",
        //         "coin": "usdt",
        //         "symbol": "btc_usdt",
        //         "type": "FEE",
        //         "amount": "-0.0213",
        //         "side": "SUB",
        //         "afterAmount": null,
        //         "createdTime": 1679116769914
        //     }
        //
        const side = this.safeString(item, 'side');
        const direction = (side === 'ADD') ? 'in' : 'out';
        const currencyId = this.safeString(item, 'coin');
        const timestamp = this.safeInteger(item, 'createdTime');
        return {
            'id': this.safeString(item, 'id'),
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType(this.safeString(item, 'type')),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(item, 'amount'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'before': undefined,
            'after': this.safeNumber(item, 'afterAmount'),
            'status': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
            'info': item,
        };
    }
    parseLedgerEntryType(type) {
        const ledgerType = {
            'EXCHANGE': 'transfer',
            'CLOSE_POSITION': 'trade',
            'TAKE_OVER': 'trade',
            'MERGE': 'trade',
            'QIANG_PING_MANAGER': 'fee',
            'FUND': 'fee',
            'FEE': 'fee',
            'ADL': 'auto-deleveraging',
        };
        return this.safeString(ledgerType, type, type);
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name xt#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://doc.xt.com/#deposit_withdrawaldepositAddressGet
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string} params.network required network id
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets();
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        const currency = this.currency(code);
        const networkId = this.networkCodeToId(networkCode, code);
        this.checkRequiredArgument('fetchDepositAddress', networkId, 'network');
        const request = {
            'currency': currency['id'],
            'chain': networkId,
        };
        const response = await this.privateSpotGetDepositAddress(this.extend(request, params));
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "address": "0x7f7173cf29d3846d20ca5a3aec1120b93dbd157a",
        //             "memo": ""
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseDepositAddress(result, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //     {
        //         "address": "0x7f7173cf29d3846d20ca5a3aec1120b93dbd157a",
        //         "memo": ""
        //     }
        //
        const address = this.safeString(depositAddress, 'address');
        this.checkAddress(address);
        return {
            'currency': this.safeCurrencyCode(undefined, currency),
            'address': address,
            'tag': this.safeString(depositAddress, 'memo'),
            'network': undefined,
            'info': depositAddress,
        };
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://doc.xt.com/#deposit_withdrawalhistoryDepositGet
         * @param {string} [code] unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of transaction structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 200
        }
        const response = await this.privateSpotGetDepositHistory(this.extend(request, params));
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": false,
        //             "items": [
        //                 {
        //                     "id": 170368702,
        //                     "currency": "usdt",
        //                     "chain": "Ethereum",
        //                     "memo": "",
        //                     "status": "SUCCESS",
        //                     "amount": "31.792528",
        //                     "confirmations": 12,
        //                     "transactionId": "0x90b8487c258b81b85e15e461b1839c49d4d8e6e9de4c1adb658cd47d4f5c5321",
        //                     "address": "0x7f7172cf29d3846d30ca5a3aec1120b92dbd150b",
        //                     "fromAddr": "0x7830c87c02e56aff27fa9ab1241711331fa86f58",
        //                     "createdTime": 1678491442000
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const deposits = this.safeValue(data, 'items', []);
        return this.parseTransactions(deposits, currency, since, limit, params);
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://doc.xt.com/#deposit_withdrawalwithdrawHistory
         * @param {string} [code] unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of transaction structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 200
        }
        const response = await this.privateSpotGetWithdrawHistory(this.extend(request, params));
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": false,
        //             "items": [
        //                 {
        //                     "id": 950898,
        //                     "currency": "usdt",
        //                     "chain": "Tron",
        //                     "address": "TGB2vxTjiqraVZBy7YHXF8V3CSMVhQKcaf",
        //                     "memo": "",
        //                     "status": "SUCCESS",
        //                     "amount": "5",
        //                     "fee": "2",
        //                     "confirmations": 6,
        //                     "transactionId": "c36e230b879842b1d7afd19d15ee1a866e26eaa0626e367d6f545d2932a15156",
        //                     "createdTime": 1680049062000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const withdrawals = this.safeValue(data, 'items', []);
        return this.parseTransactions(withdrawals, currency, since, limit, params);
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name xt#withdraw
         * @description make a withdrawal
         * @see https://doc.xt.com/#deposit_withdrawalwithdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} [tag]
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        const networkIdsByCodes = this.safeValue(this.options, 'networks', {});
        const networkId = this.safeString2(networkIdsByCodes, networkCode, code, code);
        const request = {
            'currency': currency['id'],
            'chain': networkId,
            'amount': this.currencyToPrecision(code, amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privateSpotPostWithdraw(this.extend(request, params));
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "id": 950898
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseTransaction(result, currency);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "id": 170368702,
        //         "currency": "usdt",
        //         "chain": "Ethereum",
        //         "memo": "",
        //         "status": "SUCCESS",
        //         "amount": "31.792528",
        //         "confirmations": 12,
        //         "transactionId": "0x90b8487c258b81b85e15e461b1839c49d4d8e6e9de4c1adb658cd47d4f5c5321",
        //         "address": "0x7f7172cf29d3846d30ca5a3aec1120b92dbd150b",
        //         "fromAddr": "0x7830c87c02e56aff27fa9ab1241711331fa86f58",
        //         "createdTime": 1678491442000
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": 950898,
        //         "currency": "usdt",
        //         "chain": "Tron",
        //         "address": "TGB2vxTjiqraVZBy7YHXF8V3CSMVhQKcaf",
        //         "memo": "",
        //         "status": "SUCCESS",
        //         "amount": "5",
        //         "fee": "2",
        //         "confirmations": 6,
        //         "transactionId": "c36e230b879842b1d7afd19d15ee1a866e26eaa0626e367d6f545d2932a15156",
        //         "createdTime": 1680049062000
        //     }
        //
        // withdraw
        //
        //     {
        //         "id": 950898
        //     }
        //
        const type = ('fromAddr' in transaction) ? 'deposit' : 'withdraw';
        const timestamp = this.safeInteger(transaction, 'createdTime');
        const address = this.safeString(transaction, 'address');
        const memo = this.safeString(transaction, 'memo');
        const currencyCode = this.safeCurrencyCode(this.safeString(transaction, 'currency'), currency);
        const fee = this.safeNumber(transaction, 'fee');
        const feeCurrency = (fee !== undefined) ? currencyCode : undefined;
        const networkId = this.safeString(transaction, 'chain');
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'id'),
            'txid': this.safeString(transaction, 'transactionId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'updated': undefined,
            'addressFrom': this.safeString(transaction, 'fromAddr'),
            'addressTo': address,
            'address': address,
            'tagFrom': undefined,
            'tagTo': undefined,
            'tag': memo,
            'type': type,
            'amount': this.safeNumber(transaction, 'amount'),
            'currency': currencyCode,
            'network': this.networkIdToCode(networkId, currencyCode),
            'status': this.parseTransactionStatus(this.safeString(transaction, 'status')),
            'comment': memo,
            'fee': {
                'currency': feeCurrency,
                'cost': fee,
                'rate': undefined,
            },
            'internal': undefined,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'SUBMIT': 'pending',
            'REVIEW': 'pending',
            'AUDITED': 'pending',
            'PENDING': 'pending',
            'CANCEL': 'canceled',
            'FAIL': 'failed',
            'SUCCESS': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name xt#setLeverage
         * @description set the level of leverage for a market
         * @see https://doc.xt.com/#futures_useradjustLeverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string} params.positionSide 'LONG' or 'SHORT'
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        const positionSide = this.safeString(params, 'positionSide');
        this.checkRequiredArgument('setLeverage', positionSide, 'positionSide', ['LONG', 'SHORT']);
        if ((leverage < 1) || (leverage > 125)) {
            throw new errors.BadRequest(this.id + ' setLeverage() leverage should be between 1 and 125');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!(market['contract'])) {
            throw new errors.BadSymbol(this.id + ' setLeverage() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
            'positionSide': positionSide,
            'leverage': leverage,
        };
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('setLeverage', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInversePostFutureUserV1PositionAdjustLeverage(this.extend(request, params));
        }
        else {
            response = await this.privateLinearPostFutureUserV1PositionAdjustLeverage(this.extend(request, params));
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": null
        //     }
        //
        return response;
    }
    async addMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name xt#addMargin
         * @description add margin to a position
         * @see https://doc.xt.com/#futures_useradjustMargin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string} params.positionSide 'LONG' or 'SHORT'
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'ADD', params);
    }
    async reduceMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name xt#reduceMargin
         * @description remove margin from a position
         * @see https://doc.xt.com/#futures_useradjustMargin
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string} params.positionSide 'LONG' or 'SHORT'
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'SUB', params);
    }
    async modifyMarginHelper(symbol, amount, addOrReduce, params = {}) {
        const positionSide = this.safeString(params, 'positionSide');
        this.checkRequiredArgument('setLeverage', positionSide, 'positionSide', ['LONG', 'SHORT']);
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'margin': amount,
            'type': addOrReduce,
            'positionSide': positionSide,
        };
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('modifyMarginHelper', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInversePostFutureUserV1PositionMargin(this.extend(request, params));
        }
        else {
            response = await this.privateLinearPostFutureUserV1PositionMargin(this.extend(request, params));
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": null
        //     }
        //
        return this.parseMarginModification(response, market);
    }
    parseMarginModification(data, market = undefined) {
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': undefined,
            'symbol': this.safeSymbol(undefined, market),
            'status': undefined,
            'marginMode': undefined,
            'total': undefined,
            'timestamp': undefined,
            'datetime': undefined,
        };
    }
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchLeverageTiers
         * @see https://doc.xt.com/#futures_quotesgetLeverageBrackets
         * @description retrieve information on the maximum leverage for different trade sizes
         * @param {string} [symbols] a list of unified market symbols
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
         */
        await this.loadMarkets();
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchLeverageTiers', undefined, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicLeverageBracketList(params);
        }
        else {
            response = await this.publicLinearGetFutureMarketV1PublicLeverageBracketList(params);
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "symbol": "rad_usdt",
        //                 "leverageBrackets": [
        //                     {
        //                         "symbol": "rad_usdt",
        //                         "bracket": 1,
        //                         "maxNominalValue": "5000",
        //                         "maintMarginRate": "0.025",
        //                         "startMarginRate": "0.05",
        //                         "maxStartMarginRate": null,
        //                         "maxLeverage": "20",
        //                         "minLeverage": "1"
        //                     },
        //                 ]
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'result', []);
        symbols = this.marketSymbols(symbols);
        return this.parseLeverageTiers(data, symbols, 'symbol');
    }
    parseLeverageTiers(response, symbols = undefined, marketIdKey = undefined) {
        //
        //     {
        //         "symbol": "rad_usdt",
        //         "leverageBrackets": [
        //             {
        //                 "symbol": "rad_usdt",
        //                 "bracket": 1,
        //                 "maxNominalValue": "5000",
        //                 "maintMarginRate": "0.025",
        //                 "startMarginRate": "0.05",
        //                 "maxStartMarginRate": null,
        //                 "maxLeverage": "20",
        //                 "minLeverage": "1"
        //             },
        //         ]
        //     }
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const marketId = this.safeString(entry, 'symbol');
            const market = this.safeMarket(marketId, undefined, '_', 'contract');
            const symbol = this.safeSymbol(marketId, market);
            if (symbols !== undefined) {
                if (this.inArray(symbol, symbols)) {
                    result[symbol] = this.parseMarketLeverageTiers(entry, market);
                }
            }
            else {
                result[symbol] = this.parseMarketLeverageTiers(response[i], market);
            }
        }
        return result;
    }
    async fetchMarketLeverageTiers(symbol, params = {}) {
        /**
         * @method
         * @name xt#fetchMarketLeverageTiers
         * @see https://doc.xt.com/#futures_quotesgetLeverageBracket
         * @description retrieve information on the maximum leverage for different trade sizes of a single market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchMarketLeverageTiers', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicLeverageBracketDetail(this.extend(request, params));
        }
        else {
            response = await this.publicLinearGetFutureMarketV1PublicLeverageBracketDetail(this.extend(request, params));
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "symbol": "btc_usdt",
        //             "leverageBrackets": [
        //                 {
        //                     "symbol": "btc_usdt",
        //                     "bracket": 1,
        //                     "maxNominalValue": "500000",
        //                     "maintMarginRate": "0.004",
        //                     "startMarginRate": "0.008",
        //                     "maxStartMarginRate": null,
        //                     "maxLeverage": "125",
        //                     "minLeverage": "1"
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        return this.parseMarketLeverageTiers(data, market);
    }
    parseMarketLeverageTiers(info, market = undefined) {
        //
        //     {
        //         "symbol": "rad_usdt",
        //         "leverageBrackets": [
        //             {
        //                 "symbol": "rad_usdt",
        //                 "bracket": 1,
        //                 "maxNominalValue": "5000",
        //                 "maintMarginRate": "0.025",
        //                 "startMarginRate": "0.05",
        //                 "maxStartMarginRate": null,
        //                 "maxLeverage": "20",
        //                 "minLeverage": "1"
        //             },
        //         ]
        //     }
        //
        const tiers = [];
        const brackets = this.safeValue(info, 'leverageBrackets', []);
        for (let i = 0; i < brackets.length; i++) {
            const tier = brackets[i];
            const marketId = this.safeString(info, 'symbol');
            market = this.safeMarket(marketId, market, '_', 'contract');
            tiers.push({
                'tier': this.safeInteger(tier, 'bracket'),
                'currency': market['settle'],
                'minNotional': this.safeNumber(brackets[i - 1], 'maxNominalValue', 0),
                'maxNotional': this.safeNumber(tier, 'maxNominalValue'),
                'maintenanceMarginRate': this.safeNumber(tier, 'maintMarginRate'),
                'maxLeverage': this.safeNumber(tier, 'maxLeverage'),
                'info': tier,
            });
        }
        return tiers;
    }
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchFundingRateHistory
         * @description fetches historical funding rates
         * @see https://doc.xt.com/#futures_quotesgetFundingRateRecord
         * @param {string} [symbol] unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures] to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingRateHistory() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchFundingRateHistory', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicQFundingRateRecord(this.extend(request, params));
        }
        else {
            response = await this.publicLinearGetFutureMarketV1PublicQFundingRateRecord(this.extend(request, params));
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": true,
        //             "items": [
        //                 {
        //                     "id": "210441653482221888",
        //                     "symbol": "btc_usdt",
        //                     "fundingRate": "0.000057",
        //                     "createdTime": 1679875200000,
        //                     "collectionInternal": 28800
        //                 },
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const items = this.safeValue(result, 'items', []);
        const rates = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            const marketId = this.safeString(entry, 'symbol');
            const symbolInner = this.safeSymbol(marketId, market);
            const timestamp = this.safeInteger(entry, 'createdTime');
            rates.push({
                'info': entry,
                'symbol': symbolInner,
                'fundingRate': this.safeNumber(entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name xt#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://doc.xt.com/#futures_quotesgetFundingRate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchFundingRate', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicQFundingRate(this.extend(request, params));
        }
        else {
            response = await this.publicLinearGetFutureMarketV1PublicQFundingRate(this.extend(request, params));
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "symbol": "btc_usdt",
        //             "fundingRate": "0.000086",
        //             "nextCollectionTime": 1680307200000,
        //             "collectionInternal": 8
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseFundingRate(result, market);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "symbol": "btc_usdt",
        //         "fundingRate": "0.000086",
        //         "nextCollectionTime": 1680307200000,
        //         "collectionInternal": 8
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        const symbol = this.safeSymbol(marketId, market, '_', 'swap');
        const timestamp = this.safeInteger(contract, 'nextCollectionTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber(contract, 'fundingRate'),
            'fundingTimestamp': timestamp,
            'fundingDatetime': this.iso8601(timestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchFundingHistory
         * @description fetch the funding history
         * @see https://doc.xt.com/#futures_usergetFunding
         * @param {string} symbol unified market symbol
         * @param {int} [since] the starting timestamp in milliseconds
         * @param {int} [limit] the number of entries to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingHistory() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchFundingHistory', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1BalanceFundingRateList(this.extend(request, params));
        }
        else {
            response = await this.privateLinearGetFutureUserV1BalanceFundingRateList(this.extend(request, params));
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "hasPrev": false,
        //             "hasNext": false,
        //             "items": [
        //                 {
        //                     "id": "210804044057280512",
        //                     "symbol": "btc_usdt",
        //                     "cast": "-0.0013",
        //                     "coin": "usdt",
        //                     "positionSide": "SHORT",
        //                     "createdTime": 1679961600653
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        const items = this.safeValue(data, 'items', []);
        const result = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            result.push(this.parseFundingHistory(entry, market));
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterBySinceLimit(sorted, since, limit);
    }
    parseFundingHistory(contract, market = undefined) {
        //
        //     {
        //         "id": "210804044057280512",
        //         "symbol": "btc_usdt",
        //         "cast": "-0.0013",
        //         "coin": "usdt",
        //         "positionSide": "SHORT",
        //         "createdTime": 1679961600653
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        const symbol = this.safeSymbol(marketId, market, '_', 'swap');
        const currencyId = this.safeString(contract, 'coin');
        const code = this.safeCurrencyCode(currencyId);
        const timestamp = this.safeInteger(contract, 'createdTime');
        return {
            'info': contract,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(contract, 'id'),
            'amount': this.safeNumber(contract, 'cast'),
        };
    }
    async fetchPosition(symbol, params = {}) {
        /**
         * @method
         * @name xt#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://doc.xt.com/#futures_usergetPosition
         * @param {string} symbol unified market symbol of the market the position is held in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchPosition', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1PositionList(this.extend(request, params));
        }
        else {
            response = await this.privateLinearGetFutureUserV1PositionList(this.extend(request, params));
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "positionType": "ISOLATED",
        //                 "positionSide": "SHORT",
        //                 "contractType": "PERPETUAL",
        //                 "positionSize": "10",
        //                 "closeOrderSize": "0",
        //                 "availableCloseSize": "10",
        //                 "entryPrice": "27060",
        //                 "openOrderSize": "0",
        //                 "isolatedMargin": "1.0824",
        //                 "openOrderMarginFrozen": "0",
        //                 "realizedProfit": "-0.00130138",
        //                 "autoMargin": false,
        //                 "leverage": 25
        //             },
        //         ]
        //     }
        //
        const positions = this.safeValue(response, 'result', []);
        for (let i = 0; i < positions.length; i++) {
            const entry = positions[i];
            const marketId = this.safeString(entry, 'symbol');
            const marketInner = this.safeMarket(marketId, undefined, undefined, 'contract');
            const positionSize = this.safeString(entry, 'positionSize');
            if (positionSize !== '0') {
                return this.parsePosition(entry, marketInner);
            }
        }
        return undefined;
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchPositions
         * @description fetch all open positions
         * @see https://doc.xt.com/#futures_usergetPosition
         * @param {string} [symbols] list of unified market symbols, not supported with xt
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchPositions', undefined, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1PositionList(params);
        }
        else {
            response = await this.privateLinearGetFutureUserV1PositionList(params);
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "symbol": "btc_usdt",
        //                 "positionType": "ISOLATED",
        //                 "positionSide": "SHORT",
        //                 "contractType": "PERPETUAL",
        //                 "positionSize": "10",
        //                 "closeOrderSize": "0",
        //                 "availableCloseSize": "10",
        //                 "entryPrice": "27060",
        //                 "openOrderSize": "0",
        //                 "isolatedMargin": "1.0824",
        //                 "openOrderMarginFrozen": "0",
        //                 "realizedProfit": "-0.00130138",
        //                 "autoMargin": false,
        //                 "leverage": 25
        //             },
        //         ]
        //     }
        //
        const positions = this.safeValue(response, 'result', []);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const entry = positions[i];
            const marketId = this.safeString(entry, 'symbol');
            const marketInner = this.safeMarket(marketId, undefined, undefined, 'contract');
            result.push(this.parsePosition(entry, marketInner));
        }
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "symbol": "btc_usdt",
        //         "positionType": "ISOLATED",
        //         "positionSide": "SHORT",
        //         "contractType": "PERPETUAL",
        //         "positionSize": "10",
        //         "closeOrderSize": "0",
        //         "availableCloseSize": "10",
        //         "entryPrice": "27060",
        //         "openOrderSize": "0",
        //         "isolatedMargin": "1.0824",
        //         "openOrderMarginFrozen": "0",
        //         "realizedProfit": "-0.00130138",
        //         "autoMargin": false,
        //         "leverage": 25
        //     }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const symbol = this.safeSymbol(marketId, market, undefined, 'contract');
        const positionType = this.safeString(position, 'positionType');
        const marginMode = (positionType === 'CROSSED') ? 'cross' : 'isolated';
        const collateral = this.safeNumber(position, 'isolatedMargin');
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'hedged': undefined,
            'side': this.safeStringLower(position, 'positionSide'),
            'contracts': this.safeNumber(position, 'positionSize'),
            'contractSize': market['contractSize'],
            'entryPrice': this.safeNumber(position, 'entryPrice'),
            'markPrice': undefined,
            'notional': undefined,
            'leverage': this.safeInteger(position, 'leverage'),
            'collateral': collateral,
            'initialMargin': collateral,
            'maintenanceMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'liquidationPrice': undefined,
            'marginMode': marginMode,
            'percentage': undefined,
            'marginRatio': undefined,
        });
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name xt#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://doc.xt.com/#transfersubTransferPost
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from -  spot, swap, leverage, finance
         * @param {string} toAccount account to transfer to - spot, swap, leverage, finance
         * @param {object} params extra parameters specific to the whitebit api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const accountsByType = this.safeValue(this.options, 'accountsById');
        const fromAccountId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toAccountId = this.safeString(accountsByType, toAccount, toAccount);
        const amountString = this.currencyToPrecision(code, amount);
        const request = {
            'bizId': this.uuid(),
            'currency': currency['id'],
            'amount': amountString,
            'from': fromAccountId,
            'to': toAccountId,
        };
        const response = await this.privateSpotPostBalanceTransfer(this.extend(request, params));
        //
        //   {
        //       info: { rc: '0', mc: 'SUCCESS', ma: [], result: '226971333791398656' },
        //       id: '226971333791398656',
        //       timestamp: undefined,
        //       datetime: undefined,
        //       currency: undefined,
        //       amount: undefined,
        //       fromAccount: undefined,
        //       toAccount: undefined,
        //       status: undefined
        //   }
        //
        return this.parseTransfer(response, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        return {
            'info': transfer,
            'id': this.safeString(transfer, 'result'),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': undefined,
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        // spot: error
        //
        //     {
        //         "rc": 1,
        //         "mc": "AUTH_103",
        //         "ma": [],
        //         "result": null
        //     }
        //
        // spot: success
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": []
        //     }
        //
        // swap and future: error
        //
        //     {
        //         "returnCode": 1,
        //         "msgInfo": "failure",
        //         "error": {
        //             "code": "403",
        //             "msg": "invalid signature"
        //         },
        //         "result": null
        //     }
        //
        // swap and future: success
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": null
        //     }
        //
        // other:
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {}
        //     }
        //
        const status = this.safeStringUpper2(response, 'msgInfo', 'mc');
        if (status !== undefined && status !== 'SUCCESS') {
            const feedback = this.id + ' ' + body;
            const error = this.safeValue(response, 'error', {});
            const spotErrorCode = this.safeString(response, 'mc');
            const errorCode = this.safeString(error, 'code', spotErrorCode);
            const spotMessage = this.safeString(response, 'msgInfo');
            const message = this.safeString(error, 'msg', spotMessage);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
    sign(path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const signed = api[0] === 'private';
        const endpoint = api[1];
        const request = '/' + this.implodeParams(path, params);
        let payload = undefined;
        if ((endpoint === 'spot') || (endpoint === 'user')) {
            if (signed) {
                payload = '/' + this.version + request;
            }
            else {
                payload = '/' + this.version + '/public' + request;
            }
        }
        else {
            payload = request;
        }
        let url = this.urls['api'][endpoint] + payload;
        const query = this.omit(params, this.extractParams(path));
        const urlencoded = this.urlencode(this.keysort(query));
        headers = {
            'Content-Type': 'application/json',
        };
        if (signed) {
            this.checkRequiredCredentials();
            const defaultRecvWindow = this.safeString(this.options, 'recvWindow');
            const recvWindow = this.safeString(query, 'recvWindow', defaultRecvWindow);
            const timestamp = this.numberToString(this.nonce());
            body = query;
            if ((payload === '/v4/order') || (payload === '/future/trade/v1/order/create') || (payload === '/future/trade/v1/entrust/create-plan') || (payload === '/future/trade/v1/entrust/create-profit') || (payload === '/future/trade/v1/order/create-batch')) {
                const id = 'CCXT';
                if (payload.indexOf('future') > -1) {
                    body['clientMedia'] = id;
                }
                else {
                    body['media'] = id;
                }
            }
            const isUndefinedBody = ((method === 'GET') || (path === 'order/{orderId}'));
            body = isUndefinedBody ? undefined : this.json(body);
            let payloadString = undefined;
            if ((endpoint === 'spot') || (endpoint === 'user')) {
                payloadString = 'xt-validate-algorithms=HmacSHA256&xt-validate-appkey=' + this.apiKey + '&xt-validate-recvwindow=' + recvWindow + '&xt-validate-t' + 'imestamp=' + timestamp;
                if (isUndefinedBody) {
                    if (urlencoded) {
                        url += '?' + urlencoded;
                        payloadString += '#' + method + '#' + payload + '#' + urlencoded;
                    }
                    else {
                        payloadString += '#' + method + '#' + payload;
                    }
                }
                else {
                    payloadString += '#' + method + '#' + payload + '#' + body;
                }
                headers['xt-validate-algorithms'] = 'HmacSHA256';
                headers['xt-validate-recvwindow'] = recvWindow;
            }
            else {
                payloadString = 'xt-validate-appkey=' + this.apiKey + '&xt-validate-t' + 'imestamp=' + timestamp; // we can't glue timestamp, breaks in php
                if (method === 'GET') {
                    if (urlencoded) {
                        url += '?' + urlencoded;
                        payloadString += '#' + payload + '#' + urlencoded;
                    }
                    else {
                        payloadString += '#' + payload;
                    }
                }
                else {
                    payloadString += '#' + payload + '#' + body;
                }
            }
            const signature = this.hmac(this.encode(payloadString), this.encode(this.secret), sha256.sha256);
            headers['xt-validate-appkey'] = this.apiKey;
            headers['xt-validate-timestamp'] = timestamp;
            headers['xt-validate-signature'] = signature;
        }
        else {
            if (urlencoded) {
                url += '?' + urlencoded;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = xt;
