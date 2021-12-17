'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const Precise = require ('./base/Precise');
const { TICK_SIZE } = require ('./base/functions/number');
const { ExchangeError, BadRequest, ArgumentsRequired, AuthenticationError, PermissionDenied, AccountSuspended, InsufficientFunds, RateLimitExceeded, ExchangeNotAvailable, BadSymbol, InvalidOrder, OrderNotFound } = require ('./base/errors');

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
                    'public': 'https://api.gateio.ws/api/v4',
                    'private': 'https://api.gateio.ws/api/v4',
                },
                'referral': {
                    'url': 'https://www.gate.io/ref/2436035',
                    'discount': 0.2,
                },
            },
            'has': {
                'margin': true,
                'swap': true,
                'future': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchNetworkDepositAddress': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrdersByStatus': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'setLeverage': true,
                'transfer': true,
                'withdraw': true,
            },
            'api': {
                'public': {
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
                        },
                        'post': {
                            'loans': 1.5,
                            'merged_loans': 1.5,
                            'loans/{loan_id}/repayment': 1.5,
                            'auto_repay': 1.5,
                            'cross/loans': 1.5,
                            'cross/loans/repayments': 1.5,
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
            },
            // copied from gateiov2
            'commonCurrencies': {
                '88MPH': 'MPH',
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
            'options': {
                'createOrder': {
                    'expiration': 86400, // for conditional orders
                },
                'networks': {
                    'TRC20': 'TRX',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                },
                'accountsByType': {
                    'spot': 'spot',
                    'margin': 'margin',
                    'futures': 'futures',
                    'delivery': 'delivery',
                },
                'defaultType': 'spot',
                'swap': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt', 'btc' ],
                    },
                },
                'futures': {
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
                    'POC_FILL_IMMEDIATELY': ExchangeError,
                    'ORDER_NOT_FOUND': OrderNotFound,
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
                    'USER_NOT_FOUND': ExchangeError,
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
                    'ORDER_POC_IMMEDIATE': InvalidOrder,
                    'INCREASE_POSITION': InvalidOrder,
                    'CONTRACT_IN_DELISTING': ExchangeError,
                    'INTERNAL': ExchangeError,
                    'SERVER_ERROR': ExchangeError,
                    'TOO_BUSY': ExchangeNotAvailable,
                },
            },
            'broad': {},
        });
    }

    async fetchMarkets (params = {}) {
        // :param params['type']: 'spot', 'margin', 'futures' or 'delivery'
        // :param params['settle']: The quote currency
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const spot = (type === 'spot');
        const margin = (type === 'margin');
        const futures = (type === 'futures');
        const swap = (type === 'swap');
        const option = (type === 'option');
        if (!spot && !margin && !futures && !swap) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to " + "'spot', 'margin', 'swap' or 'futures'"); // eslint-disable-line quotes
        }
        let response = undefined;
        const result = [];
        const method = this.getSupportedMapping (type, {
            'spot': 'publicSpotGetCurrencyPairs',
            'margin': 'publicMarginGetCurrencyPairs',
            'swap': 'publicFuturesGetSettleContracts',
            'futures': 'publicDeliveryGetSettleContracts',
        });
        if (swap || futures || option) {
            const settlementCurrencies = this.getSettlementCurrencies (type, 'fetchMarkets');
            for (let c = 0; c < settlementCurrencies.length; c++) {
                const settle = settlementCurrencies[c];
                query['settle'] = settle;
                response = await this[method] (query);
                //  Perpetual swap
                //      [
                //          {
                //              "name": "BTC_USDT",
                //              "type": "direct",
                //              "quanto_multiplier": "0.0001",
                //              "ref_discount_rate": "0",
                //              "order_price_deviate": "0.5",
                //              "maintenance_rate": "0.005",
                //              "mark_type": "index",
                //              "last_price": "38026",
                //              "mark_price": "37985.6",
                //              "index_price": "37954.92",
                //              "funding_rate_indicative": "0.000219",
                //              "mark_price_round": "0.01",
                //              "funding_offset": 0,
                //              "in_delisting": false,
                //              "risk_limit_base": "1000000",
                //              "interest_rate": "0.0003",
                //              "order_price_round": "0.1",
                //              "order_size_min": 1,
                //              "ref_rebate_rate": "0.2",
                //              "funding_interval": 28800,
                //              "risk_limit_step": "1000000",
                //              "leverage_min": "1",
                //              "leverage_max": "100",
                //              "risk_limit_max": "8000000",
                //              "maker_fee_rate": "-0.00025",
                //              "taker_fee_rate": "0.00075",
                //              "funding_rate": "0.002053",
                //              "order_size_max": 1000000,
                //              "funding_next_apply": 1610035200,
                //              "short_users": 977,
                //              "config_change_time": 1609899548,
                //              "trade_size": 28530850594,
                //              "position_size": 5223816,
                //              "long_users": 455,
                //              "funding_impact_value": "60000",
                //              "orders_limit": 50,
                //              "trade_id": 10851092,
                //              "orderbook_id": 2129638396
                //          }
                //      ]
                //
                //  Delivery Futures
                //      [
                //          {
                //            "name": "BTC_USDT_20200814",
                //            "underlying": "BTC_USDT",
                //            "cycle": "WEEKLY",
                //            "type": "direct",
                //            "quanto_multiplier": "0.0001",
                //            "mark_type": "index",
                //            "last_price": "9017",
                //            "mark_price": "9019",
                //            "index_price": "9005.3",
                //            "basis_rate": "0.185095",
                //            "basis_value": "13.7",
                //            "basis_impact_value": "100000",
                //            "settle_price": "0",
                //            "settle_price_interval": 60,
                //            "settle_price_duration": 1800,
                //            "settle_fee_rate": "0.0015",
                //            "expire_time": 1593763200,
                //            "order_price_round": "0.1",
                //            "mark_price_round": "0.1",
                //            "leverage_min": "1",
                //            "leverage_max": "100",
                //            "maintenance_rate": "1000000",
                //            "risk_limit_base": "140.726652109199",
                //            "risk_limit_step": "1000000",
                //            "risk_limit_max": "8000000",
                //            "maker_fee_rate": "-0.00025",
                //            "taker_fee_rate": "0.00075",
                //            "ref_discount_rate": "0",
                //            "ref_rebate_rate": "0.2",
                //            "order_price_deviate": "0.5",
                //            "order_size_min": 1,
                //            "order_size_max": 1000000,
                //            "orders_limit": 50,
                //            "orderbook_id": 63,
                //            "trade_id": 26,
                //            "trade_size": 435,
                //            "position_size": 130,
                //            "config_change_time": 1593158867,
                //            "in_delisting": false
                //          }
                //        ]
                //
                for (let i = 0; i < response.length; i++) {
                    const market = response[i];
                    const id = this.safeString (market, 'name');
                    const parts = id.split ('_');
                    const baseId = this.safeString (parts, 0);
                    const quoteId = this.safeString (parts, 1);
                    const date = this.safeString (parts, 2);
                    const linear = quoteId.toLowerCase () === settle;
                    const inverse = baseId.toLowerCase () === settle;
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    let symbol = '';
                    if (date !== undefined) {
                        symbol = base + '/' + quote + ':' + this.safeCurrencyCode (settle) + '-' + date;
                    } else {
                        symbol = base + '/' + quote + ':' + this.safeCurrencyCode (settle);
                    }
                    const priceDeviate = this.safeString (market, 'order_price_deviate');
                    const markPrice = this.safeString (market, 'mark_price');
                    const minMultiplier = Precise.stringSub ('1', priceDeviate);
                    const maxMultiplier = Precise.stringAdd ('1', priceDeviate);
                    const minPrice = Precise.stringMul (minMultiplier, markPrice);
                    const maxPrice = Precise.stringMul (maxMultiplier, markPrice);
                    const takerPercent = this.safeString (market, 'taker_fee_rate');
                    const makerPercent = this.safeString (market, 'maker_fee_rate', takerPercent);
                    const feeIndex = (type === 'futures') ? 'swap' : type;
                    const pricePrecision = this.safeNumber (market, 'order_price_round');
                    result.push ({
                        'info': market,
                        'id': id,
                        'baseId': baseId,
                        'quoteId': quoteId,
                        'settleId': this.safeSymbol (settle),
                        'base': base,
                        'quote': quote,
                        'symbol': symbol,
                        'type': type,
                        'spot': spot,
                        'margin': margin,
                        'futures': futures,
                        'swap': swap,
                        'option': option,
                        'derivative': true,
                        'contract': true,
                        'linear': linear,
                        'inverse': inverse,
                        // Fee is in %, so divide by 100
                        'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')),
                        'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
                        'contractSize': this.safeString (market, 'quanto_multiplier'),
                        'precision': {
                            'amount': this.parseNumber ('1'),
                            'price': pricePrecision,
                        },
                        'limits': {
                            'leverage': {
                                'min': this.safeNumber (market, 'leverage_min'),
                                'max': this.safeNumber (market, 'leverage_max'),
                            },
                            'amount': {
                                'min': this.safeNumber (market, 'order_size_min'),
                                'max': this.safeNumber (market, 'order_size_max'),
                            },
                            'price': {
                                'min': minPrice,
                                'max': maxPrice,
                            },
                        },
                        'expiry': this.safeInteger (market, 'expire_time'),
                        'fees': this.safeValue (this.fees, feeIndex, {}),
                    });
                }
            }
        } else {
            response = await this[method] (query);
            //
            //  Spot
            //      [
            //           {
            //             "id": "DEGO_USDT",
            //             "base": "DEGO",
            //             "quote": "USDT",
            //             "fee": "0.2",
            //             "min_quote_amount": "1",
            //             "amount_precision": "4",
            //             "precision": "4",
            //             "trade_status": "tradable",
            //             "sell_start": "0",
            //             "buy_start": "0"
            //           }
            //      ]
            //
            //  Margin
            //      [
            //         {
            //           "id": "ETH_USDT",
            //           "base": "ETH",
            //           "quote": "USDT",
            //           "leverage": 3,
            //           "min_base_amount": "0.01",
            //           "min_quote_amount": "100",
            //           "max_quote_amount": "1000000"
            //         }
            //       ]
            //
            for (let i = 0; i < response.length; i++) {
                const market = response[i];
                const id = this.safeString (market, 'id');
                const spot = (type === 'spot');
                const futures = (type === 'futures');
                const swap = (type === 'swap');
                const option = (type === 'option');
                const [ baseId, quoteId ] = id.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const symbol = base + '/' + quote;
                const takerPercent = this.safeString (market, 'fee');
                const makerPercent = this.safeString (market, 'maker_fee_rate', takerPercent);
                const amountPrecisionString = this.safeString (market, 'amount_precision');
                const pricePrecisionString = this.safeString (market, 'precision');
                const amountPrecision = this.parseNumber (this.parsePrecision (amountPrecisionString));
                const pricePrecision = this.parseNumber (this.parsePrecision (pricePrecisionString));
                const tradeStatus = this.safeString (market, 'trade_status');
                result.push ({
                    'info': market,
                    'id': id,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'settleId': undefined,
                    'base': base,
                    'quote': quote,
                    'symbol': symbol,
                    'type': type,
                    'spot': spot,
                    'margin': margin,
                    'futures': futures,
                    'swap': swap,
                    'option': option,
                    'contract': false,
                    'derivative': false,
                    'linear': false,
                    'inverse': false,
                    // Fee is in %, so divide by 100
                    'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')),
                    'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
                    'precision': {
                        'amount': amountPrecision,
                        'price': pricePrecision,
                    },
                    'active': tradeStatus === 'tradable',
                    'limits': {
                        'amount': {
                            'min': amountPrecision,
                            'max': undefined,
                        },
                        'price': {
                            'min': pricePrecision,
                            'max': undefined,
                        },
                        'cost': {
                            'min': this.safeNumber (market, 'min_quote_amount'),
                            'max': undefined,
                        },
                        'leverage': {
                            'max': this.safeNumber (market, 'lever', 1),
                        },
                    },
                });
            }
        }
        return result;
    }

    prepareRequest (market) {
        if (market['contract']) {
            return {
                'contract': market['id'],
                'settle': market['settleId'],
            };
        } else {
            return {
                'currency_pair': market['id'],
            };
        }
    }

    getSettlementCurrencies (type, method) {
        const options = this.safeValue (this.options, type, {}); // [ 'BTC', 'USDT' ] unified codes
        const fetchMarketsContractOptions = this.safeValue (options, method, {});
        const defaultSettle = type === 'swap' ? ['usdt'] : ['btc'];
        return this.safeValue (fetchMarketsContractOptions, 'settlementCurrencies', defaultSettle);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicSpotGetCurrencies (params);
        //
        //     {
        //       "currency": "BCN",
        //       "delisted": false,
        //       "withdraw_disabled": true,
        //       "withdraw_delayed": false,
        //       "deposit_disabled": true,
        //       "trade_disabled": false
        //     }
        //
        const result = {};
        // TODO: remove magic constants
        const amountPrecision = this.parseNumber ('1e-6');
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const delisted = this.safeValue (entry, 'delisted');
            const withdraw_disabled = this.safeValue (entry, 'withdraw_disabled');
            const deposit_disabled = this.safeValue (entry, 'disabled_disabled');
            const trade_disabled = this.safeValue (entry, 'trade_disabled');
            const active = !(delisted && withdraw_disabled && deposit_disabled && trade_disabled);
            result[code] = {
                'id': currencyId,
                'name': undefined,
                'code': code,
                'precision': amountPrecision,
                'info': entry,
                'active': active,
                'fee': undefined,
                'fees': [],
                'limits': this.limits,
            };
        }
        return result;
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'contract': market['id'],
            'settle': market['quote'].toLowerCase (),
        };
        const response = await this.publicFuturesGetSettleContractsContract (this.extend (request, params));
        //
        // [
        //     {
        //       "name": "BTC_USDT",
        //       "type": "direct",
        //       "quanto_multiplier": "0.0001",
        //       "ref_discount_rate": "0",
        //       "order_price_deviate": "0.5",
        //       "maintenance_rate": "0.005",
        //       "mark_type": "index",
        //       "last_price": "38026",
        //       "mark_price": "37985.6",
        //       "index_price": "37954.92",
        //       "funding_rate_indicative": "0.000219",
        //       "mark_price_round": "0.01",
        //       "funding_offset": 0,
        //       "in_delisting": false,
        //       "risk_limit_base": "1000000",
        //       "interest_rate": "0.0003",
        //       "order_price_round": "0.1",
        //       "order_size_min": 1,
        //       "ref_rebate_rate": "0.2",
        //       "funding_interval": 28800,
        //       "risk_limit_step": "1000000",
        //       "leverage_min": "1",
        //       "leverage_max": "100",
        //       "risk_limit_max": "8000000",
        //       "maker_fee_rate": "-0.00025",
        //       "taker_fee_rate": "0.00075",
        //       "funding_rate": "0.002053",
        //       "order_size_max": 1000000,
        //       "funding_next_apply": 1610035200,
        //       "short_users": 977,
        //       "config_change_time": 1609899548,
        //       "trade_size": 28530850594,
        //       "position_size": 5223816,
        //       "long_users": 455,
        //       "funding_impact_value": "60000",
        //       "orders_limit": 50,
        //       "trade_id": 10851092,
        //       "orderbook_id": 2129638396
        //     }
        //   ]
        //
        return this.parseFundingRate (response);
    }

    async fetchFundingRates (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const settle = this.safeString (params, 'settle');  // TODO: Save settle in markets?
        const request = {
            'settle': settle.toLowerCase (),
        };
        const response = await this.publicFuturesGetSettleContracts (this.extend (request, params));
        //
        // [
        //     {
        //       "name": "BTC_USDT",
        //       "type": "direct",
        //       "quanto_multiplier": "0.0001",
        //       "ref_discount_rate": "0",
        //       "order_price_deviate": "0.5",
        //       "maintenance_rate": "0.005",
        //       "mark_type": "index",
        //       "last_price": "38026",
        //       "mark_price": "37985.6",
        //       "index_price": "37954.92",
        //       "funding_rate_indicative": "0.000219",
        //       "mark_price_round": "0.01",
        //       "funding_offset": 0,
        //       "in_delisting": false,
        //       "risk_limit_base": "1000000",
        //       "interest_rate": "0.0003",
        //       "order_price_round": "0.1",
        //       "order_size_min": 1,
        //       "ref_rebate_rate": "0.2",
        //       "funding_interval": 28800,
        //       "risk_limit_step": "1000000",
        //       "leverage_min": "1",
        //       "leverage_max": "100",
        //       "risk_limit_max": "8000000",
        //       "maker_fee_rate": "-0.00025",
        //       "taker_fee_rate": "0.00075",
        //       "funding_rate": "0.002053",
        //       "order_size_max": 1000000,
        //       "funding_next_apply": 1610035200,
        //       "short_users": 977,
        //       "config_change_time": 1609899548,
        //       "trade_size": 28530850594,
        //       "position_size": 5223816,
        //       "long_users": 455,
        //       "funding_impact_value": "60000",
        //       "orders_limit": 50,
        //       "trade_id": 10851092,
        //       "orderbook_id": 2129638396
        //     }
        //   ]
        //
        const result = this.parseFundingRates (response);
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //       "name": "BTC_USDT",
        //       "type": "direct",
        //       "quanto_multiplier": "0.0001",
        //       "ref_discount_rate": "0",
        //       "order_price_deviate": "0.5",
        //       "maintenance_rate": "0.005",
        //       "mark_type": "index",
        //       "last_price": "38026",
        //       "mark_price": "37985.6",
        //       "index_price": "37954.92",
        //       "funding_rate_indicative": "0.000219",
        //       "mark_price_round": "0.01",
        //       "funding_offset": 0,
        //       "in_delisting": false,
        //       "risk_limit_base": "1000000",
        //       "interest_rate": "0.0003",
        //       "order_price_round": "0.1",
        //       "order_size_min": 1,
        //       "ref_rebate_rate": "0.2",
        //       "funding_interval": 28800,
        //       "risk_limit_step": "1000000",
        //       "leverage_min": "1",
        //       "leverage_max": "100",
        //       "risk_limit_max": "8000000",
        //       "maker_fee_rate": "-0.00025",
        //       "taker_fee_rate": "0.00075",
        //       "funding_rate": "0.002053",
        //       "order_size_max": 1000000,
        //       "funding_next_apply": 1610035200,
        //       "short_users": 977,
        //       "config_change_time": 1609899548,
        //       "trade_size": 28530850594,
        //       "position_size": 5223816,
        //       "long_users": 455,
        //       "funding_impact_value": "60000",
        //       "orders_limit": 50,
        //       "trade_id": 10851092,
        //       "orderbook_id": 2129638396
        //     }
        //
        const marketId = this.safeString (contract, 'name');
        const symbol = this.safeSymbol (marketId, market);
        const markPrice = this.safeNumber (contract, 'mark_price');
        const indexPrice = this.safeNumber (contract, 'index_price');
        const interestRate = this.safeNumber (contract, 'interest_rate');
        const fundingRate = this.safeString (contract, 'funding_rate');
        const fundingInterval = this.safeString (contract, 'funding_interval') * 1000;
        const nextFundingTime = this.safeInteger (contract, 'funding_next_apply') * 1000;
        const previousFundingTime = (this.safeNumber (contract, 'funding_next_apply') * 1000) - fundingInterval;
        const fundingRateIndicative = this.safeNumber (contract, 'funding_rate_indicative');
        const timestamp = this.milliseconds ();
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': interestRate,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'previousFundingRate': fundingRate,
            'nextFundingRate': fundingRateIndicative,
            'previousFundingTimestamp': previousFundingTime,
            'nextFundingTimestamp': nextFundingTime,
            'previousFundingDatetime': this.iso8601 (previousFundingTime),
            'nextFundingDatetime': this.iso8601 (nextFundingTime),
        };
    }

    async fetchNetworkDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateWalletGetDepositAddress (this.extend (request, params));
        const addresses = this.safeValue (response, 'multichain_addresses');
        const currencyId = this.safeString (response, 'currency');
        code = this.safeCurrencyCode (currencyId);
        const result = {};
        for (let i = 0; i < addresses.length; i++) {
            const entry = addresses[i];
            //
            //     {
            //       "chain": "ETH",
            //       "address": "0x359a697945E79C7e17b634675BD73B33324E9408",
            //       "payment_id": "",
            //       "payment_name": "",
            //       "obtain_failed": "0"
            //     }
            //
            const obtainFailed = this.safeInteger (entry, 'obtain_failed');
            if (obtainFailed) {
                continue;
            }
            const network = this.safeString (entry, 'chain');
            const address = this.safeString (entry, 'address');
            let tag = this.safeString (entry, 'payment_id');
            const tagLength = tag.length;
            tag = tagLength ? tag : undefined;
            result[network] = {
                'info': entry,
                'code': code,
                'address': address,
                'tag': tag,
            };
        }
        return result;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateWalletGetDepositAddress (this.extend (request, params));
        //
        //     {
        //       "currency": "XRP",
        //       "address": "rHcFoo6a9qT5NHiVn1THQRhsEGcxtYCV4d 391331007",
        //       "multichain_addresses": [
        //         {
        //           "chain": "XRP",
        //           "address": "rHcFoo6a9qT5NHiVn1THQRhsEGcxtYCV4d",
        //           "payment_id": "391331007",
        //           "payment_name": "Tag",
        //           "obtain_failed": 0
        //         }
        //       ]
        //     }
        //
        const currencyId = this.safeString (response, 'currency');
        code = this.safeCurrencyCode (currencyId);
        const addressField = this.safeString (response, 'address');
        let tag = undefined;
        let address = undefined;
        if (addressField.indexOf (' ') >= 0) {
            const splitted = addressField.split (' ');
            address = splitted[0];
            tag = splitted[1];
        } else {
            address = addressField;
        }
        return {
            'info': response,
            'code': code,
            'address': address,
            'tag': tag,
            'network': undefined,
        };
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateWalletGetFee (params);
        //
        //     {
        //       "user_id": 1486602,
        //       "taker_fee": "0.002",
        //       "maker_fee": "0.002",
        //       "gt_discount": true,
        //       "gt_taker_fee": "0.0015",
        //       "gt_maker_fee": "0.0015",
        //       "loan_fee": "0.18",
        //       "point_type": "0",
        //       "futures_taker_fee": "0.0005",
        //       "futures_maker_fee": "0"
        //     }
        //
        const result = {};
        const taker = this.safeNumber (response, 'taker_fee');
        const maker = this.safeNumber (response, 'maker_fee');
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'maker': maker,
                'taker': taker,
                'info': response,
                'symbol': symbol,
            };
        }
        return result;
    }

    async fetchFundingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateWalletGetWithdrawStatus (params);
        //
        //     {
        //       "currency": "MTN",
        //       "name": "Medicalchain",
        //       "name_cn": "Medicalchain",
        //       "deposit": "0",
        //       "withdraw_percent": "0%",
        //       "withdraw_fix": "900",
        //       "withdraw_day_limit": "500000",
        //       "withdraw_day_limit_remain": "500000",
        //       "withdraw_amount_mini": "900.1",
        //       "withdraw_eachtime_limit": "90000000000",
        //       "withdraw_fix_on_chains": {
        //         "ETH": "900"
        //       }
        //     }
        //
        const withdrawFees = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            withdrawFees[code] = {};
            let withdrawFix = this.safeValue (entry, 'withdraw_fix_on_chains');
            if (withdrawFix === undefined) {
                withdrawFix = {};
                withdrawFix[code] = this.safeNumber (entry, 'withdraw_fix');
            }
            const keys = Object.keys (withdrawFix);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                withdrawFees[code][key] = this.parseNumber (withdrawFix[key]);
            }
        }
        return {
            'info': response,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        // let defaultType = 'future';
        const market = this.market (symbol);
        const request = this.prepareRequest (market);
        request['type'] = 'fund';  // 'dnw' 'pnl' 'fee' 'refr' 'fund' 'point_dnw' 'point_fee' 'point_refr'
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const method = this.getSupportedMapping (market['type'], {
            'swap': 'privateFuturesGetSettleAccountBook',
            'futures': 'privateDeliveryGetSettleAccountBook',
        });
        const response = await this[method] (this.extend (request, params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeTimestamp (entry, 'time');
            result.push ({
                'info': entry,
                'symbol': symbol,
                'code': this.safeCurrencyCode (this.safeString (entry, 'text')),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': undefined,
                'amount': this.safeNumber (entry, 'change'),
            });
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        //     const request = {
        //         'currency_pair': market['id'],
        //         'interval': '0', // depth, 0 means no aggregation is applied, default to 0
        //         'limit': limit, // maximum number of order depth data in asks or bids
        //         'with_id': true, // return order book ID
        //     };
        //
        const request = this.prepareRequest (market);
        const spotOrMargin = market['spot'] || market['margin'];
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'publicSpotGetOrderBook',
            'margin': 'publicSpotGetOrderBook',
            'swap': 'publicFuturesGetSettleOrderBook',
            'futures': 'publicDeliveryGetSettleOrderBook',
        });
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this[method] (this.extend (request, params));
        //
        // SPOT
        //
        //     {
        //         "current": 1634345973275,
        //         "update": 1634345973271,
        //         "asks": [
        //             ["2.2241","12449.827"],
        //             ["2.2242","200"],
        //             ["2.2244","826.931"],
        //             ["2.2248","3876.107"],
        //             ["2.225","2377.252"],
        //             ["2.22509","439.484"],
        //             ["2.2251","1489.313"],
        //             ["2.2253","714.582"],
        //             ["2.2254","1349.784"],
        //             ["2.2256","234.701"]],
        //          "bids":[
        //             ["2.2236","32.465"],
        //             ["2.2232","243.983"],
        //             ["2.2231","32.207"],
        //             ["2.223","449.827"],
        //             ["2.2228","7.918"],
        //             ["2.2227","12703.482"],
        //             ["2.2226","143.033"],
        //             ["2.2225","143.027"],
        //             ["2.2224","1369.352"],
        //             ["2.2223","756.063"]
        //         ]
        //     }
        //
        // Perpetual Swap
        //
        //     {
        //         "current": 1634350208.745,
        //         "asks": [
        //             {"s":24909,"p": "61264.8"},
        //             {"s":81,"p": "61266.6"},
        //             {"s":2000,"p": "61267.6"},
        //             {"s":490,"p": "61270.2"},
        //             {"s":12,"p": "61270.4"},
        //             {"s":11782,"p": "61273.2"},
        //             {"s":14666,"p": "61273.3"},
        //             {"s":22541,"p": "61273.4"},
        //             {"s":33,"p": "61273.6"},
        //             {"s":11980,"p": "61274.5"}
        //         ],
        //         "bids": [
        //             {"s":41844,"p": "61264.7"},
        //             {"s":13783,"p": "61263.3"},
        //             {"s":1143,"p": "61259.8"},
        //             {"s":81,"p": "61258.7"},
        //             {"s":2471,"p": "61257.8"},
        //             {"s":2471,"p": "61257.7"},
        //             {"s":2471,"p": "61256.5"},
        //             {"s":3,"p": "61254.2"},
        //             {"s":114,"p": "61252.4"},
        //             {"s":14372,"p": "61248.6"}
        //         ],
        //         "update": 1634350208.724
        //     }
        //
        let timestamp = this.safeInteger (response, 'current');
        if (!spotOrMargin) {
            timestamp = timestamp * 1000;
        }
        const priceKey = spotOrMargin ? 0 : 'p';
        const amountKey = spotOrMargin ? 1 : 's';
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', priceKey, amountKey);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.prepareRequest (market);
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'publicSpotGetTickers',
            'margin': 'publicSpotGetTickers',
            'swap': 'publicFuturesGetSettleTickers',
            'futures': 'publicDeliveryGetSettleTickers',
        });
        const response = await this[method] (this.extend (request, params));
        const ticker = this.safeValue (response, 0);
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //  SPOT
        //
        //     {
        //         "currency_pair": "KFC_USDT",
        //         "last": "7.255",
        //         "lowest_ask": "7.298",
        //         "highest_bid": "7.218",
        //         "change_percentage": "-1.18",
        //         "base_volume": "1219.053687865",
        //         "quote_volume": "8807.40299875455",
        //         "high_24h": "7.262",
        //         "low_24h": "7.095"
        //     }
        //
        //  LINEAR/DELIVERY
        //
        //     {
        //         "contract": "BTC_USDT",
        //         "last": "6432",
        //         "low_24h": "6278",
        //         "high_24h": "6790",
        //         "change_percentage": "4.43",
        //         "total_size": "32323904",
        //         "volume_24h": "184040233284",
        //         "volume_24h_btc": "28613220",
        //         "volume_24h_usd": "184040233284",
        //         "volume_24h_base": "28613220",
        //         "volume_24h_quote": "184040233284",
        //         "volume_24h_settle": "28613220",
        //         "mark_price": "6534",
        //         "funding_rate": "0.0001",
        //         "funding_rate_indicative": "0.0001",
        //         "index_price": "6531"
        //     }
        //
        const marketId = this.safeString2 (ticker, 'currency_pair', 'contract');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeNumber (ticker, 'last');
        const ask = this.safeNumber (ticker, 'lowest_ask');
        const bid = this.safeNumber (ticker, 'highest_bid');
        const high = this.safeNumber (ticker, 'high_24h');
        const low = this.safeNumber (ticker, 'low_24h');
        const baseVolume = this.safeNumber2 (ticker, 'base_volume', 'volume_24h_base');
        const quoteVolume = this.safeNumber2 (ticker, 'quote_volume', 'volume_24h_quote');
        const percentage = this.safeNumber (ticker, 'change_percentage');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const method = this.getSupportedMapping (type, {
            'spot': 'publicSpotGetTickers',
            'margin': 'publicSpotGetTickers',
            'swap': 'publicFuturesGetSettleTickers',
            'futures': 'publicDeliveryGetSettleTickers',
        });
        const request = {};
        const futures = type === 'futures';
        const swap = type === 'swap';
        const settle = this.safeString (params, 'settle');
        if ((swap || futures) && (settle === undefined)) {
            request['settle'] = swap ? 'usdt' : 'btc';
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTickers (response, symbols);
    }

    fetchBalanceHelper (entry) {
        const account = this.account ();
        account['used'] = this.safeString2 (entry, 'locked', 'position_margin');
        account['free'] = this.safeString (entry, 'available');
        return account;
    }

    async fetchBalance (params = {}) {
        // :param params.type: spot, margin, crossMargin, swap or future
        // :param params.settle: Settle currency (usdt or btc) for perpetual swap and futures
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const swap = type === 'swap';
        const futures = type === 'futures';
        const method = this.getSupportedMapping (type, {
            'spot': 'privateSpotGetAccounts',
            'margin': 'privateMarginGetAccounts',
            'swap': 'privateFuturesGetSettleAccounts',
            'futures': 'privateDeliveryGetSettleAccounts',
        });
        const request = {};
        let response = [];
        if (swap || futures) {
            const defaultSettle = swap ? 'usdt' : 'btc';
            request['settle'] = this.safeString (params, 'settle', defaultSettle);
            const response_item = await this[method] (this.extend (request, params));
            response = [response_item];
        } else {
            response = await this[method] (this.extend (request, params));
        }
        // Spot
        //
        //     [
        //         {
        //             "currency": "DBC",
        //             "available": "0",
        //             "locked": "0"
        //         },
        //         ...
        //     ]
        //
        //  Margin
        //
        //    [
        //         {
        //             "currency_pair":"DOGE_USDT",
        //             "locked":false,
        //             "risk":"9999.99",
        //             "base": {
        //               "currency":"DOGE",
        //               "available":"0",
        //               "locked":"0",
        //               "borrowed":"0",
        //               "interest":"0"
        //             },
        //             "quote": {
        //               "currency":"USDT",
        //               "available":"0.73402",
        //               "locked":"0",
        //               "borrowed":"0",
        //               "interest":"0"
        //             }
        //         },
        //         ...
        //    ]
        //
        //  Perpetual Swap
        //
        //    {
        //       order_margin: "0",
        //       point: "0",
        //       bonus: "0",
        //       history: {
        //         dnw: "2.1321",
        //         pnl: "11.5351",
        //         refr: "0",
        //         point_fee: "0",
        //         fund: "-0.32340576684",
        //         bonus_dnw: "0",
        //         point_refr: "0",
        //         bonus_offset: "0",
        //         fee: "-0.20132775",
        //         point_dnw: "0",
        //       },
        //       unrealised_pnl: "13.315100000006",
        //       total: "12.51345151332",
        //       available: "0",
        //       in_dual_mode: false,
        //       currency: "USDT",
        //       position_margin: "12.51345151332",
        //       user: "6333333",
        //     }
        //
        //   Delivery Future
        //
        //     {
        //       order_margin: "0",
        //       point: "0",
        //       history: {
        //         dnw: "1",
        //         pnl: "0",
        //         refr: "0",
        //         point_fee: "0",
        //         point_dnw: "0",
        //         settle: "0",
        //         settle_fee: "0",
        //         point_refr: "0",
        //         fee: "0",
        //       },
        //       unrealised_pnl: "0",
        //       total: "1",
        //       available: "1",
        //       currency: "USDT",
        //       position_margin: "0",
        //       user: "6333333",
        //     }
        //
        const margin = type === 'margin';
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            if (margin) {
                const marketId = this.safeString (entry, 'currency_pair');
                const symbol = this.safeSymbol (marketId, undefined, '_');
                const base = this.safeValue (entry, 'base', {});
                const quote = this.safeValue (entry, 'quote', {});
                const baseCode = this.safeCurrencyCode (this.safeString (base, 'currency', {}));
                const quoteCode = this.safeCurrencyCode (this.safeString (quote, 'currency', {}));
                const subResult = {};
                subResult[baseCode] = this.fetchBalanceHelper (base);
                subResult[quoteCode] = this.fetchBalanceHelper (quote);
                result[symbol] = this.parseBalance (subResult);
            } else {
                const code = this.safeCurrencyCode (this.safeString (entry, 'currency', {}));
                result[code] = this.fetchBalanceHelper (entry);
            }
        }
        return margin ? result : this.parseBalance (result);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const price = this.safeString (params, 'price');
        const request = this.prepareRequest (market);
        request['interval'] = this.timeframes[timeframe];
        let method = 'publicSpotGetCandlesticks';
        if (market['contract']) {
            if (market['futures']) {
                method = 'publicDeliveryGetSettleCandlesticks';
            } else if (market['swap']) {
                method = 'publicFuturesGetSettleCandlesticks';
            }
            const isMark = (price === 'mark');
            const isIndex = (price === 'index');
            if (isMark || isIndex) {
                request['contract'] = price + '_' + market['id'];
                params = this.omit (params, 'price');
            }
        }
        if (since === undefined) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            const timeframeSeconds = this.parseTimeframe (timeframe);
            const timeframeMilliseconds = timeframeSeconds * 1000;
            // align forward to the next timeframe alignment
            since = this.sum (since - (since % timeframeMilliseconds), timeframeMilliseconds);
            request['from'] = parseInt (since / 1000);
            if (limit !== undefined) {
                request['to'] = this.sum (request['from'], limit * timeframeSeconds - 1);
            }
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'mark',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'contract': market['id'],
            'settle': market['settleId'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const method = 'publicFuturesGetSettleFundingRate';
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "r": "0.00063521",
        //         "t": "1621267200000",
        //     }
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeTimestamp (entry, 't');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'r'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'index',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // Spot market candles
        //
        //     [
        //         "1626163200",           // Unix timestamp in seconds
        //         "346711.933138181617",  // Trading volume
        //         "33165.23",             // Close price
        //         "33260",                // Highest price
        //         "33117.6",              // Lowest price
        //         "33184.47"              // Open price
        //     ]
        //
        // Mark and Index price candles
        //
        //     {
        //          "t":1632873600,         // Unix timestamp in seconds
        //          "o": "41025",           // Open price
        //          "h": "41882.17",         // Highest price
        //          "c": "41776.92",         // Close price
        //          "l": "40783.94"          // Lowest price
        //     }
        //
        if (Array.isArray (ohlcv)) {
            return [
                this.safeTimestamp (ohlcv, 0),   // unix timestamp in seconds
                this.safeNumber (ohlcv, 5),      // open price
                this.safeNumber (ohlcv, 3),      // highest price
                this.safeNumber (ohlcv, 4),      // lowest price
                this.safeNumber (ohlcv, 2),      // close price
                this.safeNumber (ohlcv, 1),      // trading volume
            ];
        } else {
            // Mark and Index price candles
            return [
                this.safeTimestamp (ohlcv, 't'), // unix timestamp in seconds
                this.safeNumber (ohlcv, 'o'),    // open price
                this.safeNumber (ohlcv, 'h'),    // highest price
                this.safeNumber (ohlcv, 'l'),    // lowest price
                this.safeNumber (ohlcv, 'c'),    // close price
                this.safeNumber (ohlcv, 'v'),    // trading volume, undefined for mark or index price
            ];
        }
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        // spot
        //
        //     const request = {
        //         'currency_pair': market['id'],
        //         'limit': limit, // maximum number of records to be returned in a single list
        //         'last_id': 'id', // specify list staring point using the id of last record in previous list-query results
        //         'reverse': false, // true to retrieve records where id is smaller than the specified last_id, false to retrieve records where id is larger than the specified last_id
        //     };
        //
        // swap, futures
        //
        //     const request = {
        //         'settle': market['settleId'],
        //         'contract': market['id'],
        //         'limit': limit, // maximum number of records to be returned in a single list
        //         'last_id': 'id', // specify list staring point using the id of last record in previous list-query results
        //         'from': since / 1000), // starting time in seconds, if not specified, to and limit will be used to limit response items
        //         'to': this.seconds (), // end time in seconds, default to current time
        //     };
        //
        const request = this.prepareRequest (market);
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'publicSpotGetTrades',
            'margin': 'publicSpotGetTrades',
            'swap': 'publicFuturesGetSettleTrades',
            'futures': 'publicDeliveryGetSettleTrades',
        });
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        if (since !== undefined && (market['contract'])) {
            request['from'] = parseInt (since / 1000);
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     [
        //         {
        //             id: "1852958144",
        //             create_time: "1634673259",
        //             create_time_ms: "1634673259378.105000",
        //             currency_pair: "ADA_USDT",
        //             side: "sell",
        //             amount: "307.078",
        //             price: "2.104",
        //         }
        //     ]
        //
        // perpetual swap
        //
        //     [
        //         {
        //              size: "2",
        //              id: "2522911",
        //              create_time_ms: "1634673380.182",
        //              create_time: "1634673380.182",
        //              contract: "ADA_USDT",
        //              price: "2.10486",
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        //     const request = {
        //         'currency_pair': market['id'],
        //         // 'limit': limit,
        //         // 'page': 0,
        //         // 'order_id': 'Order ID',
        //         // 'account': 'spot', // default to spot and margin account if not specified, set to cross_margin to operate against margin account
        //         // 'from': since, // default to 7 days before current time
        //         // 'to': this.milliseconds (), // default to current time
        //     };
        //
        const request = this.prepareRequest (market);
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        if (since !== undefined) {
            request['from'] = parseInt (since / 1000);
            // request['to'] = since + 7 * 24 * 60 * 60;
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'privateSpotGetMyTrades',
            'margin': 'privateSpotGetMyTrades',
            'swap': 'privateFuturesGetSettleMyTrades',
            'futures': 'privateDeliveryGetSettleMyTrades',
        });
        const response = await this[method] (this.extend (request, params));
        // SPOT
        // [{
        //     id: "1851927191",
        //     create_time: "1634333360",
        //     create_time_ms: "1634333360359.901000",
        //     currency_pair: "BTC_USDT",
        //     side: "buy",
        //     role: "taker",
        //     amount: "0.0001",
        //     price: "62547.51",
        //     order_id: "93475897349",
        //     fee: "2e-07",
        //     fee_currency: "BTC",
        //     point_fee: "0",
        //     gt_fee: "0",
        //   }]
        // Perpetual Swap
        // [{
        //   size: "-13",
        //   order_id: "79723658958",
        //   id: "47612669",
        //   role: "taker",
        //   create_time: "1634600263.326",
        //   contract: "BTC_USDT",
        //   price: "61987.8",
        // }]
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public
        //
        //     {
        //         "id": "1334253759",
        //         "create_time": "1626342738",
        //         "create_time_ms": "1626342738331.497000",
        //         "currency_pair": "BTC_USDT",
        //         "side": "sell",
        //         "amount": "0.0022",
        //         "price": "32452.16"
        //     }
        //
        // private
        //
        //     {
        //         "id": "218087755",
        //         "create_time": "1578958740",
        //         "create_time_ms": "1578958740122.710000",
        //         "currency_pair": "BTC_USDT",
        //         "side": "sell",
        //         "role": "taker",
        //         "amount": "0.0004",
        //         "price": "8112.77",
        //         "order_id": "8445563839",
        //         "fee": "0.006490216",
        //         "fee_currency": "USDT",
        //         "point_fee": "0",
        //         "gt_fee": "0"
        //     }
        //
        const id = this.safeString (trade, 'id');
        const timestampStringContract = this.safeString (trade, 'create_time');
        const timestampString = this.safeString2 (trade, 'create_time_ms', 'time', timestampStringContract);
        let timestamp = undefined;
        if (timestampString.indexOf ('.') > 0) {
            const milliseconds = timestampString.split ('.');
            timestamp = parseInt (milliseconds[0]);
        }
        if (market['contract']) {
            timestamp = timestamp * 1000;
        }
        const marketId = this.safeString2 (trade, 'currency_pair', 'contract');
        const symbol = this.safeSymbol (marketId, market);
        let amountString = this.safeString2 (trade, 'amount', 'size');
        const priceString = this.safeString (trade, 'price');
        const costString = Precise.stringAbs (Precise.stringMul (amountString, priceString));
        const price = this.parseNumber (priceString);
        const cost = this.parseNumber (costString);
        const contractSide = Precise.stringLt (amountString, '0') ? 'sell' : 'buy';
        amountString = Precise.stringAbs (amountString);
        const amount = this.parseNumber (amountString);
        const side = this.safeString (trade, 'side', contractSide);
        const orderId = this.safeString (trade, 'order_id');
        const gtFee = this.safeString (trade, 'gt_fee');
        let feeCurrency = undefined;
        let feeCost = undefined;
        if (gtFee === '0') {
            feeCurrency = this.safeString (trade, 'fee_currency');
            feeCost = this.safeNumber (trade, 'fee');
        } else {
            feeCurrency = 'GT';
            feeCost = this.parseNumber (gtFee);
        }
        const fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        const takerOrMaker = this.safeString (trade, 'role');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = parseInt (since / 1000);
            request['to'] = since + 30 * 24 * 60 * 60;
        }
        const response = await this.privateWalletGetDeposits (this.extend (request, params));
        return this.parseTransactions (response, currency);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = parseInt (since / 1000);
            request['to'] = since + 30 * 24 * 60 * 60;
        }
        const response = await this.privateWalletGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response, currency);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': this.currencyToPrecision (code, amount),
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeStringLower (networks, network, network); // handle ETH>ERC20 alias
        if (network !== undefined) {
            request['chain'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privateWithdrawalsPost (this.extend (request, params));
        //
        //     {
        //       "id": "w13389675",
        //       "currency": "USDT",
        //       "amount": "50",
        //       "address": "TUu2rLFrmzUodiWfYki7QCNtv1akL682p1",
        //       "memo": null
        //     }
        //
        const currencyId = this.safeString (response, 'currency');
        const id = this.safeString (response, 'id');
        return {
            'info': response,
            'id': id,
            'code': this.safeCurrencyCode (currencyId),
            'amount': this.safeNumber (response, 'amount'),
            'address': this.safeString (response, 'address'),
            'tag': this.safeString (response, 'memo'),
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

    parseTransaction (transaction, currency = undefined) {
        //
        // deposits
        //
        //     {
        //       "id": "d33361395",
        //       "currency": "USDT_TRX",
        //       "address": "TErdnxenuLtXfnMafLbfappYdHtnXQ5U4z",
        //       "amount": "100",
        //       "txid": "ae9374de34e558562fe18cbb1bf9ab4d9eb8aa7669d65541c9fa2a532c1474a0",
        //       "timestamp": "1626345819",
        //       "status": "DONE",
        //       "memo": ""
        //     }
        //
        // withdrawals
        const id = this.safeString (transaction, 'id');
        let type = undefined;
        if (id !== undefined) {
            type = this.parseTransactionType (id[0]);
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeNumber (transaction, 'amount');
        const txid = this.safeString (transaction, 'txid');
        const rawStatus = this.safeString (transaction, 'status');
        const status = this.parseTransactionStatus (rawStatus);
        const address = this.safeString (transaction, 'address');
        const fee = this.safeNumber (transaction, 'fee');
        let tag = this.safeString (transaction, 'memo');
        if (tag === '') {
            tag = undefined;
        }
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': tag,
            'status': status,
            'type': type,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const contract = market['contract'];
        const stopPrice = this.safeNumber (params, 'stopPrice');
        let methodTail = 'Orders';
        const reduceOnly = this.safeValue2 (params, 'reduce_only', 'reduceOnly');
        const defaultTimeInForce = this.safeValue2 (params, 'tif', 'time_in_force', 'gtc');
        let timeInForce = this.safeValue (params, 'timeInForce', defaultTimeInForce);
        params = this.omit (params, [ 'stopPrice', 'reduce_only', 'reduceOnly', 'tif', 'time_in_force', 'timeInForce' ]);
        const isLimitOrder = (type === 'limit');
        const isMarketOrder = (type === 'market');
        if (isLimitOrder && price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for ' + type + ' orders');
        }
        if (contract) {
            const amountToPrecision = this.amountToPrecision (symbol, amount);
            const signedAmount = (side === 'sell') ? Precise.stringNeg (amountToPrecision) : amountToPrecision;
            amount = parseInt (signedAmount);
            if (isMarketOrder) {
                timeInForce = 'ioc';
                price = 0;
            }
        } else if (!isLimitOrder) {
            // Gateio doesn't have market orders for spot
            throw new InvalidOrder (this.id + ' createOrder() does not support ' + type + ' orders for ' + market['type'] + ' markets');
        }
        let request = undefined;
        const trigger = this.safeValue (params, 'trigger');
        if (stopPrice === undefined && trigger === undefined) {
            if (contract) {
                // contract order
                request = {
                    'contract': market['id'], // filled in prepareRequest above
                    'size': amount, // int64, positive = bid, negative = ask
                    // 'iceberg': 0, // int64, display size for iceberg order, 0 for non-iceberg, note that you will have to pay the taker fee for the hidden size
                    'price': this.priceToPrecision (symbol, price), // 0 for market order with tif set as ioc
                    // 'close': false, // true to close the position, with size set to 0
                    // 'reduce_only': false, // St as true to be reduce-only order
                    // 'tif': 'gtc', // gtc, ioc, poc PendingOrCancelled == postOnly order
                    // 'text': clientOrderId, // 't-abcdef1234567890',
                    // 'auto_size': '', // close_long, close_short, note size also needs to be set to 0
                    'settle': market['settleId'], // filled in prepareRequest above
                };
                if (reduceOnly !== undefined) {
                    request['reduce_only'] = reduceOnly;
                }
                if (timeInForce !== undefined) {
                    request['tif'] = timeInForce;
                }
            } else {
                const options = this.safeValue (this.options, 'createOrder', {});
                const defaultAccount = this.safeString (options, 'account', 'spot');
                const account = this.safeString (params, 'account', defaultAccount);
                params = this.omit (params, 'account');
                // spot order
                request = {
                    // 'text': clientOrderId, // 't-abcdef1234567890',
                    'currency_pair': market['id'], // filled in prepareRequest above
                    'type': type,
                    'account': account, // 'spot', 'margin', 'cross_margin'
                    'side': side,
                    'amount': this.amountToPrecision (symbol, amount),
                    'price': this.priceToPrecision (symbol, price),
                    // 'time_in_force': 'gtc', // gtc, ioc, poc PendingOrCancelled == postOnly order
                    // 'iceberg': 0, // amount to display for the iceberg order, null or 0 for normal orders, set to -1 to hide the order completely
                    // 'auto_borrow': false, // used in margin or cross margin trading to allow automatic loan of insufficient amount if balance is not enough
                    // 'auto_repay': false, // automatic repayment for automatic borrow loan generated by cross margin order, diabled by default
                };
                if (timeInForce !== undefined) {
                    request['time_in_force'] = timeInForce;
                }
            }
            let clientOrderId = this.safeString2 (params, 'text', 'clientOrderId');
            if (clientOrderId !== undefined) {
                // user-defined, must follow the rules if not empty
                //     prefixed with t-
                //     no longer than 28 bytes without t- prefix
                //     can only include 0-9, A-Z, a-z, underscores (_), hyphens (-) or dots (.)
                if (clientOrderId.length > 28) {
                    throw new BadRequest (this.id + ' createOrder() clientOrderId or text param must be up to 28 characters');
                }
                params = this.omit (params, [ 'text', 'clientOrderId' ]);
                if (clientOrderId[0] !== 't') {
                    clientOrderId = 't-' + clientOrderId;
                }
                request['text'] = clientOrderId;
            }
        } else {
            if (contract) {
                // contract conditional order
                const rule = (side === 'sell') ? 1 : 2;
                request = {
                    'initial': {
                        'contract': market['id'],
                        'size': amount, // positive = buy, negative = sell, set to 0 to close the position
                        'price': this.priceToPrecision (symbol, price), // set to 0 to use market price
                        // 'close': false, // set to true if trying to close the position
                        // 'tif': 'gtc', // gtc, ioc, if using market price, only ioc is supported
                        // 'text': clientOrderId, // web, api, app
                        // 'reduce_only': false,
                    },
                    'trigger': {
                        // 'strategy_type': 0, // 0 = by price, 1 = by price gap, only 0 is supported currently
                        // 'price_type': 0, // 0 latest deal price, 1 mark price, 2 index price
                        'price': this.priceToPrecision (symbol, stopPrice), // price or gap
                        'rule': rule, // 1 means price_type >= price, 2 means price_type <= price
                        // 'expiration': expiration, how many seconds to wait for the condition to be triggered before cancelling the order
                    },
                    'settle': market['settleId'],
                };
                const expiration = this.safeInteger (params, 'expiration');
                if (expiration !== undefined) {
                    request['trigger']['expiration'] = expiration;
                    params = this.omit (params, 'expiration');
                }
                if (reduceOnly !== undefined) {
                    request['initial']['reduce_only'] = reduceOnly;
                }
                if (timeInForce !== undefined) {
                    request['initial']['tif'] = timeInForce;
                }
            } else {
                // spot conditional order
                const options = this.safeValue (this.options, 'createOrder', {});
                const defaultAccount = this.safeString (options, 'account', 'normal');
                const account = this.safeString (params, 'account', defaultAccount);
                params = this.omit (params, 'account');
                const defaultExpiration = this.safeInteger (options, 'expiration');
                const expiration = this.safeInteger (params, 'expiration', defaultExpiration);
                const rule = (side === 'sell') ? '>=' : '<=';
                const triggerPrice = this.safeValue (trigger, 'price', stopPrice);
                request = {
                    'trigger': {
                        'price': this.priceToPrecision (symbol, triggerPrice),
                        'rule': rule, // >= triggered when market price larger than or equal to price field, <= triggered when market price less than or equal to price field
                        'expiration': expiration, // required, how long (in seconds) to wait for the condition to be triggered before cancelling the order
                    },
                    'put': {
                        'type': type,
                        'side': side,
                        'price': this.priceToPrecision (symbol, price),
                        'amount': this.amountToPrecision (symbol, amount),
                        'account': account, // normal, margin
                        'time_in_force': timeInForce, // gtc, ioc for taker only
                    },
                    'market': market['id'],
                };
            }
            methodTail = 'PriceOrders';
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'privateSpotPost' + methodTail,
            'margin': 'privateSpotPost' + methodTail,
            'swap': 'privateFuturesPostSettle' + methodTail,
            'future': 'privateDeliveryPostSettle' + methodTail,
        });
        const response = await this[method] (this.deepExtend (request, params));
        //
        // spot
        //
        //     {
        //         "id":"95282841887",
        //         "text":"apiv4",
        //         "create_time":"1637383156",
        //         "update_time":"1637383156",
        //         "create_time_ms":1637383156017,
        //         "update_time_ms":1637383156017,
        //         "status":"open",
        //         "currency_pair":"ETH_USDT",
        //         "type":"limit",
        //         "account":"spot",
        //         "side":"buy",
        //         "amount":"0.01",
        //         "price":"3500",
        //         "time_in_force":"gtc",
        //         "iceberg":"0",
        //         "left":"0.01",
        //         "fill_price":"0",
        //         "filled_total":"0",
        //         "fee":"0",
        //         "fee_currency":"ETH",
        //         "point_fee":"0",
        //         "gt_fee":"0",
        //         "gt_discount":false,
        //         "rebated_fee":"0",
        //         "rebated_fee_currency":"USDT"
        //     }
        //
        // spot conditional
        //
        //     {"id":5891843}
        //
        // futures and perpetual swaps
        //
        //     {
        //         "id":95938572327,
        //         "contract":"ETH_USDT",
        //         "mkfr":"0",
        //         "tkfr":"0.0005",
        //         "tif":"gtc",
        //         "is_reduce_only":false,
        //         "create_time":1637384600.08,
        //         "price":"3000",
        //         "size":1,
        //         "refr":"0",
        //         "left":1,
        //         "text":"api",
        //         "fill_price":"0",
        //         "user":2436035,
        //         "status":"open",
        //         "is_liq":false,
        //         "refu":0,
        //         "is_close":false,
        //         "iceberg":0
        //     }
        //
        // futures and perpetual swaps conditionals
        //
        //     {"id":7615567}
        //
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'filled': 'closed',
            'cancelled': 'canceled',
            'liquidated': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, spot
        //
        //     {
        //       "id": "62364648575",
        //       "text": "apiv4",
        //       "create_time": "1626354834",
        //       "update_time": "1626354834",
        //       "create_time_ms": "1626354833544",
        //       "update_time_ms": "1626354833544",
        //       "status": "open",
        //       "currency_pair": "BTC_USDT",
        //       "type": "limit",
        //       "account": "spot",
        //       "side": "buy",
        //       "amount": "0.0001",
        //       "price": "30000",
        //       "time_in_force": "gtc",
        //       "iceberg": "0",
        //       "left": "0.0001",
        //       "fill_price": "0",
        //       "filled_total": "0",
        //       "fee": "0",
        //       "fee_currency": "BTC",
        //       "point_fee": "0",
        //       "gt_fee": "0",
        //       "gt_discount": true,
        //       "rebated_fee": "0",
        //       "rebated_fee_currency": "USDT"
        //     }
        //
        //
        const id = this.safeString (order, 'id');
        const marketId = this.safeString2 (order, 'currency_pair', 'contract');
        const symbol = this.safeSymbol (marketId, market);
        let timestamp = this.safeTimestamp (order, 'create_time');
        timestamp = this.safeInteger (order, 'create_time_ms', timestamp);
        let lastTradeTimestamp = this.safeTimestamp (order, 'update_time');
        lastTradeTimestamp = this.safeInteger (order, 'update_time_ms', lastTradeTimestamp);
        const amountRaw = this.safeString2 (order, 'amount', 'size');
        const amount = Precise.stringAbs (amountRaw);
        const price = this.safeString (order, 'price');
        // const average = this.safeString (order, 'fill_price');
        const remaining = this.safeString (order, 'left');
        const cost = this.safeString (order, 'filled_total'); // same as filled_price
        let rawStatus = undefined;
        let side = undefined;
        const contract = this.safeValue (market, 'contract');
        if (contract) {
            if (amount) {
                side = Precise.stringGt (amountRaw, '0') ? 'buy' : 'sell';
            } else {
                side = undefined;
            }
            rawStatus = this.safeString (order, 'finish_as', 'open');
        } else {
            // open, closed, cancelled - almost already ccxt unified!
            rawStatus = this.safeString (order, 'status');
            side = this.safeString (order, 'side');
        }
        const status = this.parseOrderStatus (rawStatus);
        const type = this.safeString (order, 'type');
        const timeInForce = this.safeStringUpper2 (order, 'time_in_force', 'tif');
        const fees = [];
        const gtFee = this.safeNumber (order, 'gt_fee');
        if (gtFee) {
            fees.push ({
                'currency': 'GT',
                'cost': gtFee,
            });
        }
        const fee = this.safeNumber (order, 'fee');
        if (fee) {
            fees.push ({
                'currency': this.safeCurrencyCode (this.safeString (order, 'fee_currency')),
                'cost': fee,
            });
        }
        const rebate = this.safeString (order, 'rebated_fee');
        if (rebate) {
            fees.push ({
                'currency': this.safeCurrencyCode (this.safeString (order, 'rebated_fee_currency')),
                'cost': this.parseNumber (Precise.stringNeg (rebate)),
            });
        }
        const mkfr = this.safeNumber (order, 'mkfr');
        const tkfr = this.safeNumber (order, 'tkfr');
        if (mkfr) {
            fees.push ({
                'currency': this.safeCurrencyCode (this.safeString (order, 'settleId')),
                'cost': mkfr,
            });
        }
        if (tkfr) {
            fees.push ({
                'currency': this.safeCurrencyCode (this.safeString (market, 'settleId')),
                'cost': tkfr,
            });
        }
        return this.safeOrder2 ({
            'id': id,
            'clientOrderId': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': amount,
            'cost': cost,
            'filled': undefined,
            'remaining': remaining,
            'fee': undefined,
            'fees': fees,
            'trades': undefined,
            'info': order,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
        };
        if (market['spot'] || market['margin']) {
            request['currency_pair'] = market['id'];
        } else {
            request['settle'] = market['settleId'];
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'privateSpotGetOrdersOrderId',
            // 'margin': 'publicMarginGetTickers',
            'swap': 'privateFuturesGetSettleOrdersOrderId',
            'futures': 'privateDeliveryGetSettlePriceOrdersOrderId',
        });
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        if (symbol === undefined && (type === 'spot') || type === 'margin' || type === 'cross_margin') {
            const request = {
                // 'page': 1,
                // 'limit': limit,
                'account': type, // spot/margin (default), cross_margin
            };
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            const response = await this.privateSpotGetOpenOrders (this.extend (request, params));
            //
            //     [
            //         {
            //             "currency_pair": "ETH_BTC",
            //             "total": 1,
            //             "orders": [
            //                 {
            //                     "id": "12332324",
            //                     "text": "t-123456",
            //                     "create_time": "1548000000",
            //                     "update_time": "1548000100",
            //                     "currency_pair": "ETH_BTC",
            //                     "status": "open",
            //                     "type": "limit",
            //                     "account": "spot",
            //                     "side": "buy",
            //                     "amount": "1",
            //                     "price": "5.00032",
            //                     "time_in_force": "gtc",
            //                     "left": "0.5",
            //                     "filled_total": "2.50016",
            //                     "fee": "0.005",
            //                     "fee_currency": "ETH",
            //                     "point_fee": "0",
            //                     "gt_fee": "0",
            //                     "gt_discount": false,
            //                     "rebated_fee": "0",
            //                     "rebated_fee_currency": "BTC"
            //                 }
            //             ]
            //         },
            //         ...
            //     ]
            //
            let allOrders = [];
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const orders = this.safeValue (entry, 'orders', []);
                const parsed = this.parseOrders (orders, undefined, since, limit);
                allOrders = this.arrayConcat (allOrders, parsed);
            }
            return this.filterBySinceLimit (allOrders, since, limit);
        }
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('finished', symbol, since, limit, params);
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByStatus requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.prepareRequest (market);
        request['status'] = status;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined && (market['spot'] || market['margin'])) {
            request['start'] = parseInt (since / 1000);
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'privateSpotGetOrders',
            'margin': 'privateSpotGetOrders',
            'swap': 'privateFuturesGetSettleOrders',
            'futures': 'privateDeliveryGetSettleOrders',
        });
        if (market['type'] === 'margin' || market['type'] === 'cross_margin') {
            request['account'] = market['type'];
        }
        const response = await this[method] (this.extend (request, params));
        // SPOT
        // {
        //     "id":"8834234273",
        //     "text": "3",
        //     "create_time": "1635406193",
        //     "update_time": "1635406193",
        //     "create_time_ms": 1635406193361,
        //     "update_time_ms": 1635406193361,
        //     "status": "closed",
        //     "currency_pair": "BTC_USDT",
        //     "type": "limit",
        //     "account": "spot",
        //     "side": "sell",
        //     "amount": "0.0002",
        //     "price": "58904.01",
        //     "time_in_force":"gtc",
        //     "iceberg": "0",
        //     "left": "0.0000",
        //     "fill_price": "11.790516",
        //     "filled_total": "11.790516",
        //     "fee": "0.023581032",
        //     "fee_currency": "USDT",
        //     "point_fee": "0",
        //     "gt_fee": "0",
        //     "gt_discount": false,
        //     "rebated_fee_currency": "BTC"
        // }
        // Perpetual Swap
        // {
        //     "status": "finished",
        //     "size":-1,
        //     "left":0,
        //     "id":82750739203,
        //     "is_liq":false,
        //     "is_close":false,
        //     "contract": "BTC_USDT",
        //     "text": "web",
        //     "fill_price": "60721.3",
        //     "finish_as": "filled",
        //     "iceberg":0,
        //     "tif": "ioc",
        //     "is_reduce_only":true,
        //     "create_time": 1635403475.412,
        //     "finish_time": 1635403475.4127,
        //     "price": "0"
        // }
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
        };
        if (market['contract']) {
            request['settle'] = market['settleId'];
        } else {
            request['currency_pair'] = market['id'];
        }
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'privateSpotDeleteOrdersOrderId',
            'margin': 'privateSpotDeleteOrdersOrderId',
            'swap': 'privateFuturesDeleteSettleOrdersOrderId',
            'futures': 'privateDeliveryDeleteSettleOrdersOrderId',
        });
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "id":"95282841887",
        //         "text":"apiv4",
        //         "create_time":"1637383156",
        //         "update_time":"1637383235",
        //         "create_time_ms":1637383156017,
        //         "update_time_ms":1637383235085,
        //         "status":"cancelled",
        //         "currency_pair":"ETH_USDT",
        //         "type":"limit",
        //         "account":"spot",
        //         "side":"buy",
        //         "amount":"0.01",
        //         "price":"3500",
        //         "time_in_force":"gtc",
        //         "iceberg":"0",
        //         "left":"0.01",
        //         "fill_price":"0",
        //         "filled_total":"0",
        //         "fee":"0",
        //         "fee_currency":"ETH",
        //         "point_fee":"0",
        //         "gt_fee":"0",
        //         "gt_discount":false,
        //         "rebated_fee":"0",
        //         "rebated_fee_currency":"USDT"
        //     }
        //
        // spot conditional
        //
        //     {
        //         "market":"ETH_USDT",
        //         "user":2436035,
        //         "trigger":{
        //             "price":"3500",
        //             "rule":"\u003c=",
        //             "expiration":86400
        //         },
        //         "put":{
        //             "type":"limit",
        //             "side":"buy",
        //             "price":"3500",
        //             "amount":"0.01000000000000000000",
        //             "account":"normal",
        //             "time_in_force":"gtc"
        //         },
        //         "id":5891843,
        //         "ctime":1637382379,
        //         "ftime":1637382673,
        //         "status":"canceled"
        //     }
        //
        // perpetual swaps
        //
        //     {
        //         id: "82241928192",
        //         contract: "BTC_USDT",
        //         mkfr: "0",
        //         tkfr: "0.0005",
        //         tif: "gtc",
        //         is_reduce_only: false,
        //         create_time: "1635196145.06",
        //         finish_time: "1635196233.396",
        //         price: "61000",
        //         size: "4",
        //         refr: "0",
        //         left: "4",
        //         text: "web",
        //         fill_price: "0",
        //         user: "6693577",
        //         finish_as: "cancelled",
        //         status: "finished",
        //         is_liq: false,
        //         refu: "0",
        //         is_close: false,
        //         iceberg: "0",
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        return await this.privateSpotDeleteOrders (this.extend (request, params));
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
        const truncated = this.currencyToPrecision (code, amount);
        const request = {
            'currency': currency['id'],
            'from': fromId,
            'to': toId,
            'amount': truncated,
        };
        if ((toId === 'futures') || (toId === 'delivery')) {
            request['settle'] = currency['id'];
        }
        const response = await this.privateWalletPostTransfers (this.extend (request, params));
        //
        // according to the docs
        //
        //     {
        //       "currency": "BTC",
        //       "from": "spot",
        //       "to": "margin",
        //       "amount": "1",
        //       "currency_pair": "BTC_USDT"
        //     }
        //
        // actual response
        //
        //  POST https://api.gateio.ws/api/v4/wallet/transfers 204 No Content
        //
        return {
            'info': response,
            'from': fromId,
            'to': toId,
            'amount': truncated,
            'code': code,
        };
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 0) || (leverage > 100)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 100');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = this.getSupportedMapping (market['type'], {
            'swap': 'privateFuturesPostSettlePositionsContractLeverage',
            'futures': 'privateDeliveryPostSettlePositionsContractLeverage',
        });
        const request = this.prepareRequest (market);
        request['query'] = {
            'leverage': leverage.toString (),
        };
        if ('cross_leverage_limit' in params) {
            if (leverage !== 0) {
                throw new BadRequest (this.id + ' cross margin leverage(valid only when leverage is 0)');
            }
            request['cross_leverage_limit'] = params['cross_leverage_limit'].toString ();
            params = this.omit (params, 'cross_leverage_limit');
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "value":"0",
        //         "leverage":"5",
        //         "mode":"single",
        //         "realised_point":"0",
        //         "contract":"BTC_USDT",
        //         "entry_price":"0",
        //         "mark_price":"62035.86",
        //         "history_point":"0",
        //         "realised_pnl":"0",
        //         "close_order":null,
        //         "size":0,
        //         "cross_leverage_limit":"0",
        //         "pending_orders":0,
        //         "adl_ranking":6,
        //         "maintenance_rate":"0.005",
        //         "unrealised_pnl":"0",
        //         "user":2436035,
        //         "leverage_max":"100",
        //         "history_pnl":"0",
        //         "risk_limit":"1000000",
        //         "margin":"0",
        //         "last_close_pnl":"0",
        //         "liq_price":"0"
        //     }
        //
        return response;
    }

    parsePosition (position, market = undefined) {
        //
        //     {
        //         value: "12.475572",
        //         leverage: "0",
        //         mode: "single",
        //         realised_point: "0",
        //         contract: "BTC_USDT",
        //         entry_price: "62422.6",
        //         mark_price: "62377.86",
        //         history_point: "0",
        //         realised_pnl: "-0.00624226",
        //         close_order:  null,
        //         size: "2",
        //         cross_leverage_limit: "25",
        //         pending_orders: "0",
        //         adl_ranking: "5",
        //         maintenance_rate: "0.005",
        //         unrealised_pnl: "-0.008948",
        //         user: "663337",
        //         leverage_max: "100",
        //         history_pnl: "14.98868396636",
        //         risk_limit: "1000000",
        //         margin: "0.740721495056",
        //         last_close_pnl: "-0.041996015",
        //         liq_price: "59058.58"
        //     }
        //
        const contract = this.safeValue (position, 'contract');
        market = this.safeMarket (contract, market);
        const now = this.milliseconds ();
        const size = this.safeString (position, 'size');
        let side = undefined;
        if (size > 0) {
            side = 'buy';
        } else if (size < 0) {
            side = 'sell';
        }
        const maintenanceRate = this.safeString (position, 'maintenance_rate');
        const notional = this.safeString (position, 'value');
        const initialMargin = this.safeString (position, 'margin');
        // const marginRatio = Precise.stringDiv (maintenanceRate, collateral);
        const unrealisedPnl = this.safeString (position, 'unrealised_pnl');
        return {
            'info': position,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (Precise.stringDiv (initialMargin, notional)),
            'maintenanceMargin': this.parseNumber (Precise.stringMul (maintenanceRate, notional)),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceRate),
            'entryPrice': this.safeNumber (position, 'entry_price'),
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size),
            'contractSize': this.safeNumber (market, 'contractSize'),
            //     realisedPnl: position['realised_pnl'],
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'liq_price'),
            'markPrice': this.safeNumber (position, 'mark_price'),
            'collateral': undefined,
            'marginType': undefined,
            'side': side,
            'percentage': this.parseNumber (Precise.stringDiv (unrealisedPnl, initialMargin)),
        };
    }

    parsePositions (positions) {
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            result.push (this.parsePosition (positions[i]));
        }
        return result;
    }

    async fetchPositions (symbols = undefined, params = {}) {
        // :param symbols: Not used by Gateio
        // :param params:
        //    settle: The currency that derivative contracts are settled in
        //    Other exchange specific params
        //
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchPositions', 'defaultType', 'swap');
        const type = this.safeString (params, 'type', defaultType);
        const method = this.getSupportedMapping (type, {
            'swap': 'privateFuturesGetSettlePositions',
            'futures': 'privateDeliveryGetSettlePositions',
        });
        const defaultSettle = type === 'swap' ? 'usdt' : 'btc';
        const settle = this.safeString (params, 'settle', defaultSettle);
        const request = {
            'settle': settle,
        };
        const response = await this[method] (request);
        //
        //     [
        //         {
        //             value: "12.475572",
        //             leverage: "0",
        //             mode: "single",
        //             realised_point: "0",
        //             contract: "BTC_USDT",
        //             entry_price: "62422.6",
        //             mark_price: "62377.86",
        //             history_point: "0",
        //             realised_pnl: "-0.00624226",
        //             close_order:  null,
        //             size: "2",
        //             cross_leverage_limit: "25",
        //             pending_orders: "0",
        //             adl_ranking: "5",
        //             maintenance_rate: "0.005",
        //             unrealised_pnl: "-0.008948",
        //             user: "6693577",
        //             leverage_max: "100",
        //             history_pnl: "14.98868396636",
        //             risk_limit: "1000000",
        //             margin: "0.740721495056",
        //             last_close_pnl: "-0.041996015",
        //             liq_price: "59058.58"
        //         }
        //     ]
        //
        const result = this.parsePositions (response);
        return this.filterByArray (result, 'symbol', symbols, false);
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const authentication = api[0]; // public, private
        const type = api[1]; // spot, margin, futures, delivery
        let query = this.omit (params, this.extractParams (path));
        path = this.implodeParams (path, params);
        const endPart = (path === '' ? '' : '/' + path);
        const entirePath = '/' + type + endPart;
        let url = this.urls['api'][authentication] + entirePath;
        if (authentication === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            let queryString = '';
            if ((method === 'GET') || (method === 'DELETE')) {
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

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"label":"ORDER_NOT_FOUND","message":"Order not found"}
        //     {"label":"INVALID_PARAM_VALUE","message":"invalid argument: status"}
        //     {"label":"INVALID_PARAM_VALUE","message":"invalid argument: Trigger.rule"}
        //     {"label":"INVALID_PARAM_VALUE","message":"invalid argument: trigger.expiration invalid range"}
        //     {"label":"INVALID_ARGUMENT","detail":"invalid size"}
        //
        const label = this.safeString (response, 'label');
        if (label !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], label, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
