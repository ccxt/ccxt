'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const Precise = require ('./base/Precise');
const { ExchangeError, BadRequest, ArgumentsRequired, AuthenticationError, PermissionDenied, AccountSuspended, InsufficientFunds, RateLimitExceeded, ExchangeNotAvailable, BadSymbol, InvalidOrder, OrderNotFound } = require ('./base/errors');

module.exports = class gateio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'name': 'Gate.io',
            'countries': [ 'KR' ],
            'rateLimit': 10 / 3, // 300 requests per second or 3.33ms
            'version': '4',
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
                'cancelOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchWithdrawals': true,
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
                'BYN': 'Beyond Finance',
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
                'password': true,
            },
            'options': {
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
                'future': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt', 'btc' ],
                    },
                },
                'delivery': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt', 'btc' ],
                    },
                },
            },
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
                'future': {
                    'tierBased': true,
                    'feeSide': 'base',
                    'percentage': true,
                    'maker': this.parseNumber ('0.0'),
                    'taker': this.parseNumber ('0.0005'),
                    'tiers': {
                        'maker': [
                            this.parseNumber ('0.0000'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00008'),
                            this.parseNumber ('-0.01000'),
                            this.parseNumber ('-0.01002'),
                            this.parseNumber ('-0.01005'),
                            this.parseNumber ('-0.02000'),
                            this.parseNumber ('-0.02005'),
                        ],
                        'taker': [
                            [this.parseNumber ('0.00050'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00048'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00046'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00044'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00042'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00040'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00038'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00036'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00034'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00032'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                        ],
                    },
                },
                'delivery': {
                    'tierBased': true,
                    'feeSide': 'base',
                    'percentage': true,
                    'maker': this.parseNumber ('0.0'),
                    'taker': this.parseNumber ('0.0005'),
                    'tiers': {
                        'maker': [
                            this.parseNumber ('0.0000'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00005'),
                            this.parseNumber ('-0.00008'),
                            this.parseNumber ('-0.01000'),
                            this.parseNumber ('-0.01002'),
                            this.parseNumber ('-0.01005'),
                            this.parseNumber ('-0.02000'),
                            this.parseNumber ('-0.02005'),
                        ],
                        'taker': [
                            [this.parseNumber ('0.00050'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00048'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00046'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00044'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00042'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00040'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00038'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00036'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00034'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00032'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                            [this.parseNumber ('0.00030'), this.parseNumber ('0.00075')],
                        ],
                    },
                },
            },
            // https://www.gate.io/docs/apiv4/en/index.html#label-list
            'exceptions': {
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
        });
    }

    async fetchMarkets (params = {}) {
        // :param params['type']: 'spot', 'margin', 'future' or 'delivery'
        // :param params['settle']: The quote currency
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const spot = (type === 'spot');
        const margin = (type === 'margin');
        const futures = (type === 'future');
        const delivery = (type === 'delivery');
        const swap = (type === 'swap');
        const option = (type === 'option');
        if (!spot && !margin && !futures && !delivery) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to " + "'spot', 'margin', 'delivery' or 'future'"); // eslint-disable-line quotes
        }
        let response = undefined;
        const result = [];
        let method = 'publicSpotGetCurrencyPairs';
        if (futures) {
            method = 'publicFuturesGetSettleContracts';
        } else if (delivery) {
            method = 'publicDeliveryGetSettleContracts';
        } else if (margin) {
            method = 'publicMarginGetCurrencyPairs';
        }
        if (futures || delivery) {
            const options = this.safeValue (this.options, type, {}); // [ 'BTC', 'USDT' ] unified codes
            const fetchMarketsContractOptions = this.safeValue (options, 'fetchMarchets', {});
            const settlementCurrencies = this.safeValue (fetchMarketsContractOptions, 'settlementCurrencies', ['usdt']);
            for (let c = 0; c < settlementCurrencies.length; c++) {
                const settle = settlementCurrencies[c];
                query['settle'] = settle;
                response = await this[method] (query);
                //  Futures
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
                //  Delivery
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
                    const underlying = this.safeString (market, 'underlying');
                    let [ baseId, quoteId ] = [undefined, undefined];
                    if (underlying) {
                        [ baseId, quoteId ] = underlying.split ('_');
                    } else {
                        [ baseId, quoteId ] = id.split ('_');
                    }
                    const linear = quoteId.toLowerCase () === settle;
                    const inverse = baseId.toLowerCase () === settle;
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    const symbol = id;
                    const takerPercent = this.safeString (market, 'taker_fee_rate');
                    const makerPercent = this.safeString (market, 'maker_fee_rate', takerPercent);
                    result.push ({
                        'info': market,
                        'id': id,
                        'baseId': baseId,
                        'quoteId': quoteId,
                        'base': base,
                        'quote': quote,
                        'symbol': symbol,
                        'type': type,
                        'spot': spot,
                        'futures': futures,
                        'swap': swap,
                        'option': option,
                        'linear': linear,
                        'inverse': inverse,
                        // Fee is in %, so divide by 100
                        'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')),
                        'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
                        'contractSize': this.safeString (market, 'contractSize', '1'),
                        'contractType': linear ? 'Perpetual' : this.safeString (market, 'cycle'),
                        'limits': {
                            'leverage': {
                                'min': this.safeNumber (market, 'leverage_min'),
                                'max': this.safeNumber (market, 'leverage_max'),
                            },
                            'amount': {
                                'min': this.safeNumber (market, 'order_size_min'),
                                'max': this.safeNumber (market, 'order_size_max'),
                            },
                        },
                        'expiry': this.safeInteger (market, 'expire_time'),
                        'fees': this.fees[type],
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
                const futures = (type === 'future');
                const swap = (type === 'swap');
                const option = (type === 'option');
                const [ baseId, quoteId ] = id.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const symbol = base + '/' + quote;
                const takerPercent = this.safeString (market, 'fee');
                const makerPercent = this.safeString (market, 'maker_fee_rate', takerPercent);
                const amountPrecision = this.safeString (market, 'amount_precision');
                const pricePrecision = this.safeString (market, 'precision');
                const amountLimit = this.parsePrecision (amountPrecision);
                const priceLimit = this.parsePrecision (pricePrecision);
                const tradeStatus = this.safeString (market, 'trade_status');
                result.push ({
                    'info': market,
                    'id': id,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'base': base,
                    'quote': quote,
                    'symbol': symbol,
                    'type': type,
                    'spot': spot,
                    'futures': futures,
                    'swap': swap,
                    'option': option,
                    'linear': false,
                    'inverse': false,
                    // Fee is in %, so divide by 100
                    'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')),
                    'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
                    'precision': {
                        'amount': parseInt (amountPrecision),
                        'price': parseInt (pricePrecision),
                    },
                    'active': tradeStatus === 'tradable',
                    'limits': {
                        'amount': {
                            'min': this.parseNumber (amountLimit),
                            'max': undefined,
                        },
                        'price': {
                            'min': this.parseNumber (priceLimit),
                            'max': undefined,
                        },
                        'cost': {
                            'min': this.safeNumber (market, 'min_quote_amount'),
                            'max': undefined,
                        },
                    },
                });
            }
        }
        return result;
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
        const amountPrecision = 6;
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency_pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this.publicSpotGetOrderBook (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'current');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = 'publicSpotGetTickers';
        const id = market['id'];
        const request = {};
        const linear = market['linear'];
        const inverse = market['inverse'];
        if (linear || inverse) {
            request['contract'] = id;
            request['settle'] = market['baseId'];
            if (market['linear']) {
                method = 'publicFuturesGetTickers';
            } else {
                method = 'publicDeliveryGetTickers';
            }
        } else {
            request['currency_pair'] = id;
        }
        const response = await this[method] (this.extend (request, params));
        const ticker = this.safeValue (response, 0);
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //  SPOT
        //     {
        //       "currency_pair": "KFC_USDT",
        //       "last": "7.255",
        //       "lowest_ask": "7.298",
        //       "highest_bid": "7.218",
        //       "change_percentage": "-1.18",
        //       "base_volume": "1219.053687865",
        //       "quote_volume": "8807.40299875455",
        //       "high_24h": "7.262",
        //       "low_24h": "7.095"
        //     }
        //
        //  LINEAR/DELIVERY
        //
        //   {
        //     "contract": "BTC_USDT",
        //     "last": "6432",
        //     "low_24h": "6278",
        //     "high_24h": "6790",
        //     "change_percentage": "4.43",
        //     "total_size": "32323904",
        //     "volume_24h": "184040233284",
        //     "volume_24h_btc": "28613220",
        //     "volume_24h_usd": "184040233284",
        //     "volume_24h_base": "28613220",
        //     "volume_24h_quote": "184040233284",
        //     "volume_24h_settle": "28613220",
        //     "mark_price": "6534",
        //     "funding_rate": "0.0001",
        //     "funding_rate_indicative": "0.0001",
        //     "index_price": "6531"
        //   }
        //
        const marketId = this.safeString2 (ticker, 'currency_pair', 'contract');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeNumber (ticker, 'last');
        const ask = this.safeNumber (ticker, 'lowest_ask');
        const bid = this.safeNumber (ticker, 'highest_bid');
        const high = this.safeNumber (ticker, 'high_24h');
        const low = this.safeNumber (ticker, 'low_24h');
        const baseVolume = this.safeNumber (ticker, 'base_volume', 'volume_24h_base');
        const quoteVolume = this.safeNumber (ticker, 'quote_volume', 'volume_24h_quote');
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
        let method = 'publicSpotGetTickers';
        const request = {};
        const linear = type === 'future';
        const inverse = type === 'delivery';
        if (linear || inverse) {
            if (linear) {
                if (!params['settle']) {
                    request['settle'] = 'usdt';
                }
                method = 'publicFuturesGetSettleTickers';
            } else {
                if (!params['settle']) {
                    request['settle'] = 'btc';
                }
                method = 'publicDeliveryGetSettleTickers';
            }
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTickers (response, symbols);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateSpotGetAccounts (params);
        //
        //     [
        //       {
        //         "currency": "DBC",
        //         "available": "0",
        //         "locked": "0"
        //       },
        //       ...
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const account = this.account ();
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            account['used'] = this.safeString (entry, 'locked');
            account['free'] = this.safeString (entry, 'available');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        const isMark = (price === 'mark');
        const isIndex = (price === 'index');
        const isFuture = isMark || isIndex;
        const request = {
            'interval': this.timeframes[timeframe],
        };
        if (since === undefined) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            request['from'] = Math.floor (since / 1000);
            if (limit !== undefined) {
                request['to'] = this.sum (request['from'], limit * this.parseTimeframe (timeframe) - 1);
            }
        }
        let method = 'publicSpotGetCandlesticks';
        if (isFuture) {
            request['contract'] = market['id'];
            method = 'publicFuturesGetSettleCandlesticks';
            request['settle'] = market['quote'].toLowerCase ();
            if (isMark) {
                request['contract'] = 'mark_' + request['contract'];
            } else if (isIndex) {
                request['contract'] = 'index_' + request['contract'];
            }
        } else {
            request['currency_pair'] = market['id'];
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

    async fetchFundingRateHistory (symbol, limit = undefined, since = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'contract': market['id'],
            'settle': market['quote'].toLowerCase (),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const method = 'publicFuturesGetSettleFundingRate';
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "fundingRate": "0.00063521",
        //         "fundingTime": "1621267200000",
        //     }
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            rates.push ({
                'symbol': symbol,
                'fundingRate': this.safeNumber (response[i], 'r'),
                'timestamp': this.safeNumber (response[i], 't'),
            });
        }
        return rates;
    }

    async fetchIndexOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'index',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    parseOHLCV (ohlcv, market = undefined) {
        // Spot market candles
        //     [
        //       "1626163200",           // Unix timestamp in seconds
        //       "346711.933138181617",  // Trading volume
        //       "33165.23",             // Close price
        //       "33260",                // Highest price
        //       "33117.6",              // Lowest price
        //       "33184.47"              // Open price
        //     ]
        //
        // Mark and Index price candles
        // {
        //      "t":1632873600,         // Unix timestamp in seconds
        //      "o":"41025",            // Open price
        //      "h":"41882.17",         // Highest price
        //      "c":"41776.92",         // Close price
        //      "l":"40783.94"          // Lowest price
        // }
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
                0,
            ];
        }
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency_pair': market['id'],
        };
        const response = await this.publicSpotGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency_pair': market['id'],
            // 'limit': limit,
            // 'page': 0,
            // 'order_id': 'Order ID',
            // 'account': 'spot', // default to spot and margin account if not specified, set to cross_margin to operate against margin account
            // 'from': since, // default to 7 days before current time
            // 'to': this.milliseconds (), // default to current time
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        if (since !== undefined) {
            request['from'] = Math.floor (since / 1000);
            // request['to'] = since + 7 * 24 * 60 * 60;
        }
        const response = await this.privateSpotGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public
        //     {
        //       "id": "1334253759",
        //       "create_time": "1626342738",
        //       "create_time_ms": "1626342738331.497000",
        //       "currency_pair": "BTC_USDT",
        //       "side": "sell",
        //       "amount": "0.0022",
        //       "price": "32452.16"
        //     }
        //
        // private
        //     {
        //       "id": "218087755",
        //       "create_time": "1578958740",
        //       "create_time_ms": "1578958740122.710000",
        //       "currency_pair": "BTC_USDT",
        //       "side": "sell",
        //       "role": "taker",
        //       "amount": "0.0004",
        //       "price": "8112.77",
        //       "order_id": "8445563839",
        //       "fee": "0.006490216",
        //       "fee_currency": "USDT",
        //       "point_fee": "0",
        //       "gt_fee": "0"
        //     }
        //
        const id = this.safeString (trade, 'id');
        const timestampString = this.safeString2 (trade, 'create_time_ms', 'time');
        let timestamp = undefined;
        if (timestampString.indexOf ('.') > 0) {
            const milliseconds = timestampString.split ('.');
            timestamp = parseInt (milliseconds[0]);
        }
        const marketId = this.safeString (trade, 'currency_pair');
        const symbol = this.safeSymbol (marketId, market);
        const amountString = this.safeString (trade, 'amount');
        const priceString = this.safeString (trade, 'price');
        const cost = this.parseNumber (Precise.stringMul (amountString, priceString));
        const amount = this.parseNumber (amountString);
        const price = this.parseNumber (priceString);
        const side = this.safeString (trade, 'side');
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
            request['from'] = Math.floor (since / 1000);
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
            request['from'] = Math.floor (since / 1000);
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
        const request = {
            'currency_pair': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
            'side': side,
        };
        const response = await this.privateSpotPostOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
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
        const marketId = this.safeString (order, 'currency_pair');
        const symbol = this.safeSymbol (marketId, market);
        let timestamp = this.safeTimestamp (order, 'create_time');
        timestamp = this.safeInteger (order, 'create_time_ms', timestamp);
        let lastTradeTimestamp = this.safeTimestamp (order, 'update_time');
        lastTradeTimestamp = this.safeInteger (order, 'update_time_ms', lastTradeTimestamp);
        const amount = this.safeNumber (order, 'amount');
        const price = this.safeNumber (order, 'price');
        const remaining = this.safeNumber (order, 'left');
        const cost = this.safeNumber (order, 'filled_total'); // same as filled_price
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        // open, closed, cancelled - almost already ccxt unified!
        let status = this.safeString (order, 'status');
        if (status === 'cancelled') {
            status = 'canceled';
        }
        const timeInForce = this.safeStringUpper (order, 'time_in_force');
        const fees = [];
        fees.push ({
            'currency': 'GT',
            'cost': this.safeNumber (order, 'gt_fee'),
        });
        fees.push ({
            'currency': this.safeCurrencyCode (this.safeString (order, 'fee_currency')),
            'cost': this.safeNumber (order, 'fee'),
        });
        const rebate = this.safeString (order, 'rebated_fee');
        fees.push ({
            'currency': this.safeCurrencyCode (this.safeString (order, 'rebated_fee_currency')),
            'cost': this.parseNumber (Precise.stringNeg (rebate)),
        });
        return this.safeOrder ({
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
        });
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'currency_pair': market['id'],
        };
        const response = await this.privateSpotGetOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            const request = {
                // 'page': 1,
                // 'limit': limit,
                // 'account': '', // spot/margin (default), cross_margin
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
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByStatus requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {
            'currency_pair': market['id'],
            'status': status,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start'] = Math.floor (since / 1000);
        }
        const response = await this.privateSpotGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders requires a symbol parameter');
        }
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'currency_pair': market['id'],
        };
        const response = await this.privateSpotDeleteOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response);
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
        //     {
        //       "currency": "BTC",
        //       "from": "spot",
        //       "to": "margin",
        //       "amount": "1",
        //       "currency_pair": "BTC_USDT"
        //     }
        //
        // actual response
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

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const authentication = api[0]; // public, private
        const type = api[1]; // spot, margin, future, delivery
        const query = this.omit (params, this.extractParams (path));
        path = this.implodeParams (path, params);
        const endPart = (path === '' ? '' : '/' + path);
        const entirePath = '/' + type + endPart;
        let url = this.urls['api'][authentication] + entirePath;
        let queryString = '';
        if (authentication === 'public') {
            queryString = this.urlencode (query);
            if (Object.keys (query).length) {
                url += '?' + queryString;
            }
        } else {
            if ((method === 'GET') || (method === 'DELETE')) {
                queryString = this.urlencode (query);
                if (Object.keys (query).length) {
                    url += '?' + queryString;
                }
            } else {
                body = this.json (query);
            }
            const bodyPayload = (body === undefined) ? '' : body;
            const bodySignature = this.hash (this.encode (bodyPayload), 'sha512');
            const timestamp = this.seconds ();
            const timestampString = timestamp.toString ();
            const signaturePath = '/api/v4' + entirePath;
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
        const label = this.safeString (response, 'label');
        if (label !== undefined) {
            const message = this.safeString2 (response, 'message', 'detail', '');
            const Error = this.safeValue (this.exceptions, label, ExchangeError);
            throw new Error (this.id + ' ' + message);
        }
    }
};
