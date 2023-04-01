
//  ---------------------------------------------------------------------------

import Exchange from './abstract/xt.js';
import { Precise } from './base/Precise.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import { AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, NotSupported, OnMaintenance, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';

//  ---------------------------------------------------------------------------

// @ts-expect-error
export default class xt extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xt',
            'name': 'XT',
            'countries': [ 'SC' ], // Seychelles
            // 10 requests per second => 1000ms / 10 = 100 (All other)
            // 3 requests per second => 1000ms / 3 = 333.333 (get assets -> fetchMarkets & fetchCurrencies)
            // 1000 times per minute for each single IP -> Otherwise account locked for 10min
            'rateLimit': 100, // TODO: Is rate limit right? https://doc.xt.com/#documentationlimitRules and https://doc.xt.com/#futures_documentationlimitRules
            'version': 'v4',
            'pro': false,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchLedger': true,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrdersByStatus': true,
                'fetchOrderBook': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'withdraw': true,
            },
            'precisionMode': DECIMAL_PLACES,
            'urls': {
                'logo': '', // TODO: Add logo
                'api': {
                    'spot': 'https://sapi.xt.com',
                    'linear': 'https://fapi.xt.com',
                    'inverse': 'https://dapi.xt.com',
                },
                'www': 'https://xt.com',
                'referral': '', // TODO: Add referral
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
                            'depth': 2,
                            'kline': 1,
                            'symbol': 1, // 0.1 for multiple symbols
                            'ticker': 1, // 0.1 for multiple symbols
                            'ticker/book': 1, // 0.1 for multiple symbols
                            'ticker/price': 1, // 0.1 for multiple symbols
                            'ticker/24h': 1, // 0.1 for multiple symbols
                            'time': 1,
                            'trade/history': 1,
                            'trade/recent': 1,
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
                            'future/market/v1/public/symbol/coins': 3.33333,
                            'future/market/v1/public/symbol/detail': 3.33333,
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
                            'future/market/v1/public/symbol/coins': 3.33333,
                            'future/market/v1/public/symbol/detail': 3.33333,
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
                            'order': 0.5,
                            'withdraw': 1,
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
                },
            },
            'fees': {
                'spot': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('5000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('150000'), this.parseNumber ('0.0010') ],
                            [ this.parseNumber ('300000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('600000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('1200000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('6000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.0002') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('5000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0016') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('150000'), this.parseNumber ('0.0010') ],
                            [ this.parseNumber ('300000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('600000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('1200000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('6000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.0002') ],
                        ],
                    },
                },
                'contract': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0004'),
                    'taker': this.parseNumber ('0.0006'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('200000'), this.parseNumber ('0.00038') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00036') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.00034') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00032') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.00028') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.00024') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00016') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.00012') ],
                            [ this.parseNumber ('500000000'), this.parseNumber ('0.00008') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('200000'), this.parseNumber ('0.000588') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00057') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.00054') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00051') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.00048') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00036') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.00033') ],
                            [ this.parseNumber ('500000000'), this.parseNumber ('0.0003') ],
                        ],
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '404': ExchangeError, // interface does not exist
                    '429': RateLimitExceeded, // The request is too frequent, please control the request rate according to the speed limit requirement
                    '500': ExchangeError, // Service exception
                    '502': ExchangeError, // Gateway exception
                    '503': OnMaintenance, // Service unavailable, please try again later
                    'AUTH_001': AuthenticationError, // missing request header xt-validate-appkey
                    'AUTH_002': AuthenticationError, // missing request header xt-validate-timestamp
                    'AUTH_003': AuthenticationError, // missing request header xt-validate-recvwindow
                    'AUTH_004': AuthenticationError, // bad request header xt-validate-recvwindow
                    'AUTH_005': AuthenticationError, // missing request header xt-validate-algorithms
                    'AUTH_006': AuthenticationError, // bad request header xt-validate-algorithms
                    'AUTH_007': AuthenticationError, // missing request header xt-validate-signature
                    'AUTH_101': AuthenticationError, // ApiKey does not exist
                    'AUTH_102': AuthenticationError, // ApiKey is not activated
                    'AUTH_103': AuthenticationError, // Signature error, {"rc":1,"mc":"AUTH_103","ma":[],"result":null}
                    'AUTH_104': AuthenticationError, // Unbound IP request
                    'AUTH_105': AuthenticationError, // outdated message
                    'AUTH_106': PermissionDenied, // Exceeded apikey permission
                    'SYMBOL_001': BadSymbol, // Symbol not exist
                    'SYMBOL_002': BadSymbol, // Symbol offline
                    'SYMBOL_003': BadSymbol, // Symbol suspend trading
                    'SYMBOL_004': BadSymbol, // Symbol country disallow trading
                    'SYMBOL_005': BadSymbol, // The symbol does not support trading via API
                    'ORDER_001': InvalidOrder, // Platform rejection
                    'ORDER_002': InsufficientFunds, // insufficient funds
                    'ORDER_003': InvalidOrder, // Trading Pair Suspended
                    'ORDER_004': InvalidOrder, // no transaction
                    'ORDER_005': InvalidOrder, // Order not exist
                    'ORDER_006': InvalidOrder, // Too many open orders
                    'ORDER_F0101': InvalidOrder, // Trigger Price Filter - Min
                    'ORDER_F0102': InvalidOrder, // Trigger Price Filter - Max
                    'ORDER_F0103': InvalidOrder, // Trigger Price Filter - Step Value
                    'ORDER_F0201': InvalidOrder, // Trigger Quantity Filter - Min
                    'ORDER_F0202': InvalidOrder, // Trigger Quantity Filter - Max
                    'ORDER_F0203': InvalidOrder, // Trigger Quantity Filter - Step Value
                    'ORDER_F0301': InvalidOrder, // Trigger QUOTE_QTY Filter - Min Value
                    'ORDER_F0401': InvalidOrder, // Trigger PROTECTION_ONLINE Filter
                    'ORDER_F0501': InvalidOrder, // Trigger PROTECTION_LIMIT Filter - Buy Max Deviation
                    'ORDER_F0502': InvalidOrder, // Trigger PROTECTION_LIMIT Filter - Sell Max Deviation
                    'ORDER_F0601': InvalidOrder, // Trigger PROTECTION_MARKET Filter
                    'COMMON_001': ExchangeError, // The user does not exist
                    'COMMON_002': ExchangeError, // System busy, please try it later
                    'COMMON_003': BadRequest, // Operation failed, please try it later
                    'CURRENCY_001': BadRequest, // Information of currency is abnormal
                    'DEPOSIT_001': BadRequest, // Deposit is not open
                    'DEPOSIT_002': PermissionDenied, // The current account security level is low, please bind any two security verifications in mobile phone/email/Google Authenticator before deposit
                    'DEPOSIT_003': BadRequest, // The format of address is incorrect, please enter again
                    'DEPOSIT_004': BadRequest, // The address is already exists, please enter again
                    'DEPOSIT_005': BadRequest, // Can not find the address of offline wallet
                    'DEPOSIT_006': BadRequest, // No deposit address, please try it later
                    'DEPOSIT_007': BadRequest, // Address is being generated, please try it later
                    'DEPOSIT_008': BadRequest, // Deposit is not available
                    'WITHDRAW_001': BadRequest, // Withdraw is not open
                    'WITHDRAW_002': BadRequest, // The withdrawal address is invalid
                    'WITHDRAW_003': PermissionDenied, // The current account security level is low, please bind any two security verifications in mobile phone/email/Google Authenticator before withdraw
                    'WITHDRAW_004': BadRequest, // The withdrawal address is not added
                    'WITHDRAW_005': BadRequest, // The withdrawal address cannot be empty
                    'WITHDRAW_006': BadRequest, // Memo cannot be empty
                    'WITHDRAW_008': PermissionDenied, // Risk control is triggered, withdraw of this currency is not currently supported
                    'WITHDRAW_009': PermissionDenied, // Withdraw failed, some assets in this withdraw are restricted by T+1 withdraw
                    'WITHDRAW_010': BadRequest, // The precision of withdrawal is invalid
                    'WITHDRAW_011': InsufficientFunds, // free balance is not enough
                    'WITHDRAW_012': PermissionDenied, // Withdraw failed, your remaining withdrawal limit today is not enough
                    'WITHDRAW_013': PermissionDenied, // Withdraw failed, your remaining withdrawal limit today is not enough, the withdrawal amount can be increased by completing a higher level of real-name authentication
                    'WITHDRAW_014': BadRequest, // This withdrawal address cannot be used in the internal transfer function, please cancel the internal transfer function before submitting
                    'WITHDRAW_015': BadRequest, // The withdrawal amount is not enough to deduct the handling fee
                    'WITHDRAW_016': BadRequest, // This withdrawal address is already exists
                    'WITHDRAW_017': BadRequest, // This withdrawal has been processed and cannot be canceled
                    'WITHDRAW_018': BadRequest, // Memo must be a number
                    'WITHDRAW_019': BadRequest, // Memo is incorrect, please enter again
                    'WITHDRAW_020': PermissionDenied, // Your withdrawal amount has reached the upper limit for today, please try it tomorrow
                    'WITHDRAW_021': PermissionDenied, // Your withdrawal amount has reached the upper limit for today, you can only withdraw up to {0} this time
                    'WITHDRAW_022': BadRequest, // Withdrawal amount must be greater than {0}
                    'WITHDRAW_023': BadRequest, // Withdrawal amount must be less than {0}
                    'WITHDRAW_024': BadRequest, // Withdraw is not supported
                    'WITHDRAW_025': BadRequest, // Please create a FIO address in the deposit page
                    'symbol_not_support_trading_via_api': BadSymbol, // {"returnCode":1,"msgInfo":"failure","error":{"code":"symbol_not_support_trading_via_api","msg":"The symbol does not support trading via API"},"result":null}
                    'open_order_min_nominal_value_limit': InvalidOrder, // {"returnCode":1,"msgInfo":"failure","error":{"code":"open_order_min_nominal_value_limit","msg":"Exceeds the minimum notional value of a single order"},"result":null}
                },
                'broad': {
                    'The symbol does not support trading via API': BadSymbol, // {"returnCode":1,"msgInfo":"failure","error":{"code":"symbol_not_support_trading_via_api","msg":"The symbol does not support trading via API"},"result":null}
                    'Exceeds the minimum notional value of a single order': InvalidOrder, // {"returnCode":1,"msgInfo":"failure","error":{"code":"open_order_min_nominal_value_limit","msg":"Exceeds the minimum notional value of a single order"},"result":null}
                },
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h', // spot only
                '2h': '2h', // spot only
                '4h': '4h',
                '6h': '6h', // spot only
                '8h': '8h', // spot only
                '1d': '1d',
                '3d': '3d', // spot only
                '1w': '1w',
                '1M': '1M', // spot only
            },
            'commonCurrencies': {},
            'options': {
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
                    'FIO': 'FIO',
                    'XT': 'XT Smart Chain',
                    'ETC': 'Ethereum Classic',
                    'EOS': 'EOS',
                    'QTUM': 'QTUM',
                    'HECO': 'HECO',
                    'MATIC': 'Polygon',
                    'METIS': 'METIS',
                    'LTC': 'Litecoin',
                    'BTS': 'BitShares',
                    'XRP': 'Ripple',
                    'XLM': 'Stellar Network',
                    'ADA': 'Cardano',
                    'DASH': 'DASH',
                    'XEM': 'XEM',
                    'XWC': 'XWC-XWC',
                    'DOGE': 'dogecoin',
                    'DCR': 'Decred',
                    'SC': 'Siacoin',
                    'XTZ': 'Tezos',
                    'SCC': 'SCC',
                    'BSV': 'BSV',
                    'ZEC': 'Zcash',
                    'VSYS': 'VSYS',
                    'BTX': 'BTX',
                    'XMR': 'Monero',
                    'LSK': 'Lisk',
                    'ATOM': 'Cosmos',
                    'ONT': 'Ontology',
                    'ALGO': 'Algorand',
                    'RISE': 'RISE',
                    'CSPR': 'CSPR',
                    'SOL': 'SOL-SOL',
                    'DOT': 'Polkadot',
                    'KAVA': 'KAVA',
                    'BEB': 'BEB',
                    'ZEN': 'Horizen',
                    'PC': 'PC',
                    'FIL': 'Filecoin',
                    'MARS': 'MARS',
                    'BITCI': 'BITCI',
                    'CHZ': 'chz',
                    'XCH': 'XCH',
                    'MMUI': 'MMUI',
                    'ICP': 'Internet Computer',
                    'MINA': 'MINA',
                    'KSM': 'Kusama',
                    'LUNA': 'Terra',
                    'THETA': 'Theta Token',
                    'FTM': 'Fantom',
                    'FESS': 'FESS',
                    'FRTS': 'FRTS',
                    'TEC': 'TEC',
                    'SWT': 'SWT',
                    'TOMO': 'TOMO',
                    'VET': 'VeChain',
                    'DEL': 'DEL',
                    'AVAX C-Chain': 'AVAX C-Chain',
                    'CPH': 'CPH',
                    'HDD': 'HDD',
                    'NEAR': 'NEAR Protocol',
                    'ONE': 'Harmony',
                    'KLAY': 'Klaytn',
                    'ABBC': 'ABBC',
                    'LTNM': 'LTNM',
                    'XDC': 'XDC',
                    'PHAE': 'PHAE',
                    'BLKC': 'BLKC',
                    'CELO': 'CELO',
                    'POKT': 'POKT',
                    'WELUPS': 'WELUPS',
                    'XDAI': 'XDAI',
                    'XYM': 'XYM',
                    'AR': 'Arweave',
                    'CELT': 'OKT',
                    'ROSE': 'ROSE',
                    'EGLD': 'Elrond eGold',
                    'WAXP': 'WAXP',
                    'CRO': 'CRO-CRONOS',
                    'BAR': 'BAR',
                    'BCH': 'Bitcoin Cash',
                    'DINGO': 'DINGO',
                    'GLMR': 'Moonbeam',
                    'ARB': 'ARB',
                    'TFUEL': 'TFUEL',
                    'BETH': 'BETH',
                    'LOOP': 'LOOP-LRC',
                    'KYCC': 'KYCC',
                    'CLO': 'CLO',
                    'XFL': 'XFL',
                    'EGX': 'EGX',
                    'WAVES': 'WAVES',
                    'TKG': 'TKG',
                    'REI': 'REI Network',
                    'LYR': 'LYR',
                    'ASTR': 'Astar Network',
                    'IOST': 'IOST',
                    'GAL(FT)': 'GAL(FT)',
                    'WEMIX': 'WEMIX',
                    'LUNC': 'LUNC',
                    'OP': 'OPT',
                    'HBAR': 'HBAR',
                    'PLCUC': 'PLCUC',
                    'CUBE': 'CUBE',
                    'BND': 'BND',
                    'MMT': 'MMT-MMT',
                    'VXXL': 'VXXL',
                    'BBC': 'BBC',
                    'EVMOS': 'EVMOS',
                    'REDLC': 'REDLC',
                    'IVAR': 'IVAR',
                    'QIE': 'QIE',
                    'RVN': 'RVN',
                    'unkown': 'unkown',
                    'ETHW': 'ETHW',
                    'ETHS': 'ETHS',
                    'ETHF': 'ETHF',
                    'TBC': 'TBC-TBC',
                    'NEOX': 'NEOX',
                    'OMAX': 'OMAX-OMAX CHAIN',
                    'KUB': 'KUB',
                    'AIPC': 'AIPC',
                    'LAT': 'LAT',
                    'ALEO(IOU)': 'ALEO(IOU)',
                    'APT': 'APT',
                    'PIRI': 'PIRI',
                    'PETH': 'PETH',
                    'MLXC': 'MLXC',
                    'NXT': 'NXT',
                    'PI': 'PI',
                    'PLCU': 'PLCU',
                    'GMMT': 'GMMT chain',
                    'CORE': 'CORE',
                    'BTC2': 'BTC2',
                    'NEO': 'NEO',
                    'ZIL': 'Zilliqa',
                },
                'networksById': {
                    'Ethereum': 'ERC20',
                    'Tron': 'TRC20',
                    'BNB Smart Chain': 'BEP20',
                    'BNB-BEP2': 'BEP2',
                    'Bitcoin': 'BTC',
                    'FIO': 'FIO',
                    'XT Smart Chain': 'XT',
                    'Ethereum Classic': 'ETC',
                    'EOS': 'EOS',
                    'QTUM': 'QTUM',
                    'HECO': 'HECO',
                    'Polygon': 'MATIC',
                    'METIS': 'METIS',
                    'Litecoin': 'LTC',
                    'BitShares': 'BTS',
                    'Ripple': 'XRP',
                    'Stellar Network': 'XLM',
                    'Cardano': 'ADA',
                    'DASH': 'DASH',
                    'XEM': 'XEM',
                    'XWC-XWC': 'XWC',
                    'dogecoin': 'DOGE',
                    'Decred': 'DCR',
                    'Siacoin': 'SC',
                    'Tezos': 'XTZ',
                    'SCC': 'SCC',
                    'BSV': 'BSV',
                    'Zcash': 'ZEC',
                    'VSYS': 'VSYS',
                    'BTX': 'BTX',
                    'Monero': 'XMR',
                    'Lisk': 'LSK',
                    'Cosmos': 'ATOM',
                    'Ontology': 'ONT',
                    'Algorand': 'ALGO',
                    'RISE': 'RISE',
                    'CSPR': 'CSPR',
                    'SOL-SOL': 'SOL',
                    'Polkadot': 'DOT',
                    'KAVA': 'KAVA',
                    'BEB': 'BEB',
                    'Horizen': 'ZEN',
                    'PC': 'PC',
                    'Filecoin': 'FIL',
                    'MARS': 'MARS',
                    'BITCI': 'BITCI',
                    'chz': 'CHZ',
                    'XCH': 'XCH',
                    'MMUI': 'MMUI',
                    'Internet Computer': 'ICP',
                    'MINA': 'MINA',
                    'Kusama': 'KSM',
                    'Terra': 'LUNA',
                    'Theta Token': 'THETA',
                    'Fantom': 'FTM',
                    'FESS': 'FESS',
                    'FRTS': 'FRTS',
                    'TEC': 'TEC',
                    'SWT': 'SWT',
                    'TOMO': 'TOMO',
                    'VeChain': 'VET',
                    'DEL': 'DEL',
                    'AVAX C-Chain': 'AVAX C-Chain',
                    'CPH': 'CPH',
                    'HDD': 'HDD',
                    'NEAR Protocol': 'NEAR',
                    'Harmony': 'ONE',
                    'Klaytn': 'KLAY',
                    'ABBC': 'ABBC',
                    'LTNM': 'LTNM',
                    'XDC': 'XDC',
                    'PHAE': 'PHAE',
                    'BLKC': 'BLKC',
                    'CELO': 'CELO',
                    'POKT': 'POKT',
                    'WELUPS': 'WELUPS',
                    'XDAI': 'XDAI',
                    'XYM': 'XYM',
                    'Arweave': 'AR',
                    'OKT': 'CELT',
                    'ROSE': 'ROSE',
                    'Elrond eGold': 'EGLD',
                    'WAXP': 'WAXP',
                    'CRO-CRONOS': 'CRO',
                    'CRONOS': 'CRO',
                    'BAR': 'BAR',
                    'Bitcoin Cash': 'BCH',
                    'DINGO': 'DINGO',
                    'Moonbeam': 'GLMR',
                    'ARB': 'ARB',
                    'TFUEL': 'TFUEL',
                    'BETH': 'BETH',
                    'LOOP-LRC': 'LOOP',
                    'KYCC': 'KYCC',
                    'CLO': 'CLO',
                    'XFL': 'XFL',
                    'EGX': 'EGX',
                    'WAVES': 'WAVES',
                    'TKG': 'TKG',
                    'REI Network': 'REI',
                    'LYR': 'LYR',
                    'Astar Network': 'ASTR',
                    'IOST': 'IOST',
                    'GAL(FT)': 'GAL(FT)',
                    'WEMIX': 'WEMIX',
                    'LUNC': 'LUNC',
                    'OPT': 'OP',
                    'HBAR': 'HBAR',
                    'PLCUC': 'PLCUC',
                    'CUBE': 'CUBE',
                    'BND': 'BND',
                    'MMT-MMT': 'MMT',
                    'VXXL': 'VXXL',
                    'BBC': 'BBC',
                    'EVMOS': 'EVMOS',
                    'REDLC': 'REDLC',
                    'IVAR': 'IVAR',
                    'QIE': 'QIE',
                    'RVN': 'RVN',
                    'unkown': 'unkown',
                    'ETHW': 'ETHW',
                    'ETHS': 'ETHS',
                    'ETHF': 'ETHF',
                    'TBC-TBC': 'TBC',
                    'NEOX': 'NEOX',
                    'OMAX-OMAX CHAIN': 'OMAX',
                    'KUB': 'KUB',
                    'AIPC': 'AIPC',
                    'LAT': 'LAT',
                    'ALEO(IOU)': 'ALEO(IOU)',
                    'APT': 'APT',
                    'PIRI': 'PIRI',
                    'PETH': 'PETH',
                    'MLXC': 'MLXC',
                    'NXT': 'NXT',
                    'PI': 'PI',
                    'PLCU': 'PLCU',
                    'GMMT chain': 'GMMT',
                    'CORE': 'CORE',
                    'BTC2': 'BTC2',
                    'NEO': 'NEO',
                    'Zilliqa': 'ZIL',
                },
                'createMarketBuyOrderRequiresPrice': true,
                'recvWindow': '5000', // in milliseconds, spot only
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name xt#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the xt server
         * @see https://doc.xt.com/#market1serverInfo
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the xt server
         */
        const response = await this.publicSpotGetTime (params);
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
        const data = this.safeValue (response, 'result');
        return this.safeInteger (data, 'serverTime');
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name xt#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://doc.xt.com/#deposit_withdrawalsupportedCurrenciesGet
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicSpotGetWalletSupportCurrency (params);
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
        //                         "withdrawEnabled": true
        //                     },
        //                 ]
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const rawNetworks = this.safeValue (entry, 'supportChains', []);
            const networks = {};
            let depositEnabled = undefined;
            let withdrawEnabled = undefined;
            for (let j = 0; j < rawNetworks.length; j++) {
                const rawNetwork = rawNetworks[j];
                const networkId = this.safeString (rawNetwork, 'chain');
                const network = this.networkIdToCode (networkId);
                depositEnabled = this.safeValue (rawNetwork, 'depositEnabled');
                withdrawEnabled = this.safeValue (rawNetwork, 'withdrawEnabled');
                networks[network] = {
                    'info': rawNetwork,
                    'id': networkId,
                    'network': network,
                    'name': undefined,
                    'active': undefined,
                    'fee': undefined,
                    'precision': undefined,
                    'deposit': depositEnabled,
                    'withdraw': withdrawEnabled,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': undefined,
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
                'name': undefined,
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'networks': networks,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
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

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name xt#fetchMarkets
         * @description retrieves data on all markets for xt
         * @see https://doc.xt.com/#market2symbol
         * @see https://doc.xt.com/#futures_quotesgetSymbols
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const promisesUnresolved = [
            this.fetchSpotMarkets (params),
            this.fetchSwapAndFutureMarkets (params),
        ];
        const promises = await Promise.all (promisesUnresolved);
        const spotMarkets = promises[0];
        const swapAndFutureMarkets = promises[1];
        return this.arrayConcat (spotMarkets, swapAndFutureMarkets);
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.publicSpotGetSymbol (params);
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
        const data = this.safeValue (response, 'result', {});
        const symbols = this.safeValue (data, 'symbols', []);
        return this.parseMarkets (symbols);
    }

    async fetchSwapAndFutureMarkets (params = {}) {
        const markets = await Promise.all ([ this.publicLinearGetFutureMarketV1PublicSymbolList (params), this.publicInverseGetFutureMarketV1PublicSymbolList (params) ]);
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
        const swapAndFutureMarkets = this.arrayConcat (this.safeValue (markets[0], 'result', []), this.safeValue (markets[1], 'result', []));
        return this.parseMarkets (swapAndFutureMarkets);
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
        //                 "filter": "PROTECTION_LIMIT",
        //                 "buyMaxDeviation": "0.8",
        //                 "sellMaxDeviation": "4"
        //             },
        //             {
        //                 "filter": "PROTECTION_MARKET",
        //                 "maxDeviation": "0.02"
        //             }
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
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString2 (market, 'baseCurrency', 'baseCoin');
        const quoteId = this.safeString2 (market, 'quoteCurrency', 'quoteCoin');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const state = this.safeString (market, 'state');
        let symbol = base + '/' + quote;
        const filters = this.safeValue (market, 'filters', []);
        let minAmount = undefined;
        for (let i = 0; i < filters.length; i++) {
            const entry = filters[i];
            const filter = this.safeString (entry, 'filter');
            if (filter === 'QUOTE_QTY') {
                minAmount = this.safeNumber (entry, 'min');
            }
        }
        const underlyingType = this.safeString (market, 'underlyingType');
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
        } else if (underlyingType === 'COIN_BASED') {
            symbol = symbol + ':' + base;
            settleId = baseId;
            settle = base;
            linear = false;
            inverse = true;
        }
        if (underlyingType !== undefined) {
            expiry = this.safeInteger (market, 'deliveryDate');
            const productType = this.safeString (market, 'productType');
            if (productType !== 'perpetual') {
                symbol = symbol + '-' + this.yymmdd (expiry);
                type = 'future';
                future = true;
            } else {
                type = 'swap';
                swap = true;
            }
            minAmount = this.safeNumber (market, 'minQty');
            contract = true;
            spot = false;
        }
        return {
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
            'active': (state === 'ONLINE') || (state === '0') ? true : false,
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'taker': this.safeNumber (market, 'takerFee'),
            'maker': this.safeNumber (market, 'makerFee'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'price': this.safeNumber (market, 'pricePrecision'),
                'amount': this.safeNumber (market, 'quantityPrecision'),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': undefined,
                },
                'amount': {
                    'min': minAmount,
                    'max': undefined,
                },
                'price': {
                    'min': this.safeNumber (market, 'minPrice'),
                    'max': this.safeNumber (market, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'minNotional'),
                    'max': this.safeNumber (market, 'maxNotional'),
                },
            },
            'info': market,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://doc.xt.com/#market4kline
         * @see https://doc.xt.com/#futures_quotesgetKLine
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['linear']) {
            response = await this.publicLinearGetFutureMarketV1PublicQKline (this.extend (request, params));
        } else if (market['inverse']) {
            response = await this.publicInverseGetFutureMarketV1PublicQKline (this.extend (request, params));
        } else {
            response = await this.publicSpotGetKline (this.extend (request, params));
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
        const ohlcvs = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
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
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber2 (ohlcv, volumeIndex, 'v'),
        ];
    }

    async fetchOrderBook (symbol, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOrderBook
         * @see https://doc.xt.com/#market3depth
         * @see https://doc.xt.com/#futures_quotesgetDepth
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified market symbol to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.publicSpotGetDepth (this.extend (request, params));
        } else {
            if (limit !== undefined) {
                request['level'] = Math.min (limit, 50);
            } else {
                request['level'] = 50;
            }
            if (market['linear']) {
                response = await this.publicLinearGetFutureMarketV1PublicQDepth (this.extend (request, params));
            } else if (market['inverse']) {
                response = await this.publicInverseGetFutureMarketV1PublicQDepth (this.extend (request, params));
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
        const orderBook = this.safeValue (response, 'result', {});
        const timestamp = this.safeNumber2 (orderBook, 'timestamp', 't');
        if (market['spot']) {
            return this.parseOrderBook (orderBook, symbol, timestamp);
        }
        return this.parseOrderBook (orderBook, symbol, timestamp, 'b', 'a');
    }

    async fetchTicker (symbol, params = {}) {
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['linear']) {
            response = await this.publicLinearGetFutureMarketV1PublicQAggTicker (this.extend (request, params));
        } else if (market['inverse']) {
            response = await this.publicInverseGetFutureMarketV1PublicQAggTicker (this.extend (request, params));
        } else {
            response = await this.publicSpotGetTicker24h (this.extend (request, params));
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
        const ticker = this.safeValue (response, 'result');
        if (market['spot']) {
            return this.parseTicker (ticker[0], market);
        }
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://doc.xt.com/#market10ticker24h
         * @see https://doc.xt.com/#futures_quotesgetAggTickers
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
            market = this.market (symbols[0]);
        }
        const request = {};
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchTickers', market, params);
        let response = undefined;
        if (market['spot']) {
            request['symbols'] = symbols;
            response = await this.publicSpotGetTicker24h (this.extend (request, params));
        } else {
            if (symbols !== undefined) {
                throw new NotSupported (this.id + ' the symbols argument is not supported for swap and future markets');
            }
            if (subType === 'linear') {
                response = await this.publicLinearGetFutureMarketV1PublicQAggTickers (this.extend (request, params));
            } else if (subType === 'inverse') {
                response = await this.publicInverseGetFutureMarketV1PublicQAggTickers (this.extend (request, params));
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
        const tickers = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i], market);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchBidsAsks (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple markets
         * @see https://doc.xt.com/#market9tickerBook
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            market = this.market (symbols[0]);
            request['symbols'] = symbols;
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchBidsAsks', market, params);
        if (subType !== undefined) {
            throw new NotSupported (this.id + ' fetchBidsAsks() is not available for swap and future markets, only spot markets are supported');
        }
        const response = await this.publicSpotGetTickerBook (this.extend (request, params));
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
        const tickers = this.safeValue (response, 'result', []);
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker, market = undefined) {
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
        const marketId = this.safeString (ticker, 's');
        let marketType = (market !== undefined) ? market['type'] : undefined;
        if (marketType === undefined) {
            marketType = ('cv' in ticker) || ('aq' in ticker) ? 'spot' : 'contract';
        }
        market = this.safeMarket (marketId, market, '_', marketType);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 't');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'h'),
            'low': this.safeNumber (ticker, 'l'),
            'bid': this.safeNumber (ticker, 'bp'),
            'bidVolume': this.safeNumber (ticker, 'bq'),
            'ask': this.safeNumber (ticker, 'ap'),
            'askVolume': this.safeNumber (ticker, 'aq'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': this.safeString (ticker, 'c'),
            'last': this.safeString (ticker, 'c'),
            'previousClose': undefined,
            'change': this.safeNumber (ticker, 'cv'),
            'percentage': this.safeNumber2 (ticker, 'cr', 'r'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeNumber2 (ticker, 'a', 'v'),
            'info': ticker,
        }, market);
    }

    async fetchTrades (symbol, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://doc.xt.com/#market5tradeRecent
         * @see https://doc.xt.com/#futures_quotesgetDeal
         * @param {string} symbol unified market symbol to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.publicSpotGetTradeRecent (this.extend (request, params));
        } else {
            if (limit !== undefined) {
                request['num'] = limit;
            }
            if (market['linear']) {
                response = await this.publicLinearGetFutureMarketV1PublicQDeal (this.extend (request, params));
            } else if (market['inverse']) {
                response = await this.publicInverseGetFutureMarketV1PublicQDeal (this.extend (request, params));
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
        const trades = this.safeValue (response, 'result', []);
        return this.parseTrades (trades, market);
    }

    async fetchMyTrades (symbol: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://doc.xt.com/#tradetradeGet
         * @see https://doc.xt.com/#futures_ordergetTrades
         * @param {string|undefined} symbol unified market symbol to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchMyTrades', market, params);
        let response = undefined;
        if (subType !== undefined) {
            if (limit !== undefined) {
                request['size'] = limit;
            }
            if (subType === 'linear') {
                response = await this.privateLinearGetFutureTradeV1OrderTradeList (this.extend (request, params));
            } else if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1OrderTradeList (this.extend (request, params));
            }
        } else {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMyTrades', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.privateSpotGetTrade (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const trades = this.safeValue (data, 'items', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
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
        const marketId = this.safeString2 (trade, 's', 'symbol');
        let marketType = (market !== undefined) ? market['type'] : undefined;
        if (marketType === undefined) {
            marketType = ('b' in trade) || ('bizType' in trade) ? 'spot' : 'contract';
        }
        market = this.safeMarket (marketId, market, '_', marketType);
        const bidOrAsk = this.safeString (trade, 'm');
        let side = this.safeStringLower (trade, 'orderSide');
        if (bidOrAsk !== undefined) {
            side = (bidOrAsk === 'BID') ? 'buy' : 'sell';
        }
        const buyerMaker = this.safeValue (trade, 'b');
        let takerOrMaker = this.safeStringLower (trade, 'takerMaker');
        if (buyerMaker !== undefined) {
            takerOrMaker = buyerMaker ? 'maker' : 'taker';
        }
        const timestamp = this.safeIntegerN (trade, [ 't', 'time', 'timestamp' ]);
        const quantity = this.safeString2 (trade, 'q', 'quantity');
        const amount = (marketType === 'spot') ? quantity : Precise.stringMul (quantity, this.numberToString (market['contractSize']));
        return {
            'info': trade,
            'id': this.safeStringN (trade, [ 'i', 'tradeId', 'execId' ]),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'orderId'),
            'type': this.safeStringLower (trade, 'orderType'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeNumber2 (trade, 'p', 'price'),
            'amount': this.parseNumber (amount),
            'cost': undefined,
            'fee': {
                'currency': this.safeCurrencyCode (this.safeString2 (trade, 'feeCurrency', 'feeCoin')),
                'cost': this.safeNumber (trade, 'fee'),
                'rate': undefined,
            },
        };
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name xt#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://doc.xt.com/#balancebalancesGet
         * @see https://doc.xt.com/#futures_usergetBalances
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchBalance', undefined, params);
        let response = undefined;
        if (subType === 'linear') {
            response = await this.privateLinearGetFutureUserV1BalanceList (params);
        } else if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1BalanceList (params);
        } else {
            response = await this.privateSpotGetBalances (params);
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
        if (subType !== undefined) {
            balances = this.safeValue (response, 'result', []);
        } else {
            const data = this.safeValue (response, 'result', {});
            balances = this.safeValue (data, 'assets', []);
        }
        return this.parseBalance (balances);
    }

    parseBalance (response) {
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
            const currencyId = this.safeString2 (balance, 'currency', 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const free = this.safeString2 (balance, 'availableAmount', 'availableBalance');
            let used = this.safeString (balance, 'frozenAmount');
            const total = this.safeString2 (balance, 'totalAmount', 'walletBalance');
            if (used === undefined) {
                const crossedAndIsolatedMargin = Precise.stringAdd (this.safeString (balance, 'crossedMargin'), this.safeString (balance, 'isolatedMargin'));
                used = Precise.stringAdd (this.safeString (balance, 'openOrderMarginFrozen'), crossedAndIsolatedMargin);
            }
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol, type, side, amount, price: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#createOrder
         * @description create a trade order
         * @see https://doc.xt.com/#orderorderPost
         * @see https://doc.xt.com/#futures_ordercreate
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float|undefined} price the price to fulfill the order, in units of the quote currency, can be ignored in market orders
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string|undefined} params.timeInForce 'GTC', 'IOC', 'FOK' or 'GTX'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let timeInForce = this.safeStringUpper (params, 'timeInForce', 'GTC');
        let response = undefined;
        if (market['spot']) {
            request['side'] = side.toUpperCase ();
            request['type'] = type.toUpperCase ();
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            if (type === 'market') {
                timeInForce = this.safeStringUpper (params, 'timeInForce', 'FOK');
                if (side === 'buy') {
                    const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price === undefined) {
                            throw new InvalidOrder (this.id + ' createOrder() requires a price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                        } else {
                            const amountString = this.numberToString (amount);
                            const priceString = this.numberToString (price);
                            const cost = this.parseNumber (Precise.stringMul (amountString, priceString));
                            request['quoteQty'] = this.costToPrecision (symbol, cost);
                        }
                    } else {
                        request['quoteQty'] = this.amountToPrecision (symbol, amount);
                    }
                } else {
                    request['quantity'] = this.amountToPrecision (symbol, amount);
                }
            } else {
                request['price'] = this.priceToPrecision (symbol, price);
                request['quantity'] = this.amountToPrecision (symbol, amount);
            }
            request['timeInForce'] = timeInForce;
            response = await this.privateSpotPostOrder (this.extend (request, params));
        } else {
            request['orderSide'] = side.toUpperCase ();
            request['orderType'] = type.toUpperCase ();
            const convertContractsToAmount = Precise.stringDiv (this.numberToString (amount), this.numberToString (market['contractSize']));
            request['origQty'] = this.amountToPrecision (symbol, this.parseNumber (convertContractsToAmount));
            if (price !== undefined) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (timeInForce !== undefined) {
                request['timeInForce'] = timeInForce;
            }
            const reduceOnly = this.safeValue (params, 'reduceOnly', false);
            if (side === 'buy') {
                const requestType = (reduceOnly) ? 'SHORT' : 'LONG';
                request['positionSide'] = requestType;
            } else {
                const requestType = (reduceOnly) ? 'LONG' : 'SHORT';
                request['positionSide'] = requestType;
            }
            if (market['linear']) {
                response = await this.privateLinearPostFutureTradeV1OrderCreate (this.extend (request, params));
            } else if (market['inverse']) {
                response = await this.privateInversePostFutureTradeV1OrderCreate (this.extend (request, params));
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
        //             "orderId": "204371980095156544"
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": "206410760006650176"
        //     }
        //
        const order = (market['spot']) ? this.safeValue (response, 'result', {}) : response;
        return this.parseOrder (order, market);
    }

    async fetchOrder (id, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://doc.xt.com/#orderorderGet
         * @see https://doc.xt.com/#futures_ordergetById
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchOrder', market, params);
        const request = {
            'orderId': id,
        };
        let response = undefined;
        if (subType === 'linear') {
            response = await this.privateLinearGetFutureTradeV1OrderDetail (this.extend (request, params));
        } else if (subType === 'inverse') {
            response = await this.privateInverseGetFutureTradeV1OrderDetail (this.extend (request, params));
        } else {
            response = await this.privateSpotGetOrderOrderId (this.extend (request, params));
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
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order, market);
    }

    async fetchOrders (symbol: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://doc.xt.com/#orderhistoryOrderGet
         * @see https://doc.xt.com/#futures_ordergetHistory
         * @param {string|undefined} symbol unified market symbol of the market the orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchOrders', market, params);
        let response = undefined;
        if (subType === 'linear') {
            response = await this.privateLinearGetFutureTradeV1OrderListHistory (this.extend (request, params));
        } else if (subType === 'inverse') {
            response = await this.privateInverseGetFutureTradeV1OrderListHistory (this.extend (request, params));
        } else {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('fetchOrders', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            response = await this.privateSpotGetHistoryOrder (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const orders = this.safeValue (data, 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrdersByStatus (status, symbol: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchOrdersByStatus', market, params);
        let response = undefined;
        if (status === 'open') {
            if (subType !== undefined) {
                request['state'] = 'NEW';
            }
        } else if (status === 'closed') {
            request['state'] = 'FILLED';
        } else if (status === 'canceled') {
            request['state'] = 'CANCELED';
        } else {
            request['state'] = status;
        }
        if (subType !== undefined) {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['size'] = limit;
            }
            if (subType === 'linear') {
                response = await this.privateLinearGetFutureTradeV1OrderList (this.extend (request, params));
            } else if (subType === 'inverse') {
                response = await this.privateInverseGetFutureTradeV1OrderList (this.extend (request, params));
            }
        } else {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('fetchOrdersByStatus', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            if (status !== 'open') {
                if (since !== undefined) {
                    request['startTime'] = since;
                }
                if (limit !== undefined) {
                    request['limit'] = limit;
                }
                response = await this.privateSpotGetHistoryOrder (this.extend (request, params));
            } else {
                response = await this.privateSpotGetOpenOrder (this.extend (request, params));
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
        const isSpotOpenOrders = ((status === 'open') && (subType === undefined));
        const data = this.safeValue (response, 'result', {});
        const orders = isSpotOpenOrders ? this.safeValue (response, 'result', []) : this.safeValue (data, 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://doc.xt.com/#orderopenOrderGet
         * @see https://doc.xt.com/#futures_ordergetOrders
         * @param {string|undefined} symbol unified market symbol of the market the orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order
         * @param {int|undefined} limit the maximum number of open order structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://doc.xt.com/#orderhistoryOrderGet
         * @see https://doc.xt.com/#futures_ordergetOrders
         * @param {string|undefined} symbol unified market symbol of the market the orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    async fetchCanceledOrders (symbol: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @see https://doc.xt.com/#orderhistoryOrderGet
         * @see https://doc.xt.com/#futures_ordergetOrders
         * @param {string|undefined} symbol unified market symbol of the market the orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        return await this.fetchOrdersByStatus ('canceled', symbol, since, limit, params);
    }

    async cancelOrder (id, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name xt#cancelOrder
         * @description cancels an open order
         * @see https://doc.xt.com/#orderorderDel
         * @see https://doc.xt.com/#futures_ordercancel
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'orderId': id,
        };
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('cancelOrder', market, params);
        let response = undefined;
        if (subType === 'linear') {
            response = await this.privateLinearPostFutureTradeV1OrderCancel (this.extend (request, params));
        } else if (subType === 'inverse') {
            response = await this.privateInversePostFutureTradeV1OrderCancel (this.extend (request, params));
        } else {
            response = await this.privateSpotDeleteOrderOrderId (this.extend (request, params));
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
        const order = (subType !== undefined) ? response : this.safeValue (response, 'result', {});
        return this.parseOrder (order, market);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name xt#cancelAllOrders
         * @description cancel all open orders in a market
         * @see https://doc.xt.com/#orderopenOrderDel
         * @see https://doc.xt.com/#futures_ordercancelBatch
         * @param {string|undefined} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('cancelAllOrders', market, params);
        let response = undefined;
        if (subType === 'linear') {
            response = await this.privateLinearPostFutureTradeV1OrderCancelAll (this.extend (request, params));
        } else if (subType === 'inverse') {
            response = await this.privateInversePostFutureTradeV1OrderCancelAll (this.extend (request, params));
        } else {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('cancelAllOrders', params);
            const marginOrSpotRequest = (marginMode !== undefined) ? 'LEVER' : 'SPOT';
            request['bizType'] = marginOrSpotRequest;
            response = await this.privateSpotDeleteOpenOrder (this.extend (request, params));
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
        return response;
    }

    async cancelOrders (ids, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name xt#cancelOrders
         * @description cancel multiple orders
         * @see https://doc.xt.com/#orderbatchOrderDel
         * @param {[string]} ids order ids
         * @param {string|undefined} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderIds': ids,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('cancelOrders', market, params);
        if (subType !== undefined) {
            throw new NotSupported (this.id + ' cancelOrders() does not support swap and future orders, only spot orders are accepted');
        }
        const response = await this.privateSpotDeleteBatchOrder (this.extend (request, params));
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
        return response;
    }

    parseOrder (order, market = undefined) {
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
        const marketId = this.safeString (order, 'symbol');
        const marketType = ('result' in order) || ('closePosition' in order) ? 'contract' : 'spot';
        market = this.safeMarket (marketId, market, undefined, marketType);
        const symbol = this.safeSymbol (marketId, market, undefined, marketType);
        const timestamp = this.safeInteger2 (order, 'time', 'createdTime');
        const quantity = this.safeNumber (order, 'origQty');
        const amount = (marketType === 'spot') ? quantity : Precise.stringMul (this.numberToString (quantity), this.numberToString (market['contractSize']));
        const filledQuantity = this.safeNumber (order, 'executedQty');
        const filled = (marketType === 'spot') ? filledQuantity : Precise.stringMul (this.numberToString (filledQuantity), this.numberToString (market['contractSize']));
        const triggerStopPrice = this.safeNumber (order, 'triggerStopPrice');
        const triggerProfitPrice = this.safeNumber (order, 'triggerProfitPrice');
        const triggerPrice = (triggerStopPrice !== 0) ? triggerStopPrice : triggerProfitPrice;
        return this.safeOrder ({
            'info': order,
            'id': this.safeStringN (order, [ 'orderId', 'result', 'cancelId' ]),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'updatedTime'),
            'symbol': symbol,
            'type': this.safeStringLower2 (order, 'type', 'orderType'),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'side': this.safeStringLower2 (order, 'side', 'orderSide'),
            'price': this.safeNumber (order, 'price'),
            'triggerPrice': (triggerPrice !== 0) ? triggerPrice : undefined,
            'amount': amount,
            'filled': filled,
            'remaining': this.safeNumber (order, 'leavingQty'),
            'cost': undefined,
            'average': this.safeNumber (order, 'avgPrice'),
            'status': this.parseOrderStatus (this.safeString (order, 'state')),
            'fee': {
                'currency': this.safeCurrencyCode (this.safeString (order, 'feeCurrency')),
                'cost': this.safeNumber (order, 'fee'),
            },
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchLedger (code: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
         * @see https://doc.xt.com/#futures_usergetBalanceBill
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry
         * @param {int|undefined} limit max number of ledger entries to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchLedger', undefined, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1BalanceBills (this.extend (request, params));
        } else if (subType === 'linear') {
            response = await this.privateLinearGetFutureUserV1BalanceBills (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchLedger() does not support spot transactions, only swap and future wallet transactions are supported');
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
        const data = this.safeValue (response, 'result', {});
        const ledger = this.safeValue (data, 'items', []);
        return this.parseLedger (ledger, currency, since, limit);
    }

    parseLedgerEntry (item, currency = undefined) {
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
        const side = this.safeString (item, 'side');
        const direction = (side === 'ADD') ? 'in' : 'out';
        const currencyId = this.safeString (item, 'coin');
        const timestamp = this.safeInteger (item, 'createdTime');
        return {
            'id': this.safeString (item, 'id'),
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType (this.safeString (item, 'type')),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (item, 'amount'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': this.safeNumber (item, 'afterAmount'),
            'status': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
            'info': item,
        };
    }

    parseLedgerEntryType (type) {
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
        return this.safeString (ledgerType, type, type);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name xt#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://doc.xt.com/#deposit_withdrawaldepositAddressGet
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        const currency = this.currency (code);
        const networkIdsByCodes = this.safeValue (this.options, 'networks', {});
        const networkId = this.safeString2 (networkIdsByCodes, networkCode, code);
        const request = {
            'currency': currency['id'],
            'chain': networkId,
        };
        const response = await this.privateSpotGetDepositAddress (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        return this.parseDepositAddress (result, currency);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "address": "0x7f7173cf29d3846d20ca5a3aec1120b93dbd157a",
        //         "memo": ""
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        return {
            'currency': this.safeCurrencyCode (undefined, currency),
            'address': address,
            'tag': this.safeString (depositAddress, 'memo'),
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDeposits (code: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://doc.xt.com/#deposit_withdrawalhistoryDepositGet
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of transaction structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 200
        }
        const response = await this.privateSpotGetDepositHistory (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const deposits = this.safeValue (data, 'items', []);
        return this.parseTransactions (deposits, currency, since, limit, params);
    }

    async fetchWithdrawals (code: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://doc.xt.com/#deposit_withdrawalwithdrawHistory
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of transaction structures to retrieve
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 200
        }
        const response = await this.privateSpotGetWithdrawHistory (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const withdrawals = this.safeValue (data, 'items', []);
        return this.parseTransactions (withdrawals, currency, since, limit, params);
    }

    async withdraw (code, amount, address, tag: string = undefined, params = {}) {
        /**
         * @method
         * @name xt#withdraw
         * @description make a withdrawal
         * @see https://doc.xt.com/#deposit_withdrawalwithdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        const networkIdsByCodes = this.safeValue (this.options, 'networks', {});
        const networkId = this.safeString2 (networkIdsByCodes, networkCode, code);
        const request = {
            'currency': currency['id'],
            'chain': networkId,
            'amount': this.currencyToPrecision (code, amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privateSpotPostWithdraw (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        return this.parseTransaction (result, currency);
    }

    parseTransaction (transaction, currency = undefined) {
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
        const timestamp = this.safeInteger (transaction, 'createdTime');
        const address = this.safeString (transaction, 'address');
        const memo = this.safeString (transaction, 'memo');
        const currencyCode = this.safeCurrencyCode (this.safeString (transaction, 'currency'), currency);
        const fee = this.safeNumber (transaction, 'fee');
        const feeCurrency = (fee !== undefined) ? currencyCode : undefined;
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'transactionId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'updated': undefined,
            'addressFrom': this.safeString (transaction, 'fromAddr'),
            'addressTo': address,
            'address': address,
            'tagFrom': undefined,
            'tagTo': undefined,
            'tag': memo,
            'type': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': currencyCode,
            'network': this.safeString (transaction, 'chain'),
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'comment': memo,
            'fee': {
                'currency': feeCurrency,
                'cost': fee,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'SUBMIT': 'pending',
            'REVIEW': 'pending',
            'AUDITED': 'pending',
            'PENDING': 'pending',
            'CANCEL': 'canceled',
            'FAIL': 'failed',
            'SUCCESS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async setLeverage (leverage, symbol: string = undefined, params = {}) {
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
        this.checkRequiredSymbol ('setLeverage', symbol);
        const positionSide = this.safeString (params, 'positionSide');
        this.checkRequiredArgument ('setLeverage', positionSide, 'positionSide', [ 'LONG', 'SHORT' ]);
        if ((leverage < 1) || (leverage > 125)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and 125');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!(market['contract'])) {
            throw new BadSymbol (this.id + ' setLeverage() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
            'positionSide': positionSide,
            'leverage': leverage,
        };
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('setLeverage', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInversePostFutureUserV1PositionAdjustLeverage (this.extend (request, params));
        } else {
            response = await this.privateLinearPostFutureUserV1PositionAdjustLeverage (this.extend (request, params));
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

    async addMargin (symbol, amount, params = {}) {
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
        return await this.modifyMarginHelper (symbol, amount, 'ADD', params);
    }

    async reduceMargin (symbol, amount, params = {}) {
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
        return await this.modifyMarginHelper (symbol, amount, 'SUB', params);
    }

    async modifyMarginHelper (symbol, amount, addOrReduce, params = {}) {
        const positionSide = this.safeString (params, 'positionSide');
        this.checkRequiredArgument ('setLeverage', positionSide, 'positionSide', [ 'LONG', 'SHORT' ]);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'margin': amount,
            'type': addOrReduce,
            'positionSide': positionSide,
        };
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('modifyMarginHelper', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInversePostFutureUserV1PositionMargin (this.extend (request, params));
        } else {
            response = await this.privateLinearPostFutureUserV1PositionMargin (this.extend (request, params));
        }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": null
        //     }
        //
        return this.parseMarginModification (response, market);
    }

    parseMarginModification (data, market = undefined) {
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': undefined,
            'symbol': this.safeSymbol (undefined, market),
            'status': undefined,
        };
    }

    async fetchLeverageTiers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchLeverageTiers
         * @see https://doc.xt.com/#futures_quotesgetLeverageBrackets
         * @description retrieve information on the maximum leverage for different trade sizes
         * @param {[string]|undefined} symbols a list of unified market symbols
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
         */
        await this.loadMarkets ();
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchLeverageTiers', undefined, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicLeverageBracketList (params);
        } else {
            response = await this.publicLinearGetFutureMarketV1PublicLeverageBracketList (params);
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
        const data = this.safeValue (response, 'result', []);
        symbols = this.marketSymbols (symbols);
        return this.parseLeverageTiers (data, symbols, 'symbol');
    }

    parseLeverageTiers (response, symbols = undefined, marketIdKey = undefined) {
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
            const marketId = this.safeString (entry, 'symbol');
            const market = this.safeMarket (marketId, undefined, '_', 'contract');
            const symbol = this.safeSymbol (marketId, market);
            if (symbols !== undefined) {
                if (this.inArray (symbol, symbols)) {
                    result[symbol] = this.parseMarketLeverageTiers (entry, market);
                }
            } else {
                result[symbol] = this.parseMarketLeverageTiers (response[i], market);
            }
        }
        return result;
    }

    async fetchMarketLeverageTiers (symbol, params = {}) {
        /**
         * @method
         * @name xt#fetchMarketLeverageTiers
         * @see https://doc.xt.com/#futures_quotesgetLeverageBracket
         * @description retrieve information on the maximum leverage for different trade sizes of a single market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchMarketLeverageTiers', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicLeverageBracketDetail (this.extend (request, params));
        } else {
            response = await this.publicLinearGetFutureMarketV1PublicLeverageBracketDetail (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        return this.parseMarketLeverageTiers (data, market);
    }

    parseMarketLeverageTiers (info, market = undefined) {
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
        const brackets = this.safeValue (info, 'leverageBrackets', []);
        for (let i = 0; i < brackets.length; i++) {
            const tier = brackets[i];
            const marketId = this.safeString (info, 'symbol');
            market = this.safeMarket (marketId, market, '_', 'contract');
            tiers.push ({
                'tier': this.safeInteger (tier, 'bracket'),
                'currency': market['settle'],
                'minNotional': this.safeNumber (brackets[i - 1], 'maxNominalValue', 0),
                'maxNotional': this.safeNumber (tier, 'maxNominalValue'),
                'maintenanceMarginRate': this.safeNumber (tier, 'maintMarginRate'),
                'maxLeverage': this.safeNumber (tier, 'maxLeverage'),
                'info': tier,
            });
        }
        return tiers;
    }

    async fetchFundingRateHistory (symbol: string = undefined, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchFundingRateHistory
         * @description fetches historical funding rates
         * @see https://doc.xt.com/#futures_quotesgetFundingRateRecord
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures] to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        this.checkRequiredSymbol ('fetchFundingRateHistory', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRateHistory() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchFundingRateHistory', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicQFundingRateRecord (this.extend (request, params));
        } else {
            response = await this.publicLinearGetFutureMarketV1PublicQFundingRateRecord (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const items = this.safeValue (result, 'items', []);
        const rates = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId, market);
            const timestamp = this.safeInteger (entry, 'createdTime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name xt#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://doc.xt.com/#futures_quotesgetFundingRate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchFundingRate', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.publicInverseGetFutureMarketV1PublicQFundingRate (this.extend (request, params));
        } else {
            response = await this.publicLinearGetFutureMarketV1PublicQFundingRate (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        return this.parseFundingRate (result, market);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //         "symbol": "btc_usdt",
        //         "fundingRate": "0.000086",
        //         "nextCollectionTime": 1680307200000,
        //         "collectionInternal": 8
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_', 'swap');
        const timestamp = this.safeInteger (contract, 'nextCollectionTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': timestamp,
            'fundingDatetime': this.iso8601 (timestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingHistory (symbol, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchFundingHistory
         * @description fetch the funding history
         * @see https://doc.xt.com/#futures_usergetFunding
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the starting timestamp in milliseconds
         * @param {int|undefined} limit the number of entries to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingHistory() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        if (since === undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchFundingHistory', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1BalanceFundingRateList (this.extend (request, params));
        } else {
            response = await this.privateLinearGetFutureUserV1BalanceFundingRateList (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const items = this.safeValue (data, 'items', []);
        const result = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            result.push (this.parseFundingHistory (entry, market));
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit);
    }

    parseFundingHistory (contract, market = undefined) {
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
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_', 'swap');
        const currencyId = this.safeString (contract, 'coin');
        const code = this.safeCurrencyCode (currencyId);
        const timestamp = this.safeInteger (contract, 'createdTime');
        return {
            'info': contract,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': this.safeString (contract, 'id'),
            'amount': this.safeNumber (contract, 'cast'),
        };
    }

    async fetchPosition (symbol, params = {}) {
        /**
         * @method
         * @name xt#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://doc.xt.com/#futures_usergetPosition
         * @param {string} symbol unified market symbol of the market the position is held in
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchPosition', market, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1PositionList (this.extend (request, params));
        } else {
            response = await this.privateLinearGetFutureUserV1PositionList (this.extend (request, params));
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
        const positions = this.safeValue (response, 'result', []);
        for (let i = 0; i < positions.length; i++) {
            const entry = positions[i];
            const marketId = this.safeString (entry, 'symbol');
            const market = this.safeMarket (marketId, undefined, undefined, 'contract');
            const positionSize = this.safeString (entry, 'positionSize');
            if (positionSize !== '0') {
                return this.parsePosition (entry, market);
            }
        }
    }

    async fetchPositions (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchPositions
         * @description fetch all open positions
         * @see https://doc.xt.com/#futures_usergetPosition
         * @param {[string]|undefined} symbols list of unified market symbols, not supported with xt
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        if (symbols !== undefined) {
            throw new BadRequest (this.id + ' fetchPositions() only supports the symbols argument as undefined');
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchPositions', undefined, params);
        let response = undefined;
        if (subType === 'inverse') {
            response = await this.privateInverseGetFutureUserV1PositionList (params);
        } else {
            response = await this.privateLinearGetFutureUserV1PositionList (params);
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
        const positions = this.safeValue (response, 'result', []);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const entry = positions[i];
            const marketId = this.safeString (entry, 'symbol');
            const market = this.safeMarket (marketId, undefined, undefined, 'contract');
            result.push (this.parsePosition (entry, market));
        }
        return this.filterByArray (result, 'symbol', undefined, false);
    }

    parsePosition (position, market = undefined) {
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
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'contract');
        const symbol = this.safeSymbol (marketId, market, undefined, 'contract');
        const positionType = this.safeString (position, 'positionType');
        const marginMode = (positionType === 'CROSSED') ? 'cross' : 'isolated';
        const collateral = this.safeNumber (position, 'isolatedMargin');
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'hedged': undefined,
            'side': this.safeStringLower (position, 'positionSide'),
            'contracts': this.safeNumber (position, 'positionSize'),
            'contractSize': market['contractSize'],
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'markPrice': undefined,
            'notional': undefined,
            'leverage': this.safeInteger (position, 'leverage'),
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
        };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
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
        const status = this.safeStringUpper2 (response, 'msgInfo', 'mc');
        if (status !== 'SUCCESS') {
            const feedback = this.id + ' ' + body;
            const error = this.safeValue (response, 'error', {});
            const spotErrorCode = this.safeString (response, 'mc');
            const errorCode = this.safeString (error, 'code', spotErrorCode);
            const spotMessage = this.safeString (response, 'msgInfo');
            const message = this.safeString (error, 'msg', spotMessage);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }

    sign (path, api: any = [], method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const signed = api[0] === 'private';
        const endpoint = api[1];
        const request = '/' + this.implodeParams (path, params);
        let payload = undefined;
        if (endpoint === 'spot') {
            if (signed) {
                payload = '/' + this.version + request;
            } else {
                payload = '/' + this.version + '/public' + request;
            }
        } else {
            payload = request;
        }
        let url = this.urls['api'][endpoint] + payload;
        const query = this.omit (params, this.extractParams (path));
        const urlencoded = this.urlencode (this.keysort (query));
        headers = {
            'Content-Type': 'application/json',
        };
        if (signed) {
            this.checkRequiredCredentials ();
            const defaultRecvWindow = this.safeString (this.options, 'recvWindow');
            const recvWindow = this.safeString (params, 'recvWindow', defaultRecvWindow);
            const timestamp = this.numberToString (this.nonce ());
            body = params;
            if ((payload === '/v4/order') || (payload === '/future/trade/v1/order/create')) {
                body['clientMedia'] = 'CCXT';
            }
            const isUndefinedBody = ((method === 'GET') || (path === 'order/{orderId}'));
            body = isUndefinedBody ? undefined : this.json (body);
            let payloadString = undefined;
            if (endpoint === 'spot') {
                payloadString = 'xt-validate-algorithms=HmacSHA256&xt-validate-appkey=' + this.apiKey + '&xt-validate-recvwindow=' + recvWindow + '&xt-validate-timestamp=' + timestamp;
                if (isUndefinedBody) {
                    if (urlencoded) {
                        url += '?' + urlencoded;
                        payloadString += '#' + method + '#' + payload + '#' + urlencoded;
                    } else {
                        payloadString += '#' + method + '#' + payload;
                    }
                } else {
                    payloadString += '#' + method + '#' + payload + '#' + body;
                }
                headers['xt-validate-algorithms'] = 'HmacSHA256';
                headers['xt-validate-recvwindow'] = recvWindow;
            } else {
                payloadString = 'xt-validate-appkey=' + this.apiKey + '&xt-validate-timestamp=' + timestamp;
                if (method === 'GET') {
                    if (urlencoded) {
                        url += '?' + urlencoded;
                        payloadString += '#' + payload + '#' + urlencoded;
                    } else {
                        payloadString += '#' + payload;
                    }
                } else {
                    payloadString += '#' + payload + '#' + body;
                }
            }
            const signature = this.hmac (this.encode (payloadString), this.encode (this.secret), sha256);
            headers['xt-validate-appkey'] = this.apiKey;
            headers['xt-validate-timestamp'] = timestamp;
            headers['xt-validate-signature'] = signature;
        } else {
            if (urlencoded) {
                url += '?' + urlencoded;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
