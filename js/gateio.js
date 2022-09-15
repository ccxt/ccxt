'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const Precise = require ('./base/Precise');
const { TICK_SIZE } = require ('./base/functions/number');
const { ExchangeError, BadRequest, ArgumentsRequired, AuthenticationError, PermissionDenied, AccountSuspended, InvalidAddress, InsufficientFunds, RateLimitExceeded, ExchangeNotAvailable, BadSymbol, InvalidOrder, OrderNotFound, NotSupported, AccountNotEnabled, OrderImmediatelyFillable } = require ('./base/errors');
// ---------------------------------------------------------------------------

module.exports = class gateio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'name': 'Gate.io',
            'countries': [ 'KR' ],
            'rateLimit': 10 / 3, // 300 requests per second or 3.33ms
            'version': 'v4',
            'certified': true,
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'doc': 'https://www.gate.io/docs/apiv4/en/index.html',
                'www': 'https://gate.io/',
                'api': {
                    'public': {
                        'wallet': 'https://api.gateio.ws/api/v4',
                        'futures': 'https://api.gateio.ws/api/v4',
                        'margin': 'https://api.gateio.ws/api/v4',
                        'delivery': 'https://api.gateio.ws/api/v4',
                        'spot': 'https://api.gateio.ws/api/v4',
                        'options': 'https://api.gateio.ws/api/v4',
                    },
                    'private': {
                        'withdrawals': 'https://api.gateio.ws/api/v4',
                        'wallet': 'https://api.gateio.ws/api/v4',
                        'futures': 'https://api.gateio.ws/api/v4',
                        'margin': 'https://api.gateio.ws/api/v4',
                        'delivery': 'https://api.gateio.ws/api/v4',
                        'spot': 'https://api.gateio.ws/api/v4',
                        'options': 'https://api.gateio.ws/api/v4',
                    },
                },
                'test': {
                    'public': {
                        'futures': 'https://fx-api-testnet.gateio.ws/api/v4',
                        'delivery': 'https://fx-api-testnet.gateio.ws/api/v4',
                    },
                    'private': {
                        'futures': 'https://fx-api-testnet.gateio.ws/api/v4',
                        'delivery': 'https://fx-api-testnet.gateio.ws/api/v4',
                    },
                },
                'referral': {
                    'url': 'https://www.gate.io/ref/2436035',
                    'discount': 0.2,
                },
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': undefined,
                'borrowMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchNetworkDepositAddress': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactionFees': true,
                'fetchWithdrawals': true,
                'repayMargin': true,
                'setLeverage': true,
                'setMarginMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'api': {
                'public': {
                    'wallet': {
                        'get': {
                            'wallet/currency_chains': 1.5,
                        },
                    },
                    'spot': {
                        'get': {
                            'currencies': 1,
                            'currencies/{currency}': 1,
                            'currency_pairs': 1,
                            'currency_pairs/{currency_pair}': 1,
                            'tickers': 1,
                            'order_book': 1,
                            'trades': 1,
                            'candlesticks': 1,
                        },
                    },
                    'margin': {
                        'get': {
                            'currency_pairs': 1,
                            'currency_pairs/{currency_pair}': 1,
                            'cross/currencies': 1,
                            'cross/currencies/{currency}': 1,
                            'funding_book': 1,
                        },
                    },
                    'futures': {
                        'get': {
                            '{settle}/contracts': 1.5,
                            '{settle}/contracts/{contract}': 1.5,
                            '{settle}/order_book': 1.5,
                            '{settle}/trades': 1.5,
                            '{settle}/candlesticks': 1.5,
                            '{settle}/tickers': 1.5,
                            '{settle}/funding_rate': 1.5,
                            '{settle}/insurance': 1.5,
                            '{settle}/contract_stats': 1.5,
                            '{settle}/liq_orders': 1.5,
                        },
                    },
                    'delivery': {
                        'get': {
                            '{settle}/contracts': 1.5,
                            '{settle}/contracts/{contract}': 1.5,
                            '{settle}/order_book': 1.5,
                            '{settle}/trades': 1.5,
                            '{settle}/candlesticks': 1.5,
                            '{settle}/tickers': 1.5,
                            '{settle}/insurance': 1.5,
                        },
                    },
                    'options': {
                        'get': {
                            'underlyings': 1.5,
                            'expirations': 1.5,
                            'contracts': 1.5,
                            'contracts/{contract}': 1.5,
                            'settlements': 1.5,
                            'settlements/{contract}': 1.5,
                            'order_book': 1.5,
                            'tickers': 1.5,
                            'underlying/tickers/{underlying}': 1.5,
                            'candlesticks': 1.5,
                            'underlying/candlesticks': 1.5,
                            'trades': 1.5,
                        },
                    },
                },
                'private': {
                    'withdrawals': {
                        'post': {
                            '': 3000, // 3000 = 10 seconds
                        },
                        'delete': {
                            '{withdrawal_id}': 300,
                        },
                    },
                    'wallet': {
                        'get': {
                            'deposit_address': 300,
                            'withdrawals': 300,
                            'deposits': 300,
                            'sub_account_transfers': 300,
                            'withdraw_status': 300,
                            'sub_account_balances': 300,
                            'fee': 300,
                            'total_balance': 300,
                        },
                        'post': {
                            'transfers': 300,
                            'sub_account_transfers': 300,
                        },
                    },
                    'spot': {
                        'get': {
                            'accounts': 1,
                            'open_orders': 1,
                            'orders': 1,
                            'orders/{order_id}': 1,
                            'my_trades': 1,
                            'price_orders': 1,
                            'price_orders/{order_id}': 1,
                        },
                        'post': {
                            'batch_orders': 1,
                            'orders': 1,
                            'cancel_batch_orders': 1,
                            'price_orders': 1,
                        },
                        'delete': {
                            'orders': 1,
                            'orders/{order_id}': 1,
                            'price_orders': 1,
                            'price_orders/{order_id}': 1,
                        },
                    },
                    'margin': {
                        'get': {
                            'accounts': 1.5,
                            'account_book': 1.5,
                            'funding_accounts': 1.5,
                            'loans': 1.5,
                            'loans/{loan_id}': 1.5,
                            'loans/{loan_id}/repayment': 1.5,
                            'loan_records': 1.5,
                            'loan_records/{load_record_id}': 1.5,
                            'auto_repay': 1.5,
                            'transferable': 1.5,
                            'cross/accounts': 1.5,
                            'cross/account_book': 1.5,
                            'cross/loans': 1.5,
                            'cross/loans/{loan_id}': 1.5,
                            'cross/loans/repayments': 1.5,
                            'cross/transferable': 1.5,
                            'loan_records/{loan_record_id}': 1.5,
                            'borrowable': 1.5,
                            'cross/repayments': 1.5,
                            'cross/borrowable': 1.5,
                        },
                        'post': {
                            'loans': 1.5,
                            'merged_loans': 1.5,
                            'loans/{loan_id}/repayment': 1.5,
                            'auto_repay': 1.5,
                            'cross/loans': 1.5,
                            'cross/loans/repayments': 1.5,
                            'cross/repayments': 1.5,
                        },
                        'patch': {
                            'loans/{loan_id}': 1.5,
                            'loan_records/{loan_record_id}': 1.5,
                        },
                        'delete': {
                            'loans/{loan_id}': 1.5,
                        },
                    },
                    'futures': {
                        'get': {
                            '{settle}/accounts': 1.5,
                            '{settle}/account_book': 1.5,
                            '{settle}/positions': 1.5,
                            '{settle}/positions/{contract}': 1.5,
                            '{settle}/orders': 1.5,
                            '{settle}/orders/{order_id}': 1.5,
                            '{settle}/my_trades': 1.5,
                            '{settle}/position_close': 1.5,
                            '{settle}/liquidates': 1.5,
                            '{settle}/price_orders': 1.5,
                            '{settle}/price_orders/{order_id}': 1.5,
                            '{settle}/dual_comp/positions/{contract}': 1.5,
                        },
                        'post': {
                            '{settle}/positions/{contract}/margin': 1.5,
                            '{settle}/positions/{contract}/leverage': 1.5,
                            '{settle}/positions/{contract}/risk_limit': 1.5,
                            '{settle}/dual_mode': 1.5,
                            '{settle}/dual_comp/positions/{contract}': 1.5,
                            '{settle}/dual_comp/positions/{contract}/margin': 1.5,
                            '{settle}/dual_comp/positions/{contract}/leverage': 1.5,
                            '{settle}/dual_comp/positions/{contract}/risk_limit': 1.5,
                            '{settle}/orders': 1.5,
                            '{settle}/price_orders': 1.5,
                        },
                        'delete': {
                            '{settle}/orders': 1.5,
                            '{settle}/orders/{order_id}': 1.5,
                            '{settle}/price_orders': 1.5,
                            '{settle}/price_orders/{order_id}': 1.5,
                        },
                    },
                    'delivery': {
                        'get': {
                            '{settle}/accounts': 1.5,
                            '{settle}/account_book': 1.5,
                            '{settle}/positions': 1.5,
                            '{settle}/positions/{contract}': 1.5,
                            '{settle}/orders': 1.5,
                            '{settle}/orders/{order_id}': 1.5,
                            '{settle}/my_trades': 1.5,
                            '{settle}/position_close': 1.5,
                            '{settle}/liquidates': 1.5,
                            '{settle}/price_orders': 1.5,
                            '{settle}/price_orders/{order_id}': 1.5,
                            '{settle}/settlements': 1.5,
                        },
                        'post': {
                            '{settle}/positions/{contract}/margin': 1.5,
                            '{settle}/positions/{contract}/leverage': 1.5,
                            '{settle}/positions/{contract}/risk_limit': 1.5,
                            '{settle}/orders': 1.5,
                            '{settle}/price_orders': 1.5,
                        },
                        'delete': {
                            '{settle}/orders': 1.5,
                            '{settle}/orders/{order_id}': 1.5,
                            '{settle}/price_orders': 1.5,
                            '{settle}/price_orders/{order_id}': 1.5,
                        },
                    },
                    'options': {
                        'get': {
                            'accounts': 1.5,
                            'account_book': 1.5,
                            'positions': 1.5,
                            'positions/{contract}': 1.5,
                            'position_close': 1.5,
                            'orders': 1.5,
                            'orders/{order_id}': 1.5,
                            'my_trades': 1.5,
                        },
                        'post': {
                            'orders': 1.5,
                        },
                        'delete': {
                            'orders': 1.5,
                            'orders/{order_id}': 1.5,
                        },
                    },
                },
            },
            'timeframes': {
                '10s': '10s',
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '8h': '8h',
                '1d': '1d',
                '7d': '7d',
                '1w': '7d',
            },
            // copied from gatev2
            'commonCurrencies': {
                '88MPH': 'MPH',
                'AXIS': 'Axis DeFi',
                'BIFI': 'Bitcoin File',
                'BOX': 'DefiBox',
                'BTCBEAR': 'BEAR',
                'BTCBULL': 'BULL',
                'BYN': 'BeyondFi',
                'EGG': 'Goose Finance',
                'GTC': 'Game.com', // conflict with Gitcoin and Gastrocoin
                'GTC_HT': 'Game.com HT',
                'GTC_BSC': 'Game.com BSC',
                'HIT': 'HitChain',
                'MM': 'Million', // conflict with MilliMeter
                'MPH': 'Morpher', // conflict with 88MPH
                'RAI': 'Rai Reflex Index', // conflict with RAI Finance
                'SBTC': 'Super Bitcoin',
                'TNC': 'Trinity Network Credit',
                'TON': 'TONToken',
                'VAI': 'VAIOT',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'headers': {
                'X-Gate-Channel-Id': 'ccxt',
            },
            'options': {
                'createOrder': {
                    'expiration': 86400, // for conditional orders
                },
                'networks': {
                    'TRC20': 'TRX',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                },
                'timeInForce': {
                    'GTC': 'gtc',
                    'IOC': 'ioc',
                    'PO': 'poc',
                    'POC': 'poc',
                },
                'accountsByType': {
                    'funding': 'spot',
                    'spot': 'spot',
                    'margin': 'margin',
                    'cross_margin': 'cross_margin',
                    'cross': 'cross_margin',
                    'isolated': 'margin',
                    'swap': 'futures',
                    'future': 'delivery',
                    'futures': 'futures',
                    'delivery': 'delivery',
                },
                'defaultType': 'spot',
                'swap': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt', 'btc' ],
                    },
                },
                'future': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt', 'btc' ],
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': true,
                    'feeSide': 'get',
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        // volume is in BTC
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('1.5'), this.parseNumber ('0.00185') ],
                            [ this.parseNumber ('3'), this.parseNumber ('0.00175') ],
                            [ this.parseNumber ('6'), this.parseNumber ('0.00165') ],
                            [ this.parseNumber ('12.5'), this.parseNumber ('0.00155') ],
                            [ this.parseNumber ('25'), this.parseNumber ('0.00145') ],
                            [ this.parseNumber ('75'), this.parseNumber ('0.00135') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.00125') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.00115') ],
                            [ this.parseNumber ('1250'), this.parseNumber ('0.00105') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.00095') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('0.00085') ],
                            [ this.parseNumber ('6000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('11000'), this.parseNumber ('0.00065') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.00055') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('0.00055') ],
                            [ this.parseNumber ('75000'), this.parseNumber ('0.00055') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('1.5'), this.parseNumber ('0.00195') ],
                            [ this.parseNumber ('3'), this.parseNumber ('0.00185') ],
                            [ this.parseNumber ('6'), this.parseNumber ('0.00175') ],
                            [ this.parseNumber ('12.5'), this.parseNumber ('0.00165') ],
                            [ this.parseNumber ('25'), this.parseNumber ('0.00155') ],
                            [ this.parseNumber ('75'), this.parseNumber ('0.00145') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.00135') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.00125') ],
                            [ this.parseNumber ('1250'), this.parseNumber ('0.00115') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.00105') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('0.00095') ],
                            [ this.parseNumber ('6000'), this.parseNumber ('0.00085') ],
                            [ this.parseNumber ('11000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.00065') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('0.00065') ],
                            [ this.parseNumber ('75000'), this.parseNumber ('0.00065') ],
                        ],
                    },
                },
                'swap': {
                    'tierBased': true,
                    'feeSide': 'base',
                    'percentage': true,
                    'maker': this.parseNumber ('0.0'),
                    'taker': this.parseNumber ('0.0005'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0000') ],
                            [ this.parseNumber ('1.5'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('3'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('6'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('12.5'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('25'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('75'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('200'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('500'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('1250'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('-0.00008') ],
                            [ this.parseNumber ('6000'), this.parseNumber ('-0.01000') ],
                            [ this.parseNumber ('11000'), this.parseNumber ('-0.01002') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('-0.01005') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('-0.02000') ],
                            [ this.parseNumber ('75000'), this.parseNumber ('-0.02005') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.00050') ],
                            [ this.parseNumber ('1.5'), this.parseNumber ('0.00048') ],
                            [ this.parseNumber ('3'), this.parseNumber ('0.00046') ],
                            [ this.parseNumber ('6'), this.parseNumber ('0.00044') ],
                            [ this.parseNumber ('12.5'), this.parseNumber ('0.00042') ],
                            [ this.parseNumber ('25'), this.parseNumber ('0.00040') ],
                            [ this.parseNumber ('75'), this.parseNumber ('0.00038') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.00036') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.00034') ],
                            [ this.parseNumber ('1250'), this.parseNumber ('0.00032') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('6000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('11000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('75000'), this.parseNumber ('0.00030') ],
                        ],
                    },
                },
            },
            // https://www.gate.io/docs/apiv4/en/index.html#label-list
            'exceptions': {
                'exact': {
                    'INVALID_PARAM_VALUE': BadRequest,
                    'INVALID_PROTOCOL': BadRequest,
                    'INVALID_ARGUMENT': BadRequest,
                    'INVALID_REQUEST_BODY': BadRequest,
                    'MISSING_REQUIRED_PARAM': ArgumentsRequired,
                    'BAD_REQUEST': BadRequest,
                    'INVALID_CONTENT_TYPE': BadRequest,
                    'NOT_ACCEPTABLE': BadRequest,
                    'METHOD_NOT_ALLOWED': BadRequest,
                    'NOT_FOUND': ExchangeError,
                    'INVALID_CREDENTIALS': AuthenticationError,
                    'INVALID_KEY': AuthenticationError,
                    'IP_FORBIDDEN': AuthenticationError,
                    'READ_ONLY': PermissionDenied,
                    'INVALID_SIGNATURE': AuthenticationError,
                    'MISSING_REQUIRED_HEADER': AuthenticationError,
                    'REQUEST_EXPIRED': AuthenticationError,
                    'ACCOUNT_LOCKED': AccountSuspended,
                    'FORBIDDEN': PermissionDenied,
                    'SUB_ACCOUNT_NOT_FOUND': ExchangeError,
                    'SUB_ACCOUNT_LOCKED': AccountSuspended,
                    'MARGIN_BALANCE_EXCEPTION': ExchangeError,
                    'MARGIN_TRANSFER_FAILED': ExchangeError,
                    'TOO_MUCH_FUTURES_AVAILABLE': ExchangeError,
                    'FUTURES_BALANCE_NOT_ENOUGH': InsufficientFunds,
                    'ACCOUNT_EXCEPTION': ExchangeError,
                    'SUB_ACCOUNT_TRANSFER_FAILED': ExchangeError,
                    'ADDRESS_NOT_USED': ExchangeError,
                    'TOO_FAST': RateLimitExceeded,
                    'WITHDRAWAL_OVER_LIMIT': ExchangeError,
                    'API_WITHDRAW_DISABLED': ExchangeNotAvailable,
                    'INVALID_WITHDRAW_ID': ExchangeError,
                    'INVALID_WITHDRAW_CANCEL_STATUS': ExchangeError,
                    'INVALID_PRECISION': InvalidOrder,
                    'INVALID_CURRENCY': BadSymbol,
                    'INVALID_CURRENCY_PAIR': BadSymbol,
                    'POC_FILL_IMMEDIATELY': OrderImmediatelyFillable, // {"label":"POC_FILL_IMMEDIATELY","message":"Order would match and take immediately so its cancelled"}
                    'ORDER_NOT_FOUND': OrderNotFound,
                    'CLIENT_ID_NOT_FOUND': OrderNotFound,
                    'ORDER_CLOSED': InvalidOrder,
                    'ORDER_CANCELLED': InvalidOrder,
                    'QUANTITY_NOT_ENOUGH': InvalidOrder,
                    'BALANCE_NOT_ENOUGH': InsufficientFunds,
                    'MARGIN_NOT_SUPPORTED': InvalidOrder,
                    'MARGIN_BALANCE_NOT_ENOUGH': InsufficientFunds,
                    'AMOUNT_TOO_LITTLE': InvalidOrder,
                    'AMOUNT_TOO_MUCH': InvalidOrder,
                    'REPEATED_CREATION': InvalidOrder,
                    'LOAN_NOT_FOUND': OrderNotFound,
                    'LOAN_RECORD_NOT_FOUND': OrderNotFound,
                    'NO_MATCHED_LOAN': ExchangeError,
                    'NOT_MERGEABLE': ExchangeError,
                    'NO_CHANGE': ExchangeError,
                    'REPAY_TOO_MUCH': ExchangeError,
                    'TOO_MANY_CURRENCY_PAIRS': InvalidOrder,
                    'TOO_MANY_ORDERS': InvalidOrder,
                    'MIXED_ACCOUNT_TYPE': InvalidOrder,
                    'AUTO_BORROW_TOO_MUCH': ExchangeError,
                    'TRADE_RESTRICTED': InsufficientFunds,
                    'USER_NOT_FOUND': AccountNotEnabled,
                    'CONTRACT_NO_COUNTER': ExchangeError,
                    'CONTRACT_NOT_FOUND': BadSymbol,
                    'RISK_LIMIT_EXCEEDED': ExchangeError,
                    'INSUFFICIENT_AVAILABLE': InsufficientFunds,
                    'LIQUIDATE_IMMEDIATELY': InvalidOrder,
                    'LEVERAGE_TOO_HIGH': InvalidOrder,
                    'LEVERAGE_TOO_LOW': InvalidOrder,
                    'ORDER_NOT_OWNED': ExchangeError,
                    'ORDER_FINISHED': ExchangeError,
                    'POSITION_CROSS_MARGIN': ExchangeError,
                    'POSITION_IN_LIQUIDATION': ExchangeError,
                    'POSITION_IN_CLOSE': ExchangeError,
                    'POSITION_EMPTY': InvalidOrder,
                    'REMOVE_TOO_MUCH': ExchangeError,
                    'RISK_LIMIT_NOT_MULTIPLE': ExchangeError,
                    'RISK_LIMIT_TOO_HIGH': ExchangeError,
                    'RISK_LIMIT_TOO_lOW': ExchangeError,
                    'PRICE_TOO_DEVIATED': InvalidOrder,
                    'SIZE_TOO_LARGE': InvalidOrder,
                    'SIZE_TOO_SMALL': InvalidOrder,
                    'PRICE_OVER_LIQUIDATION': InvalidOrder,
                    'PRICE_OVER_BANKRUPT': InvalidOrder,
                    'ORDER_POC_IMMEDIATE': OrderImmediatelyFillable, // {"label":"ORDER_POC_IMMEDIATE","detail":"order price 1700 while counter price 1793.55"}
                    'INCREASE_POSITION': InvalidOrder,
                    'CONTRACT_IN_DELISTING': ExchangeError,
                    'INTERNAL': ExchangeNotAvailable,
                    'SERVER_ERROR': ExchangeNotAvailable,
                    'TOO_BUSY': ExchangeNotAvailable,
                    'CROSS_ACCOUNT_NOT_FOUND': ExchangeError,
                    'RISK_LIMIT_TOO_LOW': BadRequest, // {"label":"RISK_LIMIT_TOO_LOW","detail":"limit 1000000"}
                },
            },
            'broad': {},
        });
    }

    async fetchSpotMarkets (params) {
        const marginResponse = await this.publicMarginGetCurrencyPairs (params);
        const spotMarketsResponse = await this.publicSpotGetCurrencyPairs (params);
        const marginMarkets = this.indexBy (marginResponse, 'id');
        //
        //  Spot
        //
        //     [
        //         {
        //             "id": "QTUM_ETH",
        //             "base": "QTUM",
        //             "quote": "ETH",
        //             "fee": "0.2",
        //             "min_base_amount": "0.01",
        //             "min_quote_amount": "0.001",
        //             "amount_precision": 3,
        //             "precision": 6,
        //             "trade_status": "tradable",
        //             "sell_start": 0,
        //             "buy_start": 0
        //         }
        //     ]
        //
        //  Margin
        //
        //     [
        //         {
        //             "id": "ETH_USDT",
        //             "base": "ETH",
        //             "quote": "USDT",
        //             "leverage": 3,
        //             "min_base_amount": "0.01",
        //             "min_quote_amount": "100",
        //             "max_quote_amount": "1000000"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < spotMarketsResponse.length; i++) {
            const spotMarket = spotMarketsResponse[i];
            const id = this.safeString (spotMarket, 'id');
            const marginMarket = this.safeValue (marginMarkets, id);
            const market = this.deepExtend (marginMarket, spotMarket);
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const takerPercent = this.safeString (market, 'fee');
            const makerPercent = this.safeString (market, 'maker_fee_rate', takerPercent);
            const amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'amount_precision')));
            const tradeStatus = this.safeString (market, 'trade_status');
            const leverage = this.safeNumber (market, 'leverage');
            const margin = leverage !== undefined;
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': margin,
                'swap': false,
                'future': false,
                'option': false,
                'active': (tradeStatus === 'tradable'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                // Fee is in %, so divide by 100
                'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')),
                'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountPrecision,
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (market, 'leverage', 1),
                    },
                    'amount': {
                        'min': this.safeNumber (spotMarket, 'min_base_amount', amountPrecision),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_quote_amount'),
                        'max': margin ? this.safeNumber (market, 'max_quote_amount') : undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        let result = [];
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchMarkets', undefined, params);
        if (type === 'spot' || type === 'margin') {
            result = await this.fetchSpotMarkets (query);
        }
        if (type === 'swap' || type === 'future') {
            result = await this.fetchContractMarkets (query); // futures and swaps
        }
        if (type === 'option') {
            result = await this.fetchOptionMarkets (query);
        }
        const resultLength = result.length;
        if (resultLength === 0) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to " + "'spot', 'margin', 'swap', 'future' or 'option'"); // eslint-disable-line quotes
        }
        return result;
    }

    prepareRequest (market = undefined, type = undefined, params = {}) {
        // * Do not call for multi spot order methods like cancelAllOrders and fetchOpenOrders. Use multiOrderSpotPrepareRequest instead
        const request = {};
        if (market !== undefined) {
            if (market['contract']) {
                request['contract'] = market['id'];
                request['settle'] = market['settleId'];
            } else {
                request['currency_pair'] = market['id'];
            }
        } else {
            const swap = type === 'swap';
            const future = type === 'future';
            if (swap || future) {
                const defaultSettle = swap ? 'usdt' : 'btc';
                const settle = this.safeStringLower (params, 'settle', defaultSettle);
                params = this.omit (params, 'settle');
                request['settle'] = settle;
            }
        }
        return [ request, params ];
    }

    getMarginMode (stop, params) {
        const defaultMarginMode = this.safeStringLower2 (this.options, 'defaultMarginMode', 'marginMode', 'spot'); // 'margin' is isolated margin on gate's api
        let marginMode = this.safeStringLower2 (params, 'marginMode', 'account', defaultMarginMode);
        params = this.omit (params, [ 'marginMode', 'account' ]);
        if (marginMode === 'cross') {
            marginMode = 'cross_margin';
        } else if (marginMode === 'isolated') {
            marginMode = 'margin';
        } else if (marginMode === '') {
            marginMode = 'spot';
        }
        if (stop) {
            if (marginMode === 'spot') {
                // gate spot stop orders use the term normal instead of spot
                marginMode = 'normal';
            }
            if (marginMode === 'cross_margin') {
                throw new BadRequest (this.id + ' getMarginMode() does not support stop orders for cross margin');
            }
        }
        return [ marginMode, params ];
    }

    fetchBalanceHelper (entry) {
        const account = this.account ();
        account['used'] = this.safeString2 (entry, 'freeze', 'locked');
        account['free'] = this.safeString (entry, 'available');
        account['total'] = this.safeString (entry, 'total');
        return account;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        params = this.omit (params, 'symbol');
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const [ request, requestParams ] = this.prepareRequest (undefined, type, query);
        const [ marginMode, requestQuery ] = this.getMarginMode (false, requestParams);
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['currency_pair'] = market['id'];
        }
        const method = this.getSupportedMapping (type, {
            'spot': this.getSupportedMapping (marginMode, {
                'spot': 'privateSpotGetAccounts',
                'margin': 'privateMarginGetAccounts',
                'cross_margin': 'privateMarginGetCrossAccounts',
            }),
            'funding': 'privateMarginGetFundingAccounts',
            'swap': 'privateFuturesGetSettleAccounts',
            'future': 'privateDeliveryGetSettleAccounts',
        });
        let response = await this[method] (this.extend (request, requestQuery));
        const contract = (type === 'swap' || type === 'future');
        if (contract) {
            response = [ response ];
        }
        //
        // Spot / margin funding
        //
        //     [
        //         {
        //             "currency": "DBC",
        //             "available": "0",
        //             "locked": "0"
        //             "lent": "0", // margin funding only
        //             "total_lent": "0" // margin funding only
        //         },
        //         ...
        //     ]
        //
        //  Margin
        //
        //    [
        //        {
        //            "currency_pair": "DOGE_USDT",
        //            "locked": false,
        //            "risk": "9999.99",
        //            "base": {
        //                "currency": "DOGE",
        //                "available": "0",
        //                "locked": "0",
        //                "borrowed": "0",
        //                "interest": "0"
        //            },
        //            "quote": {
        //                "currency": "USDT",
        //                "available": "0.73402",
        //                "locked": "0",
        //                "borrowed": "0",
        //                "interest": "0"
        //            }
        //        },
        //        ...
        //    ]
        //
        // Cross margin
        //
        //    {
        //        "user_id": 10406147,
        //        "locked": false,
        //        "balances": {
        //            "USDT": {
        //                "available": "1",
        //                "freeze": "0",
        //                "borrowed": "0",
        //                "interest": "0"
        //            }
        //        },
        //        "total": "1",
        //        "borrowed": "0",
        //        "interest": "0",
        //        "risk": "9999.99"
        //    }
        //
        //  Perpetual Swap
        //
        //    {
        //        order_margin: "0",
        //        point: "0",
        //        bonus: "0",
        //        history: {
        //            dnw: "2.1321",
        //            pnl: "11.5351",
        //            refr: "0",
        //            point_fee: "0",
        //            fund: "-0.32340576684",
        //            bonus_dnw: "0",
        //            point_refr: "0",
        //            bonus_offset: "0",
        //            fee: "-0.20132775",
        //            point_dnw: "0",
        //        },
        //        unrealised_pnl: "13.315100000006",
        //        total: "12.51345151332",
        //        available: "0",
        //        in_dual_mode: false,
        //        currency: "USDT",
        //        position_margin: "12.51345151332",
        //        user: "6333333",
        //    }
        //
        // Delivery Future
        //
        //    {
        //        order_margin: "0",
        //        point: "0",
        //        history: {
        //            dnw: "1",
        //            pnl: "0",
        //            refr: "0",
        //            point_fee: "0",
        //            point_dnw: "0",
        //            settle: "0",
        //            settle_fee: "0",
        //            point_refr: "0",
        //            fee: "0",
        //        },
        //        unrealised_pnl: "0",
        //        total: "1",
        //        available: "1",
        //        currency: "USDT",
        //        position_margin: "0",
        //        user: "6333333",
        //    }
        //
        const result = {
            'info': response,
        };
        const crossMargin = marginMode === 'cross_margin';
        const margin = marginMode === 'margin';
        let data = response;
        if ('balances' in data) { // True for cross_margin
            const flatBalances = [];
            const balances = this.safeValue (data, 'balances', []);
            // inject currency and create an artificial balance object
            // so it can follow the existent flow
            const keys = Object.keys (balances);
            for (let i = 0; i < keys.length; i++) {
                const currencyId = keys[i];
                const content = balances[currencyId];
                content['currency'] = currencyId;
                flatBalances.push (content);
            }
            data = flatBalances;
        }
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            if (margin && !crossMargin) {
                const marketId = this.safeString (entry, 'currency_pair');
                const symbol = this.safeSymbol (marketId, undefined, '_');
                const base = this.safeValue (entry, 'base', {});
                const quote = this.safeValue (entry, 'quote', {});
                const baseCode = this.safeCurrencyCode (this.safeString (base, 'currency'));
                const quoteCode = this.safeCurrencyCode (this.safeString (quote, 'currency'));
                const subResult = {};
                subResult[baseCode] = this.fetchBalanceHelper (base);
                subResult[quoteCode] = this.fetchBalanceHelper (quote);
                result[symbol] = this.safeBalance (subResult);
            } else {
                const code = this.safeCurrencyCode (this.safeString (entry, 'currency'));
                result[code] = this.fetchBalanceHelper (entry);
            }
        }
        return (margin && !crossMargin) ? result : this.safeBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        const response = await this.publicGetOrderBookId (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // they return [ Timestamp, Volume, Close, High, Low, Open ]
        return [
            parseInt (ohlcv[0]),   // t
            parseFloat (ohlcv[5]), // o
            parseFloat (ohlcv[3]), // h
            parseFloat (ohlcv[4]), // l
            parseFloat (ohlcv[2]), // c
            parseFloat (ohlcv[1]), // v
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
            'group_sec': this.timeframes[timeframe],
        };
        // max limit = 1001
        if (limit !== undefined) {
            const periodDurationInSeconds = this.parseTimeframe (timeframe);
            const hours = parseInt ((periodDurationInSeconds * limit) / 3600);
            request['range_hour'] = Math.max (0, hours - 1);
        }
        const response = await this.publicGetCandlestick2Id (this.extend (request, params));
        //
        //     {
        //         "elapsed": "15ms",
        //         "result": "true",
        //         "data": [
        //             [ "1553930820000", "1.005299", "4081.05", "4086.18", "4081.05", "4086.18" ],
        //             [ "1553930880000", "0.110923277", "4095.2", "4095.23", "4091.15", "4091.15" ],
        //             ...
        //             [ "1553934420000", "0", "4089.42", "4089.42", "4089.42", "4089.42" ],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const percentage = this.safeFloat (ticker, 'percentChange');
        let open = undefined;
        let change = undefined;
        let average = undefined;
        if ((last !== undefined) && (percentage !== undefined)) {
            const relativeChange = percentage / 100;
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        open = this.safeFloat (ticker, 'open', open);
        change = this.safeFloat (ticker, 'change', change);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat2 (ticker, 'high24hr', 'high'),
            'low': this.safeFloat2 (ticker, 'low24hr', 'low'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'quoteVolume'), // gateio has them reversed
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            let market = undefined;
            if (symbol in this.markets) {
                market = this.markets[symbol];
            }
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
            }
            result[symbol] = this.parseTicker (response[id], market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ticker = await this.publicGetTickerId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.safeTimestamp2 (trade, 'timestamp', 'time_unix');
        timestamp = this.safeTimestamp (trade, 'time', timestamp);
        const id = this.safeString2 (trade, 'tradeID', 'id');
        // take either of orderid or orderId
        const orderId = this.safeString2 (trade, 'orderid', 'orderNumber');
        const price = this.safeFloat2 (trade, 'rate', 'price');
        const amount = this.safeFloat (trade, 'amount');
        const type = this.safeString (trade, 'type');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': type,
            'takerOrMaker': undefined,
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
            'id': market['id'],
        };
        const method = this.safeString (this.options, 'fetchTradesMethod', 'public_get_tradehistory_id');
        const response = await this[method] (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.privatePostOpenOrders (params);
        return this.parseOrders (response['orders'], undefined, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
            'currencyPair': this.marketId (symbol),
        };
        const response = await this.privatePostGetOrder (this.extend (request, params));
        return this.parseOrder (response['order']);
    }

    parseOrderStatus (status) {
        const statuses = {
            'cancelled': 'canceled',
            // 'closed': 'closed', // these two statuses aren't actually needed
            // 'open': 'open', // as they are mapped one-to-one
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //    {'amount': '0.00000000',
        //     'currencyPair': 'xlm_usdt',
        //     'fee': '0.0113766632239302 USDT',
        //     'feeCurrency': 'USDT',
        //     'feePercentage': 0.18,
        //     'feeValue': '0.0113766632239302',
        //     'filledAmount': '30.14004987',
        //     'filledRate': 0.2097,
        //     'initialAmount': '30.14004987',
        //     'initialRate': '0.2097',
        //     'left': 0,
        //     'orderNumber': '998307286',
        //     'rate': '0.2097',
        //     'status': 'closed',
        //     'timestamp': 1531158583,
        //     'type': 'sell'},
        //
        const id = this.safeString2 (order, 'orderNumber', 'id');
        let symbol = undefined;
        const marketId = this.safeString (order, 'currencyPair');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp2 (order, 'timestamp', 'ctime');
        const lastTradeTimestamp = this.safeTimestamp (order, 'mtime');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let side = this.safeString (order, 'type');
        // handling for order.update messages
        if (side === '1') {
            side = 'sell';
        } else if (side === '2') {
            side = 'buy';
        }
        const price = this.safeFloat2 (order, 'initialRate', 'price');
        const average = this.safeFloat (order, 'filledRate');
        const amount = this.safeFloat2 (order, 'initialAmount', 'amount');
        const filled = this.safeFloat (order, 'filledAmount');
        // In the order status response, this field has a different name.
        const remaining = this.safeFloat2 (order, 'leftAmount', 'left');
        const feeCost = this.safeFloat (order, 'feeValue');
        const feeCurrencyId = this.safeString (order, 'feeCurrency');
        const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
        let feeRate = this.safeFloat (order, 'feePercentage');
        if (feeRate !== undefined) {
            feeRate = feeRate / 100;
        }
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': average,
            'trades': undefined,
            'fee': {
                'cost': feeCost,
                'currency': feeCurrencyCode,
                'rate': feeRate,
            },
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const method = 'privatePost' + this.capitalize (side);
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
            'rate': price,
            'amount': amount,
        };
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (this.extend ({
            'status': 'open',
            'type': side,
            'initialAmount': amount,
        }, response), market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'orderNumber': id,
            'currencyPair': this.marketId (symbol),
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async queryDepositAddress (method, code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        method = 'privatePost' + method + 'Address';
        const request = {
            'currency': currency['id'],
        };
        const response = await this[method] (this.extend (request, params));
        let address = this.safeString (response, 'addr');
        let tag = undefined;
        if ((address !== undefined) && (address.indexOf ('address') >= 0)) {
            throw new InvalidAddress (this.id + ' queryDepositAddress ' + address);
        }
        if (code === 'XRP') {
            const parts = address.split (' ');
            address = parts[0];
            tag = parts[1];
        }
        return {
            'currency': currency,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async createDepositAddress (code, params = {}) {
        return await this.queryDepositAddress ('New', code, params);
    }

    async fetchDepositAddress (code, params = {}) {
        return await this.queryDepositAddress ('Deposit', code, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privatePostOpenOrders (params);
        return this.parseOrders (response['orders'], market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
            'orderNumber': id,
        };
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires symbol param');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address, // Address must exist in you AddressBook in security settings
        };
        if (tag !== undefined) {
            request['address'] += ' ' + tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const authentication = api[0]; // public, private
        const type = api[1]; // spot, margin, future, delivery
        let query = this.omit (params, this.extractParams (path));
        path = this.implodeParams (path, params);
        const endPart = (path === '') ? '' : ('/' + path);
        const entirePath = '/' + type + endPart;
        let url = this.urls['api'][authentication][type];
        if (url === undefined) {
            throw new NotSupported (this.id + ' does not have a testnet for the ' + type + ' market type.');
        }
        url += entirePath;
        if (authentication === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            let queryString = '';
            let requiresURLEncoding = false;
            if (type === 'futures' && method === 'POST') {
                const pathParts = path.split ('/');
                const secondPart = this.safeString (pathParts, 1, '');
                requiresURLEncoding = (secondPart.indexOf ('dual') >= 0) || (secondPart.indexOf ('positions') >= 0);
            }
            if ((method === 'GET') || (method === 'DELETE') || requiresURLEncoding) {
                if (Object.keys (query).length) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
            } else {
                const urlQueryParams = this.safeValue (query, 'query', {});
                if (Object.keys (urlQueryParams).length) {
                    queryString = this.urlencode (urlQueryParams);
                    url += '?' + queryString;
                }
                query = this.omit (query, 'query');
                body = this.json (query);
            }
            const bodyPayload = (body === undefined) ? '' : body;
            const bodySignature = this.hash (this.encode (bodyPayload), 'sha512');
            const timestamp = this.seconds ();
            const timestampString = timestamp.toString ();
            const signaturePath = '/api/' + this.version + entirePath;
            const payloadArray = [ method.toUpperCase (), signaturePath, queryString, bodySignature, timestampString ];
            // eslint-disable-next-line quotes
            const payload = payloadArray.join ("\n");
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha512');
            headers = {
                'KEY': this.apiKey,
                'Timestamp': timestampString,
                'SIGN': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchTransactionsByType (type = undefined, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.privatePostDepositsWithdrawals (this.extend (request, params));
        let transactions = undefined;
        if (type === undefined) {
            const deposits = this.safeValue (response, 'deposits', []);
            const withdrawals = this.safeValue (response, 'withdraws', []);
            transactions = this.arrayConcat (deposits, withdrawals);
        } else {
            transactions = this.safeValue (response, type, []);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType (undefined, code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposits', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdraws', code, since, limit, params);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposit
        //
        //     {
        //         'id': 'd16520849',
        //         'currency': 'NEO',
        //         'address': False,
        //         'amount': '1',
        //         'txid': '01acf6b8ce4d24a....',
        //         'timestamp': '1553125968',
        //         'status': 'DONE',
        //         'type': 'deposit'
        //     }
        //
        // withdrawal
        //
        //     {
        //         'id': 'w5864259',
        //         'currency': 'ETH',
        //         'address': '0x72632f462....',
        //         'amount': '0.4947',
        //         'txid': '0x111167d120f736....',
        //         'timestamp': '1553123688',
        //         'status': 'DONE',
        //         'type': 'withdrawal'
        //     }
        //
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'txid');
        const amount = this.safeFloat (transaction, 'amount');
        let address = this.safeString (transaction, 'address');
        if (address === 'false') {
            address = undefined;
        }
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const type = this.parseTransactionType (id[0]);
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'PEND': 'pending',
            'REQUEST': 'pending',
            'DMOVE': 'pending',
            'CANCEL': 'failed',
            'DONE': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'd': 'deposit',
            'w': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //    {"label": "ORDER_NOT_FOUND", "message": "Order not found"}
        //    {"label": "INVALID_PARAM_VALUE", "message": "invalid argument: status"}
        //    {"label": "INVALID_PARAM_VALUE", "message": "invalid argument: Trigger.rule"}
        //    {"label": "INVALID_PARAM_VALUE", "message": "invalid argument: trigger.expiration invalid range"}
        //    {"label": "INVALID_ARGUMENT", "detail": "invalid size"}
        //
        const label = this.safeString (response, 'label');
        if (label !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], label, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
