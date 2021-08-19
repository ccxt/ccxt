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
            'country': [ 'KR' ],
            'rateLimit': 1000,
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
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'transfer': true,
                'withdraw': true,
            },
            'api': {
                'public': {
                    'spot': {
                        'get': [
                            'currencies',
                            'currencies/{currency}',
                            'currency_pairs',
                            'currency_pairs/{currency_pair}',
                            'tickers',
                            'order_book',
                            'trades',
                            'candlesticks',
                        ],
                    },
                    'margin': {
                        'get': [
                            'currency_pairs',
                            'currency_pairs/{currency_pair}',
                            'cross/currencies',
                            'cross/currencies/{currency}',
                        ],
                    },
                    'futures': {
                        'get': [
                            '{settle}/contracts',
                            '{settle}/contracts/{contract}',
                            '{settle}/order_book',
                            '{settle}/trades',
                            '{settle}/candlesticks',
                            '{settle}/tickers',
                            '{settle}/funding_rate',
                            '{settle}/insurance',
                            '{settle}/contract_stats',
                            '{settle}/liq_orders',
                        ],
                    },
                    'delivery': {
                        'get': [
                            '{settle}/contracts',
                            '{settle}/contracts/{contract}',
                            '{settle}/order_book',
                            '{settle}/trades',
                            '{settle}/candlesticks',
                            '{settle}/tickers',
                            '{settle}/insurance',
                        ],
                    },
                },
                'private': {
                    'withdrawals': {
                        'post': [
                            '', // /withdrawals
                        ],
                        'delete': [
                            '{withdrawal_id}',
                        ],
                    },
                    'wallet': {
                        'get': [
                            'deposit_address',
                            'withdrawals',
                            'deposits',
                            'sub_account_transfers',
                            'withdraw_status',
                            'sub_account_balances',
                            'fee',
                        ],
                        'post': [
                            'transfers',
                            'sub_account_transfers',
                        ],
                    },
                    'spot': {
                        'get': [
                            'accounts',
                            'open_orders',
                            'orders',
                            'orders/{order_id}',
                            'my_trades',
                            'price_orders',
                            'price_orders/{order_id}',
                        ],
                        'post': [
                            'batch_orders',
                            'orders',
                            'cancel_batch_orders',
                            'price_orders',
                        ],
                        'delete': [
                            'orders',
                            'orders/{order_id}',
                            'price_orders',
                            'price_orders/{order_id}',
                        ],
                    },
                    'margin': {
                        'get': [
                            'account_book',
                            'funding_accounts',
                            'loans',
                            'loans/{loan_id}',
                            'loans/{loan_id}/repayment',
                            'loan_records',
                            'loan_records/{load_record_id}',
                            'auto_repay',
                            'transferable',
                            'cross/accounts',
                            'cross/account_book',
                            'cross/loans',
                            'cross/loans/{loan_id}',
                            'cross/loans/repayments',
                            'cross/transferable',
                        ],
                        'post': [
                            'loans',
                            'merged_loans',
                            'loans/{loan_id}/repayment',
                            'auto_repay',
                            'cross/loans',
                            'cross/loans/repayments',
                        ],
                        'patch': [
                            'loans/{loan_id}',
                            'loan_records/{loan_record_id}',
                        ],
                        'delete': [
                            'loans/{loan_id}',
                        ],
                    },
                    'futures': {
                        'get': [
                            '{settle}/accounts',
                            '{settle}/account_book',
                            '{settle}/positions',
                            '{settle}/positions/{contract}',
                            '{settle}/orders',
                            '{settle}/orders/{order_id}',
                            '{settle}/my_trades',
                            '{settle}/position_close',
                            '{settle}/liquidates',
                            '{settle}/price_orders',
                            '{settle}/price_orders/{order_id}',
                        ],
                        'post': [
                            '{settle}/positions/{contract}/margin',
                            '{settle}/positions/{contract}/leverage',
                            '{settle}/positions/{contract}/risk_limit',
                            '{settle}/dual_mode',
                            '{settle}/dual_comp/positions/{contract}',
                            '{settle}/dual_comp/positions/{contract}/margin',
                            '{settle}/dual_comp/positions/{contract}/leverage',
                            '{settle}/dual_comp/positions/{contract}/risk_limit',
                            '{settle}/orders',
                            '{settle}/price_orders',
                        ],
                        'delete': [
                            '{settle}/orders',
                            '{settle}/orders/{order_id}',
                            '{settle}/price_orders',
                            '{settle}/price_orders/{order_id}',
                        ],
                    },
                    'delivery': {
                        'get': [
                            '{settle}/accounts',
                            '{settle}/account_book',
                            '{settle}/positions',
                            '{settle}/positions/{contract}',
                            '{settle}/orders',
                            '{settle}/orders/{order_id}',
                            '{settle}/my_trades',
                            '{settle}/position_close',
                            '{settle}/liquidates',
                            '{settle}/price_orders',
                            '{settle}/price_orders/{order_id}',
                        ],
                        'post': [
                            '{settle}/positions/{contract}/margin',
                            '{settle}/positions/{contract}/leverage',
                            '{settle}/positions/{contract}/risk_limit',
                            '{settle}/orders',
                        ],
                        'delete': [
                            '{settle}/orders',
                            '{settle}/orders/{order_id}',
                            '{settle}/price_orders',
                            '{settle}/price_orders/{order_id}',
                        ],
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
                'VAI': 'VAIOT',
            },
            'options': {
                'accountsByType': {
                    'spot': 'spot',
                    'margin': 'margin',
                    'futures': 'futures',
                    'delivery': 'delivery',
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
        const response = await this.publicSpotGetCurrencyPairs (params);
        //
        //     {
        //       "id": "DEGO_USDT",
        //       "base": "DEGO",
        //       "quote": "USDT",
        //       "fee": "0.2",
        //       "min_quote_amount": "1",
        //       "amount_precision": "4",
        //       "precision": "4",
        //       "trade_status": "tradable",
        //       "sell_start": "0",
        //       "buy_start": "0"
        //     }
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const id = this.safeString (entry, 'id');
            const baseId = this.safeString (entry, 'base');
            const quoteId = this.safeString (entry, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            // Fee is in %, so divide by 100
            const taker = this.safeNumber (entry, 'fee') / 100;
            const maker = taker;
            const tradeStatus = this.safeString (entry, 'trade_status');
            const active = tradeStatus === 'tradable';
            const amountPrecision = this.safeString (entry, 'amount_precision');
            const pricePrecision = this.safeString (entry, 'precision');
            const amountLimit = this.parsePrecision (amountPrecision);
            const priceLimit = this.parsePrecision (pricePrecision);
            const limits = {
                'amount': {
                    'min': this.parseNumber (amountLimit),
                    'max': undefined,
                },
                'price': {
                    'min': this.parseNumber (priceLimit),
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (entry, 'min_quote_amount'),
                    'max': undefined,
                },
            };
            const precision = {
                'amount': parseInt (amountPrecision),
                'price': parseInt (pricePrecision),
            };
            result.push ({
                'info': entry,
                'id': id,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'symbol': symbol,
                'limits': limits,
                'precision': precision,
                'active': active,
                'maker': maker,
                'taker': taker,
            });
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
                'precision': {
                    'amount': amountPrecision,
                    'price': undefined,
                },
                'info': entry,
                'active': active,
                'fee': undefined,
                'fees': [],
                'limits': this.limits,
            };
        }
        return result;
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
        if (addressField.indexOf (' ') > -1) {
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
        const request = {
            'currency_pair': market['id'],
        };
        const response = await this.publicSpotGetTickers (this.extend (request, params));
        const ticker = this.safeValue (response, 0);
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
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
        const marketId = this.safeString (ticker, 'currency_pair');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeNumber (ticker, 'last');
        const ask = this.safeNumber (ticker, 'lowest_ask');
        const bid = this.safeNumber (ticker, 'highest_bid');
        const high = this.safeNumber (ticker, 'high_24h');
        const low = this.safeNumber (ticker, 'low_24h');
        const baseVolume = this.safeNumber (ticker, 'base_volume');
        const quoteVolume = this.safeNumber (ticker, 'quote_volume');
        const percentage = this.safeNumber (ticker, 'change_percentage');
        return {
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
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicSpotGetTickers (params);
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
        const request = {
            'currency_pair': market['id'],
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
        const response = await this.publicSpotGetCandlesticks (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //       "1626163200",           // Unix timestamp in seconds
        //       "346711.933138181617",  // Trading volume
        //       "33165.23",             // Close price
        //       "33260",                // Highest price
        //       "33117.6",              // Lowest price
        //       "33184.47"              // Open price
        //     ]
        //
        const timestamp = this.safeTimestamp (ohlcv, 0);
        const volume = this.safeNumber (ohlcv, 1);
        const close = this.safeNumber (ohlcv, 2);
        const high = this.safeNumber (ohlcv, 3);
        const low = this.safeNumber (ohlcv, 4);
        const open = this.safeNumber (ohlcv, 5);
        return [
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        ];
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
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
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
        }
        const response = await this.privateWalletGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response, currency);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
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
            const message = this.safeString (response, 'message');
            const Error = this.safeValue (this.exceptions, label, ExchangeError);
            throw new Error (this.id + ' ' + message);
        }
    }
};
