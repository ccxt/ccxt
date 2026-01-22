//  ---------------------------------------------------------------------------

import Exchange from './abstract/max.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, OrderNotFound, PermissionDenied } from './base/errors.js';
import type { Currencies, Currency, DepositAddress, Dict, int, Int, MarginMode, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Tickers, Trade, TradingFees, Transaction, BorrowInterest } from './base/types.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';

//  ---------------------------------------------------------------------------

/**
 * @class max
 * @augments Exchange
 */
export default class max extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'max',
            'name': 'Max',
            'countries': [ 'TW' ],
            // 1200 requests per 1 minutes = 1200 / 60 = 20 requests per second => 1000ms / 20 = 50ms between requests on average
            'rateLimit': 50,
            'certified': false,
            'urls': {
                'logo': 'https://max.maicoin.com/max-ccxt-logo.png',
                'api': {
                    'public': 'https://max-api.maicoin.com',
                    'private': 'https://max-api.maicoin.com',
                },
                'www': 'https://max.maicoin.com',
                'doc': 'https://max.maicoin.com/documents/api_list/v3',
                'fees': 'https://max.maicoin.com/docs/fees',
            },
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': true,
                'createLimitBuyOrder': true,
                'createLimitOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketOrder': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': true,
                'fetchBorrowRates': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': 'emulated',
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarginMode': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': 'emulated',
                'fetchTransactions': 'emulated',
                'fetchWithdrawals': true,
                'marginMode': 'cross',
                'privateAPI': true,
                'publicAPI': true,
                'transfer': true,
                'withdraw': true,
            },
            'api': {
                'public': {
                    'get': [
                        'k',
                        'markets',
                        'currencies',
                        'timestamp',
                        'depth',
                        'ticker',
                        'tickers',
                        'wallet/m/interest_rates',
                    ],
                },
                'private': {
                    'get': [
                        'wallet/{walletType}/accounts',
                        'wallet/{walletType}/orders/open',
                        'wallet/{walletType}/orders/closed',
                        'wallet/{walletType}/orders/history',
                        'wallet/{walletType}/trades',
                        'wallet/m/interests',
                        'order',
                        'info',
                        'withdrawals',
                        'deposits',
                        'withdraw_addresses',
                        'deposit_address',
                        'order/trades',
                    ],
                    'post': [
                        'wallet/{walletType}/order',
                        'orders',
                        'withdrawal',
                        'withdrawal/twd',
                    ],
                    'delete': [
                        'order',
                        'wallet/spot/orders',
                        'wallet/{walletType}/orders',
                    ],
                },
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0005'),
                    'taker': this.parseNumber ('0.0015'),
                    'tiers': {
                        // https://max-vip-en.maicoin.com/
                        'taker': [
                            // volume in TWD
                            [ this.parseNumber ('0'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('3000000'), this.parseNumber ('0.00135') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.00105') ],
                            [ this.parseNumber ('150000000'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('600000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('1000000000'), this.parseNumber ('0.00055') ],
                            [ this.parseNumber ('1500000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('2000000000'), this.parseNumber ('0.00045') ],
                        ],
                        'maker': [
                            // volume in TWD
                            [ this.parseNumber ('0'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('3000000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.00035') ],
                            [ this.parseNumber ('150000000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.00025') ],
                            [ this.parseNumber ('600000000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('1000000000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('1500000000'), this.parseNumber ('0.0000') ],
                            [ this.parseNumber ('2000000000'), this.parseNumber ('0.0000') ],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'commonCurrencies': {},
            'options': {
                'timeDifference': 0, // the difference between system clock and Max clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'networks': {
                    'BTC': 'bitcoin',         // Bitcoin
                    'ERC20': 'ethereum',         // Ethereum
                    'LTC': 'litecoin',         // Litecoin
                    'BCH': 'bitcoincash',         // Bitcoin Cash
                    'TRC20': 'tron', // TRON tokens
                    'EOS': 'eosio', // Not in manual
                    'XRP': 'ripple',         // Ripple
                    'DOGE': 'dogecoin',       // Dogecoin
                    'ADA': 'cardano',         // Cardano
                    'DOT': 'polkadot',         // Polkadot
                    'FIL': 'filecoin', // Filecoin
                    'XLM': 'stellar', // Stellar
                    'SOL': 'solana',         // Solana native
                    'MATIC': 'polygon', // Polygon/Matic network
                    'XTZ': 'tezos',          // Tezos
                    'BEP20': 'bsc',   // BSC tokens
                    'ETC': 'ethereumclassic',
                    'ALGO': 'algorand',  // Algorand
                    'ARBITRUM': 'arbitrum', // Arbitrum tokens
                    'TON': 'toncoin', // Not in manual
                    'AVAX': 'Avalanche',       // Avalanche C-Chain
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true, // support spot/margin
                        'triggerPrice': true, // support stop orders
                        'triggerDirection': false,
                        'triggerPriceType': {
                            'last': true, // only last price supported
                            'mark': false,
                            'index': false,
                        },
                        'stopLossPrice': true, // via stop orders
                        'takeProfitPrice': true, // via stop orders
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true, // ioc_limit
                            'FOK': false,
                            'PO': true,  // post_only
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false, // not required for market orders
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': true,
                        'limit': 1000, // docs: 1-1000, default 50
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': true, // market parameter required
                    },
                    'fetchOrder': {
                        'marginMode': true,
                        'trigger': true, // can fetch stop orders
                        'trailing': false,
                        'symbolRequired': false, // can query by id or client_oid
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'trigger': true, // includes stop orders
                        'trailing': false,
                        'symbolRequired': false, // market parameter optional
                    },
                    'fetchOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': true, // includes stop orders
                        'trailing': false,
                        'symbolRequired': true, // market parameter required
                    },
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': true, // includes stop orders
                        'trailing': false,
                        'symbolRequired': false, // market parameter optional
                    },
                    'fetchOHLCV': {
                        'limit': 10000, // docs: 1-10000, default 30
                    },
                },
                'margin': {
                    'mode': 'isolated', // only isolated margin
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
            'exceptions': {
                'exact': {
                    '1001': ArgumentsRequired,    // INVALID_PARAMETER_ERROR
                    '2001': AuthenticationError,  // AUTHORIZATION_ERROR
                    '2002': InvalidOrder,         // CREATE_ORDER_ERROR
                    '2003': InvalidOrder,         // CANCEL_ORDER_ERROR
                    '2004': OrderNotFound,        // ORDER_NOT_FOUND_ERROR
                    '2005': AuthenticationError,  // INCORRECT_SIGNATURE_ERROR
                    '2006': InvalidNonce,  // NONCE_USED_ERROR
                    '2007': InvalidNonce,  // INVALID_NONCE_ERROR
                    '2008': AuthenticationError,  // INVALID_ACCESS_KEY_ERROR
                    '2010': AuthenticationError,  // EXPIRED_ACCESS_KEY_ERROR
                    '2011': PermissionDenied,    // OUT_OF_SCOPE_ERROR
                    '2012': ExchangeError,       // DEPOSIT_BY_TXID_NOT_FOUND_ERROR
                    '2013': ExchangeError,       // DEPOSIT_BY_SN_NOT_FOUND_ERROR
                    '2014': AuthenticationError,  // INCORRECT_PAYLOAD_ERROR
                    '2016': InvalidOrder,        // AMOUNT_TOO_SMALL_ERROR
                    '2017': AuthenticationError,  // ACCESS_DENIED_ERROR
                    '2018': InsufficientFunds,   // ACCOUNT_FUNDS_ERROR
                    '2019': InvalidOrder,        // INSUFFICIENT_MARKET_DEPTH_ERROR
                    '2020': InvalidOrder,        // VOLUME_TOO_LARGE_ERROR
                    '2021': ArgumentsRequired,   // VOLUME_OUT_OF_RANGE_ERROR
                    '2022': InvalidOrder,        // HAS_OUTSTANDING_ORDER_ERROR
                    '2023': InvalidOrder,        // CANCELLED_TOO_FREQUENTLY_ERROR
                    '2024': InvalidOrder,        // PRICE_CHANGED_ERROR
                    '2025': InsufficientFunds,   // QUOTA_NOT_ENOUGH_ERROR
                    '2027': ExchangeError,       // CANCEL_WITHDRAW_ERROR
                    '2029': PermissionDenied,    // FEATURE_NOT_ENABLED_ERROR
                    '2034': InvalidOrder,        // TOO_MUCH_ORDERS_ERROR
                    '2035': ExchangeError,       // EMPTY_TRANSACTION_HISTORY_ERROR
                    '2036': ExchangeError,       // DUPLICATED_RESOURCE_ERROR
                    '2039': ArgumentsRequired,   // URL_INVALID_ERROR
                    '2060': PermissionDenied,    // MEMBER_LOCKED_ERROR
                    '2061': PermissionDenied,    // MEMBER_DISABLED_ERROR
                    '2062': PermissionDenied,    // MEMBER_DELETED_ERROR
                    '2064': PermissionDenied,    // MEMBER_SPEND_DISABLED_ERROR
                    '2065': PermissionDenied,    // MERCHANT_AGENT_FEATURE_SUSPEND_ERROR
                    '2066': ExchangeError,       // API_NOT_READY
                    '2100': InsufficientFunds,   // FUNDS_LIMIT_EXCEEDED_ERROR
                    '2101': InsufficientFunds,   // DAILY_OUTBOUND_QUOTA_NOT_ENOUGH_ERROR
                    '2102': InsufficientFunds,   // MONTHLY_OUTBOUND_QUOTA_NOT_ENOUGH_ERROR
                    '2103': InsufficientFunds,   // DAILY_INBOUND_QUOTA_NOT_ENOUGH_ERROR
                    '2104': InsufficientFunds,   // MONTHLY_INBOUND_QUOTA_NOT_ENOUGH_ERROR
                    '3001': ExchangeError,       // MEMBER_NOT_FOUND_ERROR
                    '3002': ExchangeError,       // CREATE_MEMBER_ERROR
                    '3101': ExchangeError,       // UPLOAD_DOCUMENT_ERROR
                    '3201': ExchangeError,       // CAMPAIGN_JOIN_ERROR
                    '3301': ExchangeError,       // STRATEGY_FEATURE_DISABLED_ERROR
                    '4000': ExchangeError,       // RESOURCE_NOT_FOUND_ERROR
                    '4001': ArgumentsRequired,   // BAD_REQUEST_ERROR
                    '4002': ExchangeError,       // CREATION_ERROR
                    '4003': AuthenticationError,  // TWO_FACTOR_ERROR
                    '4004': ArgumentsRequired,   // INVALID_TIME_RANGE_ERROR
                    '4005': AuthenticationError,  // TWO_FACTOR_TYPE_ERROR
                    '4006': AuthenticationError,  // TWO_FACTOR_NOT_ACTIVATED_ERROR
                    '4007': AuthenticationError,  // APP_TWO_FACTOR_SET_ALREADY_ERROR
                    '4008': AuthenticationError,  // WITHOUT_MULTIPLE_FACTORS
                    '4009': PermissionDenied,    // IP_WHITELIST_NOT_SET_ERROR
                    '4010': PermissionDenied,    // REQUEST_WAS_REJECTED
                    '4011': PermissionDenied,    // REQUEST_WAS_UNDER_REVIEW
                    '4013': AuthenticationError,  // EMAIL_TWO_FACTOR_NOT_ACTIVATED_ERROR
                    '4015': AuthenticationError,  // TWO_FACTOR_NOT_USING_ERROR
                    '5004': AuthenticationError,  // INVALID_IP_ERROR
                    '5008': ExchangeError,       // CREATE_IDENTITY_ERROR
                    '5010': AuthenticationError,  // INVALID_DEVICE
                    '5011': InvalidOrder,        // MARKET_PRICE_UNAVAILABLE_ERROR
                    '5015': ExchangeError,       // INVALID_STATE_ERROR
                    '5016': ExchangeError,       // INVALID_ABILITY_ERROR
                    '5999': ExchangeNotAvailable, // SERVER_ERROR
                },
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name max#fetchMarkets
     * @description retrieves data on all markets for max
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const response = await this.publicGetMarkets (params);
        // [{
        //     "id": "btctwd",
        //     "status": "active",
        //     "base_unit": "btc",
        //     "base_unit_precision": 5,
        //     "min_base_amount": 0.0015,
        //     "quote_unit": "twd",
        //     "quote_unit_precision": 1,
        //     "min_quote_amount": 26.0,
        //     "m_wallet_supported": false
        // }]
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'id');
        const baseId = this.safeString (market, 'base_unit');
        const quoteId = this.safeString (market, 'quote_unit');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const status = this.safeString (market, 'status');
        let active = false;
        if (status === 'active') {
            active = true;
        } else if (status === 'cancel-only') {
            active = false;
        } else if (status === 'suspended') {
            active = false;
        }
        const baseUnitPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'base_unit_precision')));
        const quoteUnitPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'quote_unit_precision')));
        return {
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
            'margin': this.safeValue (market, 'm_wallet_supported', false),
            'swap': false, // Note: convert
            'future': false,
            'option': false,
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': baseUnitPrecision,
                'price': quoteUnitPrecision,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'min_base_amount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_quote_amount'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    /**
     * @method
     * @name max#fetchTime
     * @description Fetches the current system time from the exchange server
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Timestamp
     * @param {object} [params] Extra parameters specific to the max API endpoint
     * @returns {int} Current server time in milliseconds since Unix Epoch
     */
    async fetchTime (params = {}) {
        const response = await this.publicGetTimestamp ();
        // {
        //     "timestamp": 1728011557
        // }
        return this.safeTimestamp (response, 'timestamp');
    }

    /**
     * @method
     * @name max#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Wallet/operation/getApiV3WalletPathWalletTypeAccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.marginMode] 'isolated' for isolated margin trading, default is undefined for spot trading
     * @param {string|undefined} [params.currency] Filter response to show only specific currency balance
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let isMargin = false;
        [ isMargin, params ] = this.checkMarginRequest ('fetchBalance', params);
        const request: Dict = {
            'walletType': isMargin ? 'm' : 'spot',
        };
        let currencyId;
        [ currencyId, params ] = this.handleParamString (params, 'currency');
        if (currencyId !== undefined) {
            request['currency'] = this.safeCurrencyCode (currencyId);
        }
        const response = await this.privateGetWalletWalletTypeAccounts (this.extend (request, params));
        return this.parseBalance (response);
    }

    parseBalance (response) {
        // [
        //     {
        //         "currency": "twd",
        //         "balance": "558023980.20030641",
        //         "locked": "6469092.0",
        //         "staked": null
        //     },
        //     {
        //         "currency": "btc",
        //         "balance": "4739.24964425",
        //         "locked": "0.01003",
        //         "staked": null
        //     },
        //     {
        //         "currency": "eth",
        //         "balance": "7114.84243169",
        //         "locked": "0.4023",
        //         "staked": "110.05"
        //     }
        // ]
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance', '0.0');
            const locked = this.safeString (balance, 'locked', '0.0');
            const staked = '0.0';
            const usedNumber = this.parseNumber (locked) + this.parseNumber (staked);
            account['used'] = this.numberToString (usedNumber);
            const totalNumber = this.parseNumber (account['free']) + usedNumber;
            account['total'] = this.numberToString (totalNumber);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    networkProtocolToCode (network_protocol: string, code: string): string {
        let networkName = network_protocol.split (' ')[0];
        networkName = networkName.split ('-')[0];
        return this.networkIdToCode (networkName, code);
    }

    validateTimestamp (methodName: string, timestamp: Int) {
        if (timestamp < 1512950400000 || timestamp > 4102444800000) {
            throw new BadRequest (this.id + ' ' + methodName + '() timestamp must be between 1512950400000 (Dec 2017) and 4102444800000 (Dec 2099)');
        }
    }

    /**
     * @method
     * @name max#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetCurrencies (params);
        // [
        //     {
        //         "currency": "twd",
        //         "type": "fiat",
        //         "precision": 0,
        //         "m_wallet_supported": true,
        //         "m_wallet_mortgageable": true,
        //         "m_wallet_borrowable": false,
        //         "min_borrow_amount": "",
        //         "networks": [
        //             {
        //                 "token_contract_address": null,
        //                 "precision": 0,
        //                 "id": "twd",
        //                 "network_protocol": "fiat",
        //                 "deposit_confirmations": 0,
        //                 "withdrawal_fee": 15,
        //                 "min_withdrawal_amount": 100,
        //                 "withdrawal_enabled": true,
        //                 "deposit_enabled": true,
        //                 "need_memo": false
        //             }
        //         ],
        //         "staking": null
        //     },
        //     {
        //         "currency": "btc",
        //         "type": "crypto",
        //         "precision": 8,
        //         "m_wallet_supported": true,
        //         "m_wallet_mortgageable": true,
        //         "m_wallet_borrowable": true,
        //         "min_borrow_amount": "0.001",
        //         "networks": [
        //             {
        //                 "token_contract_address": null,
        //                 "precision": 8,
        //                 "id": "btc",
        //                 "network_protocol": "bitcoin",
        //                 "deposit_confirmations": 3,
        //                 "withdrawal_fee": 0.000003,
        //                 "min_withdrawal_amount": 0.00014,
        //                 "withdrawal_enabled": true,
        //                 "deposit_enabled": true,
        //                 "need_memo": false
        //             },
        //             {
        //                 "token_contract_address": "0x1234567890123456789012345678901234567890",
        //                 "precision": 8,
        //                 "id": "bscbtc",
        //                 "network_protocol": "bsc-bep20",
        //                 "deposit_confirmations": 15,
        //                 "withdrawal_fee": 1e-7,
        //                 "min_withdrawal_amount": 0.00014,
        //                 "withdrawal_enabled": true,
        //                 "deposit_enabled": true,
        //                 "need_memo": false
        //             }
        //         ],
        //         "staking": null
        //     }
        // ]
        const markets = await this.fetchMarkets ();
        const currencyMinAmounts = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            // const market = this.markets[symbol];
            const baseMinAmount = this.safeNumber (market['limits']['amount'], 'min');
            if (baseMinAmount !== undefined) {
                const baseCurrency = market['base'];
                if (!(baseCurrency in currencyMinAmounts) || baseMinAmount < currencyMinAmounts[baseCurrency]) {
                    currencyMinAmounts[baseCurrency] = baseMinAmount;
                }
            }
        }
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const type = this.safeString (currency, 'type');
            const networks = this.safeValue (currency, 'networks', []);
            const mWalletSupported = this.safeValue (currency, 'm_wallet_supported', false);
            const mWalletMortgageable = this.safeValue (currency, 'm_wallet_mortgageable', false);
            const mWalletBorrowable = this.safeValue (currency, 'm_wallet_borrowable', false);
            const precision = this.parseNumber (this.parsePrecision (this.safeString (currency, 'precision')));
            const minAmount = this.safeNumber (currencyMinAmounts, code);
            const fiat = (type === 'fiat');
            // Process networks info
            const networksObject = {};
            let deposit = false;
            let withdraw = false;
            let withdrawalFee = undefined;
            let withdrawalLimitMin = undefined;
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.safeString (network, 'id');
                const network_protocol = this.safeString (network, 'network_protocol');
                const networkCode = this.networkProtocolToCode (network_protocol, code);
                const depositEnabled = this.safeValue (network, 'deposit_enabled');
                if (depositEnabled) {
                    deposit = true;
                }
                const withdrawalEnabled = this.safeValue (network, 'withdrawal_enabled');
                if (withdrawalEnabled) {
                    withdraw = true;
                }
                // Use the first available network's withdrawal constraints
                if (j === 0) {
                    withdrawalFee = this.safeNumber (network, 'withdrawal_fee');
                    withdrawalLimitMin = this.safeNumber (network, 'min_withdrawal_amount');
                }
                networksObject[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'name': network_protocol,
                    'active': depositEnabled && withdrawalEnabled,
                    'deposit': depositEnabled,
                    'withdraw': withdrawalEnabled,
                    'fee': this.safeNumber (network, 'withdrawal_fee'),
                    'precision': this.parseNumber (this.parsePrecision (this.safeString (network, 'precision'))),
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (network, 'min_withdrawal_amount'),
                            'max': undefined,
                        },
                    },
                    'info': network,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'code': code,
                'info': currency,
                'type': type,
                'name': undefined,
                'active': true,
                'deposit': deposit,
                'withdraw': withdraw,
                'fiat': fiat,
                'fee': withdrawalFee, // Use the first network's fee as default
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': withdrawalLimitMin,
                        'max': undefined,
                    },
                },
                'funding': {
                    'withdraw': {
                        'fee': withdrawalFee,
                    },
                    'deposit': {
                        'fee': undefined,
                    },
                },
                'networks': networksObject,
                'mWallet': {
                    'supported': mWalletSupported,
                    'mortgageable': mWalletMortgageable,
                    'borrowable': mWalletBorrowable,
                    'minBorrowAmount': this.safeNumber (currency, 'min_borrow_amount', 0),
                },
            });
        }
        return result;
    }

    /**
     * @method
     * @name max#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (1-300, default 300)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean|undefined} params.sort_by_price sorting by price or by ticker position
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'sort_by_price': true,
        };
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchOrderBook', limit, 1, 300);
        } else {
            request['limit'] = 5;
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        // {
        //     "timestamp": 1728011558,
        //     "last_update_version": 1727932531262,
        //     "last_update_id": 208377,
        //     "asks": [
        //         [
        //             "1984599.0",
        //             "0.96152476"
        //         ],
        //         [
        //             "1983853.2",
        //             "0.00105423"
        //         ],
        //         [
        //             "1982522.8",
        //             "0.00103316"
        //         ],
        //         [
        //             "1981634.3",
        //             "0.00103123"
        //         ],
        //         [
        //             "1978895.0",
        //             "0.0010032"
        //         ],
        //         [
        //             "1976692.2",
        //             "0.60705554"
        //         ],
        //         [
        //             "1968817.0",
        //             "0.88956106"
        //         ],
        //         [
        //             "1966666.6",
        //             "0.00032384"
        //         ],
        //         [
        //             "1966084.8",
        //             "0.001029"
        //         ],
        //         [
        //             "1965418.4",
        //             "0.00097219"
        //         ]
        //     ],
        //     "bids": [
        //         [
        //             "1952078.0",
        //             "0.02049401"
        //         ],
        //         [
        //             "1944269.7",
        //             "0.49105105"
        //         ],
        //         [
        //             "1936492.6",
        //             "0.71958076"
        //         ],
        //         [
        //             "1933208.8",
        //             "0.00098696"
        //         ],
        //         [
        //             "1932986.7",
        //             "0.00104025"
        //         ],
        //         [
        //             "1924590.2",
        //             "0.00096212"
        //         ],
        //         [
        //             "1922222.2",
        //             "0.00037706"
        //         ],
        //         [
        //             "1916770.9",
        //             "0.00199819"
        //         ],
        //         [
        //             "1912603.2",
        //             "0.00675983"
        //         ],
        //         [
        //             "1908657.0",
        //             "0.00113063"
        //         ]
        //     ]
        // }
        const timestamp = this.safeTimestamp (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 0, 1);
        return orderbook;
    }

    /**
     * @method
     * @name max#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "market": "btctwd",
        //     "at": 1728011558,
        //     "buy": "1952078.0",
        //     "buy_vol": "0.02049401",
        //     "sell": "1965418.4",
        //     "sell_vol": "0.00097219",
        //     "open": "1966666.6",
        //     "low": "1944444.4",
        //     "high": "1970531.2",
        //     "last": "1944444.4",
        //     "vol": "0.00310063",
        //     "vol_in_btc": "0.00310063"
        // }
        const timestamp = this.safeTimestamp (ticker, 'at');
        market = this.safeMarket (undefined, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': this.safeString (ticker, 'buy_vol'),
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': this.safeString (ticker, 'sell_vol'),
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

    /**
     * @method
     * @name max#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        // convert symbols to marketIds
        const marketIds = [];
        if (symbols === undefined) {
            // if no symbols provided, get all active non-darkpool markets
            for (let i = 0; i < this.symbols.length; i++) {
                const symbol = this.symbols[i];
                const market = this.market (symbol);
                if (market['active']) {
                    marketIds.push (market['id']);
                }
            }
        } else {
            // if symbols provided, get the specified markets
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market (symbol);
                marketIds.push (market['id']);
            }
        }
        const request: Dict = {
            'markets': marketIds,
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        //
        //  [
        //         {
        //             "market": "btctwd",
        //             "at": 1728011558,
        //             "buy": "1952078.0",
        //             "buy_vol": "0.02049401",
        //             "sell": "1965418.4",
        //             "sell_vol": "0.00097219",
        //             "open": "1966666.6",
        //             "low": "1944444.4",
        //             "high": "1970531.2",
        //             "last": "1944444.4",
        //             "vol": "0.00310063",
        //             "vol_in_btc": "0.00310063"
        //         }
        //         ]
        //
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = response[i];
            const marketId = this.safeString (ticker, 'market');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    /**
     * @method
     * @name max#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3K
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int|undefined} [since] timestamp in ms of the earliest candle to fetch
     * @param {int|undefined} [limit] the maximum amount of candles to fetch (1-10000, default 30)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchOHLCV', limit, 1, 10000);
        }
        if (since !== undefined) {
            // Convert milliseconds to seconds for API
            const sinceSeconds = this.parseToInt (since / 1000);
            // Validate timestamp
            if (sinceSeconds < 1512950400 || sinceSeconds > 4102444800) {
                throw new BadRequest (this.id + ' fetchOHLCV() timestamp must be between Dec 2017 and Dec 2099');
            }
            request['timestamp'] = sinceSeconds;
        }
        const response = await this.publicGetK (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined) : OHLCV {
        if (Array.isArray (ohlcv)) {
            return [
                this.safeTimestamp (ohlcv, 0), // timestamp
                this.safeNumber (ohlcv, 1), // open
                this.safeNumber (ohlcv, 2), // high
                this.safeNumber (ohlcv, 3), // low
                this.safeNumber (ohlcv, 4), // close
                this.safeNumber (ohlcv, 5), // volume
            ];
        }
        return ohlcv;
    }

    /**
     * @method
     * @name max#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Order/operation/getApiV3WalletPathWalletTypeOrdersOpen
     * @param {string|undefined} symbol unified market symbol
     * @param {int|undefined} [since] the earliest time in ms to fetch open orders for
     * @param {int|undefined} [limit] the maximum number of open orders structures to retrieve (1-1000, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.marginMode] 'isolated' for isolated margin trading, default is undefined for spot trading
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        // margin part
        let isMargin = false;
        [ isMargin, params ] = this.checkMarginRequest ('fetchOpenOrders', params);
        const request: Dict = {
            'walletType': isMargin ? 'm' : 'spot',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchOpenOrders', limit, 1, 1000);
        }
        if (since !== undefined) {
            this.validateTimestamp ('fetchOpenOrders', since);
            request['timestamp'] = since;
        }
        const response = await this.privateGetWalletWalletTypeOrdersOpen (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name max#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Order/operation/getApiV3Order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.client_oid] client-assigned order ID. Can be used instead of exchange order ID
     * @param {string|undefined} [params.clientOrderId] Alias for client_oid parameter
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires an id argument');
        }
        await this.loadMarkets ();
        const request = {};
        if (id !== undefined) {
            request['id'] = id;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let clientOrderId;
        [ clientOrderId, params ] = this.handleParamString2 (params, 'client_oid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_oid'] = clientOrderId;
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name max#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Order/operation/getApiV3WalletPathWalletTypeOrdersHistory
     * @param {string|undefined} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} [since] not used by max fetchOrders
     * @param {int|undefined} [limit] the maximum number of order structures to retrieve (1-1000, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' for isolated margin trading, default is undefined for spot trading
     * @param {int|undefined} [params.fromId] fetch orders from order id (this is the more efficient way to fetch orders in MAX)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        let isMargin = false;
        [ isMargin, params ] = this.checkMarginRequest ('fetchOrders', params);
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'walletType': isMargin ? 'm' : 'spot',
        };
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchOrders', limit);
        }
        let fromId = undefined;
        [ fromId, params ] = this.handleParamInteger (params, 'fromId');
        if (fromId !== undefined) {
            request['from_id'] = fromId;
        }
        const response = await this.privateGetWalletWalletTypeOrdersHistory (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name max#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Order/operation/getApiV3WalletPathWalletTypeOrdersClosed
     * @param {string|undefined} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} [since] the earliest time in ms to fetch orders for
     * @param {int|undefined} [limit] the maximum number of closed orders structures to retrieve (1-1000, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.marginMode] 'isolated' for isolated margin trading, default is undefined for spot trading
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        // margin part
        let isMargin = false;
        [ isMargin, params ] = this.checkMarginRequest ('fetchClosedOrders', params);
        const request = {
            'walletType': isMargin ? 'm' : 'spot',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchClosedOrders', limit);
        }
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        const response = await this.privateGetWalletWalletTypeOrdersClosed (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    parseOrderType (orderType: string): string {
        const orderTypes = {
            'market': 'market',
            'limit': 'limit',
            'stop_limit': 'limit',
            'stop_market': 'market',
            'post_only': 'limit',
            'ioc_limit': 'limit',
        };
        return this.safeString (orderTypes, orderType, orderType);
    }

    parseOrderTimeInForce (orderType: string): string {
        const timeInForces = {
            'post_only': 'PO',
            'ioc_limit': 'IOC',
        };
        return this.safeString (timeInForces, orderType);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "id": 1234567890,
        //     "wallet_type": "spot",
        //     "market": "btctwd",
        //     "client_oid": null,
        //     "group_id": null,
        //     "side": "buy",
        //     "state": "cancel",
        //     "ord_type": "limit",
        //     "price": "30000.0",
        //     "stop_price": null,
        //     "avg_price": "0.0",
        //     "volume": "0.01",
        //     "remaining_volume": "0.01",
        //     "executed_volume": "0.0",
        //     "trades_count": 0,
        //     "created_at": 1728011504040,
        //     "updated_at": 1728011504663
        // }
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (order, 'created_at');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'volume');
        const filled = this.safeString (order, 'executed_volume');
        const remaining = this.safeString (order, 'remaining_volume');
        const average = this.safeString (order, 'avg_price');
        const rawType = this.safeString (order, 'ord_type');
        const type = this.parseOrderType (rawType);
        const side = this.safeString (order, 'side');
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'client_oid');
        const timeInForce = this.parseOrderTimeInForce (rawType);
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'updated_at'),
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': (type === 'post_only'),
            'side': side,
            'price': price,
            'stopPrice': this.safeString (order, 'stop_price'),
            'average': average,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'wait': 'open',
            'done': 'closed',
            'cancel': 'canceled',
            'convert': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name max#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Trade/operation/getApiV3WalletPathWalletTypeTrades
     * @param {string|undefined} symbol unified market symbol
     * @param {int|undefined} [since] the earliest time in ms to fetch trades for, must be between 1512950400000 and 4102444800000
     * @param {int|undefined} [limit] the maximum number of trades structures to retrieve (1-1000, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.marginMode] 'isolated' for isolated margin trading, default is undefined for spot trading
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        // margin part
        let isMargin = false;
        [ isMargin, params ] = this.checkMarginRequest ('fetchMyTrades', params);
        const request = {
            'walletType': isMargin ? 'm' : 'spot',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchMyTrades', limit, 1, 1000);
        }
        if (since !== undefined) {
            // Validate timestamp range
            this.validateTimestamp ('fetchMyTrades', since);
            request['timestamp'] = since;
        }
        const response = await this.privateGetWalletWalletTypeTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // {
        //     "id": 12345621,
        //     "order_id": 123456789,
        //     "wallet_type": "spot",
        //     "price": "1954221.6",
        //     "volume": "0.001",
        //     "funds": "1954.2",
        //     "market": "btctwd",
        //     "market_name": "BTC/TWD",
        //     "side": "self-trade",
        //     "fee": "0.04098786",
        //     "fee_currency": "max",
        //     "fee_discounted": true,
        //     "self_trade_bid_fee": "0.13690886",
        //     "self_trade_bid_fee_currency": "max",
        //     "self_trade_bid_fee_discounted": true,
        //     "self_trade_bid_order_id": 2326112321,
        //     "liquidity": "maker",
        //     "created_at": 1724131182652
        // }
        const timestamp = this.safeInteger (trade, 'created_at');
        const marketId = this.safeString (trade, 'market');
        market = this.safeMarket (marketId, market);
        const side = this.safeString (trade, 'side');
        const liquidity = this.safeString (trade, 'liquidity');
        const takerOrMaker = (liquidity === 'taker') ? 'taker' : 'maker';
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'volume');
        const cost = this.safeString (trade, 'funds');
        const feeCurrency = this.safeString (trade, 'fee_currency');
        let fee = undefined;
        const feeCost = this.safeString (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
                'rate': undefined,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, market);
    }

    checkMarginRequest (methodName: string, params = {}): any {
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams (methodName, params);
        const isMargin = marginMode === 'isolated';
        if (marginMode !== undefined && marginMode !== 'isolated') {
            throw new BadRequest (this.id + ' only supports isolated margin mode');
        }
        return [ isMargin, params ];
    }

    /**
     * @method
     * @name max#createOrder
     * @description create a trade order
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Order/operation/postApiV3WalletPathWalletTypeOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'post_only', 'stop_market', 'stop_limit', 'ioc_limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float|undefined} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the max api endpoint
     * @param {string|undefined} [params.marginMode] 'isolated' for isolated margin trading, default is undefined for spot trading
     * @param {float|undefined} [params.stopPrice] the price at which a trigger order is triggered at
     * @param {string|undefined} [params.clientOrderId] client identifier, defaults to uuid if not passed
     * @param {int|undefined} [params.groupId] group identifier for orders
     * @param {boolean|undefined} [params.postOnly] if true, the order will be executed as a post-only order
     * @param {string|undefined} [params.timeInForce] 'IOC', or 'PO'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        // margin part
        let isMargin = false;
        [ isMargin, params ] = this.checkMarginRequest ('createOrder', params);
        // market
        const market = this.market (symbol);
        if (isMargin && !market['margin']) {
            throw new InvalidOrder (this.id + ' createOrder() margin does not support' + symbol);
        }
        const orderType = type;
        const validOrderTypes = {
            'limit': 'limit',
            'market': 'market',
        };
        const types = Object.keys (validOrderTypes);
        if (types.indexOf (orderType) === -1) {
            throw new InvalidOrder (this.id + ' createOrder() does not support order type ' + orderType + ', supported order types are: ' + types.join (', '));
        }
        const stopPrice = this.safeNumber2 (params, 'stop_price', 'stopPrice');
        const clientOrderId = this.safeString2 (params, 'client_oid', 'clientOrderId');
        const groupId = this.safeInteger2 (params, 'group_id', 'groupId');
        const timeInForce = this.safeString (params, 'timeInForce');
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (type === 'market', false, params);
        params = this.omit (params, [ 'stop_price', 'stopPrice', 'client_oid', 'clientOrderId', 'group_id', 'groupId', 'timeInForce' ]);
        let finalOrderType = validOrderTypes[orderType];
        if (timeInForce !== undefined) {
            if (orderType !== 'limit') {
                throw new InvalidOrder (this.id + ' createOrder() timeInForce is only valid for limit orders');
            }
            if (timeInForce === 'IOC') {
                finalOrderType = 'ioc_limit';
            } else if (timeInForce === 'PO') {
                finalOrderType = 'post_only';
            } else {
                throw new InvalidOrder (this.id + ' createOrder() does not support timeInForce ' + timeInForce + ', supported values are: IOC, PO');
            }
            // else if (timeInForce === 'GTC') {
            //     finalOrderType = 'limit';
            // }
        }
        // postOnly prior to timeInForce
        if (postOnly) {
            finalOrderType = 'post_only';
        } else if (stopPrice !== undefined) {
            finalOrderType = (orderType === 'market') ? 'stop_market' : 'stop_limit';
        }
        const request = {
            'market': market['id'],
            'volume': this.amountToPrecision (symbol, amount),
            'side': side,
            'ord_type': finalOrderType,
            'walletType': isMargin ? 'm' : 'spot',
        };
        if (clientOrderId !== undefined) {
            if (clientOrderId.length > 36) {
                throw new InvalidOrder (this.id + ' createOrder() client order id length must be less than or equal to 36');
            }
            request['client_oid'] = clientOrderId;
        }
        if (orderType !== 'market') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for ' + finalOrderType + ' orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        } else if (price !== undefined) {
            throw new InvalidOrder (this.id + ' createOrder() price argument is not supported for ' + finalOrderType + ' orders');
        }
        // handle stopPrice
        if (stopPrice !== undefined) {
            request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
        }
        // handle groupId
        if (groupId !== undefined) {
            if (groupId < 1 || groupId > 2147483647) {
                throw new InvalidOrder (this.id + ' createOrder() group_id must be between 1 and 2147483647');
            }
            request['group_id'] = groupId;
        }
        const response = await this.privatePostWalletWalletTypeOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name max#cancelOrder
     * @description cancels an open order
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Order/operation/deleteApiV3Order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} params.client_oid user specific order id. maximum length of client_oid must less or equal to 36. persistence, server will validate uniqueness within 24 hours only
     * @returns {object} a response object with a boolean indicating success - {success: true}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (id !== undefined) {
            request['id'] = id;
        }
        let clientOrderId;
        [ clientOrderId, params ] = this.handleParamString2 (params, 'client_oid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_oid'] = clientOrderId;
        }
        if ((id === undefined) && (clientOrderId === undefined)) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires either an id argument or client_oid param');
        }
        const response = await this.privateDeleteOrder (this.extend (request, params));
        return response;
    }

    /**
     * @method
     * @name max#cancelAllOrders
     * @description cancel all open orders
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Order/operation/deleteApiV3WalletPathWalletTypeOrders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.marginMode] 'isolated' for isolated margin trading, default is undefined for spot trading
     * @param {string|undefined} [params.side] "sell" or "buy"
     * @param {int|undefined} [params.group_id] group order id, ex. 123
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        // margin part
        let isMargin = false;
        [ isMargin, params ] = this.checkMarginRequest ('createOrder', params);
        const request = {
            'walletType': isMargin ? 'm' : 'spot',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if ('side' in params) {
            request['side'] = params['side'];
            params = this.omit (params, [ 'side' ]);
        }
        if ('group_id' in params) {
            request['group_id'] = params['group_id'];
            params = this.omit (params, [ 'group_id' ]);
        }
        const response = await this.privateDeleteWalletWalletTypeOrders (this.extend (request, params));
        return this.parseOrders (response);
    }

    /**
     * @method
     * @name max#fetchTradingLimits
     * @description fetch the trading limits for one or more markets
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Markets
     * @param {string[]|undefined} [symbols] unified market symbols, get trading limits for all markets if undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [market limits structures]{@link https://docs.ccxt.com/#/?id=market-limits-structure} indexed by market symbol
     */
    async fetchTradingLimits (symbols: Strings = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        const markets = await this.fetchMarkets ();
        const tradingLimits: Dict = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const symbol = market['symbol'];
            if ((symbols === undefined) || (this.inArray (symbol, symbols))) {
                tradingLimits[symbol] = market['limits']['amount'];
            }
        }
        return tradingLimits;
    }

    /**
     * @method
     * @name max#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://max.maicoin.com/documents/api_list/v3#tag/User/operation/getApiV3Info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.privateGetInfo (params);
        // {
        //     "email": "user@example.com",
        //     "level": 2,
        //     "m_wallet_enabled": true,
        //     "current_vip_level": {
        //         "level": 1,
        //         "minimum_trading_volume": 3000000,
        //         "minimum_staking_volume": 500,
        //         "maker_fee": 0.00036,
        //         "taker_fee": 0.00135
        //     },
        //     "next_vip_level": {
        //         "level": 2,
        //         "minimum_trading_volume": 10000000,
        //         "minimum_staking_volume": 3000,
        //         "maker_fee": 0.00028000000000000003,
        //         "taker_fee": 0.0012
        //     }
        // }
        const currentVipLevel = this.safeValue (response, 'current_vip_level', {});
        const nextVipLevel = this.safeValue (response, 'next_vip_level');
        const makerFee = this.safeNumber (currentVipLevel, 'maker_fee');
        const takerFee = this.safeNumber (currentVipLevel, 'taker_fee');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': {
                    'current': currentVipLevel,
                    'next': nextVipLevel,
                },
                'symbol': symbol,
                'maker': makerFee,
                'taker': takerFee,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    /**
     * @method
     * @name max#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Transaction/operation/getApiV3Withdrawals
     * @param {string|undefined} code unified currency code
     * @param {int|undefined} [since] the earliest time in ms to fetch withdrawals for
     * @param {int|undefined} [limit] the maximum number of withdrawals structures to retrieve (1-1000, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.state] Filter by withdrawal state ('processing', 'failed', 'canceled', 'done')
     * @param {int|undefined} [params.timestamp] Alternative to 'since' parameter, in milliseconds (1512950400000 to 4102444800000)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        // Validate state parameter
        const validStates = [ 'processing', 'failed', 'canceled', 'done' ];
        let state;
        [ state, params ] = this.handleParamString (params, 'state');
        if (state !== undefined) {
            if (validStates.indexOf (state) < 0) {
                throw new BadRequest (this.id + ' fetchWithdrawals() state parameter must be one of ' + validStates.join (', '));
            }
            request['state'] = state;
        }
        if (since !== undefined) {
            this.validateTimestamp ('fetchWithdrawals', since);
            request['timestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchWithdrawals', limit, 1, 1000);
        }
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        for (let i = 0; i < response.length; i++) {
            response[i]['type'] = 'withdrawal';
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        const states = {
            'withdrawal': {
                'processing': 'pending',
                'failed': 'failed',
                'canceled': 'canceled',
                'done': 'ok',
            },
            'deposit': {
                'processing': 'pending',
                'failed': 'failed',
                'canceled': 'canceled',
                'done': 'ok',
            },
        };
        const statuses = this.safeValue (states, type, {});
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits v3
        // {
        //     "uuid": "18022603540001",
        //     "currency": "usdt",
        //     "network_protocol": "tron-trc20",
        //     "amount": "0.019",
        //     "to_address": "0x5c7d23d516f120d322fc7b116386b7e491739138",
        //     "txid": "0x8daa98e07886985bd6a142cd81b83582d6085f7eb931dc4984c18c84f2a845e0",
        //     "confirmations": 64,
        //     "state": "processing",
        //     "created_at": 1521726960357,
        //     "state_reason": "",
        // }
        //
        // fetchWithdrawals v3
        // {
        //     "uuid": "18022603540001",
        //     "currency": "usdt",
        //     "network_protocol": "tron-trc20",
        //     "amount": "0.019",
        //     "fee": "0.0",
        //     "fee_currency": "usdt",
        //     "to_address": "TU91BoeyrqW9MKaiRPDiE6z7UecK2n2Hze",
        //     "label": "My Web3 Wallet",
        //     "txid": "957e1f1a1ba878ed0feebb2dd8a0cdbd9ed59ff501238fae199d8713f19c06f2",
        //     "created_at": 1521726960357,
        //     "state": "processing",
        //     "transaction_type": "external"
        // }
        //
        const txid = this.safeString (transaction, 'txid');
        const id = this.safeString (transaction, 'uuid', txid);
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'created_at');
        const amount = this.safeNumber (transaction, 'amount');
        const address = this.safeString (transaction, 'to_address');
        const tag = this.safeString (transaction, 'label');
        let feeCurrencyId = this.safeString (transaction, 'fee_currency');
        let feeCurrency = undefined;
        if (feeCurrencyId !== undefined) {
            if (feeCurrencyId in this.currencies_by_id) {
                feeCurrency = this.currencies_by_id[feeCurrencyId];
            }
            if (feeCurrency !== undefined) {
                feeCurrencyId = feeCurrency['code'];
            } else {
                feeCurrencyId = this.safeCurrencyCode (feeCurrencyId);
            }
        }
        const fee = {
            'cost': this.safeNumber (transaction, 'fee'),
            'currency': feeCurrencyId,
        };
        const type = this.safeString (transaction, 'type');
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'state'), type);
        const network = this.safeString (transaction, 'network_protocol');
        const result = {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': (this.safeString (transaction, 'transaction_type') === 'internal'),
            'fee': fee,
            'comment': undefined,
        };
        if (type === 'deposit') {
            result['confirmations'] = this.safeInteger (transaction, 'confirmations');
            result['comment'] = this.safeString (transaction, 'state_reason');
        }
        return result;
    }

    /**
     * @method
     * @name max#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Transaction/operation/getApiV3Deposits
     * @param {string|undefined} code unified currency code
     * @param {int|undefined} [since] the earliest time in ms to fetch deposits for
     * @param {int|undefined} [limit] the maximum number of deposits structures to retrieve (1-1000, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.limit] Default: 50, returned limit (1~1000, default 50)
     * @param {int|undefined} [params.timestamp] Alternative to 'since' parameter, in milliseconds (1512950400000 to 4102444800000)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            this.validateTimestamp ('fetchDeposits', since);
            request['timestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchDeposits', limit, 1, 1000);
        }
        const response = await this.privateGetDeposits (this.extend (request, params));
        // Add deposit type for consistency
        for (let i = 0; i < response.length; i++) {
            response[i]['type'] = 'deposit';
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    /**
     * @method
     * @name max#withdraw
     * @description make a withdrawal
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Transaction/operation/postApiV3Withdrawal
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Transaction/operation/postApiV3WithdrawalTwd
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        let method = '';
        const request = {
            'amount': this.currencyToPrecision (code, amount),
        };
        if (currency['id'] === 'twd') {
            method = 'privatePostWithdrawalTwd';
        } else {
            // Crypto withdrawal
            this.checkAddress (address);
            method = 'privatePostWithdrawal';
            const withdrawAddresses = await this.privateGetWithdrawAddresses ({
                'currency': currency['id'],
            });
            let foundAddress = undefined;
            for (let i = 0; i < withdrawAddresses.length; i++) {
                const withdrawAddress = withdrawAddresses[i];
                if (withdrawAddress['address'] === address) {
                    if (tag !== undefined) {
                        if (withdrawAddress['label'] === tag) {
                            foundAddress = withdrawAddress;
                            break;
                        }
                    } else {
                        foundAddress = withdrawAddress;
                        break;
                    }
                }
            }
            if (foundAddress === undefined) {
                throw new ArgumentsRequired (this.id + ' withdraw() could not find a withdrawal address for ' + code + ' matching the provided address' + tag + '. You can call fetchWithdrawAddresses() to get the list of withdrawal addresses.');
            }
            request['withdraw_address_uuid'] = foundAddress['uuid'];
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTransaction (response);
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        const error = this.safeValue (response, 'error');
        if (typeof error === 'string') {
            return undefined;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if (errorCode !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, message);
            throw new ExchangeError (this.id + ' ' + message);
        }
        return undefined;
    }

    checkLimit (methodName: string, limit: Int = undefined, minLimit: number = 1, maxLimit: number = 1000): number {
        if (!Number.isInteger (limit)) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() limit argument must be an integer');
        }
        if (limit < minLimit || limit > maxLimit) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() limit argument must be between ' + minLimit.toString () + ' and ' + maxLimit.toString ());
        }
        return limit;
    }

    /**
     * @method
     * @name max#fetchStatus
     * @description fetch the current service status of an exchange
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Timestamp
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure} containing information about the exchange's status and an internal error or null
     */
    async fetchStatus (params = {}) {
        try {
            const response = await this.publicGetTimestamp (params);
            return {
                'status': 'ok',
                'updated': this.milliseconds (),
                'eta': undefined,
                'url': undefined,
                'info': response,
            };
        } catch (e) {
            if (e instanceof ExchangeError) {
                return {
                    'status': 'maintenance',
                    'updated': this.milliseconds (),
                    'eta': undefined,
                    'url': undefined,
                };
            }
            throw e;
        }
    }

    /**
     * @method
     * @name max#fetchDepositsWithdrawals
     * @description fetch all deposits and withdrawals made to an account
     * @param {string|undefined} [code] unified currency code
     * @param {int|undefined} [since] the earliest time in ms to fetch deposits/withdrawals for
     * @param {int|undefined} [limit] the maximum number of deposits/withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        // fetch deposits first
        const deposits = await this.fetchDeposits (code, since, limit, params);
        // then fetch withdrawals
        const withdrawals = await this.fetchWithdrawals (code, since, limit, params);
        // combine the results
        let items = this.arrayConcat (deposits, withdrawals);
        // sort by timestamp
        items = this.sortBy (items, 'timestamp');
        // if limit is provided, slice the array
        if (limit !== undefined) {
            items = items.slice (0, limit);
        }
        return items;
    }

    /**
     * @method
     * @name max#fetchOrderTrades
     * @description fetch all trades made from a specific order
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Trade/operation/getApiV3OrderTrades
     * @param {string} id order id
     * @param {string|undefined} [symbol] not used by max fetchOrderTrades()
     * @param {int|undefined} [since] not used by max fetchOrderTrades()
     * @param {int|undefined} [limit] not used by max fetchOrderTrades()
     * @param {object} [params] extra parameters specific to the max api endpoint
     * @param {string|undefined} [params.clientOrderId] client order id as alternative to order id
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let clientOrderId;
        [ clientOrderId, params ] = this.handleParamString2 (params, 'client_oid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_oid'] = clientOrderId;
        } else if (id !== undefined) {
            request['order_id'] = id;
        } else {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires an order id argument or client_oid param');
        }
        const response = await this.privateGetOrderTrades (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name max#fetchBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3WalletMInterestRates
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} indexed by currency codes
     */
    async fetchBorrowRates (params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetWalletMInterestRates (params);
        return this.parseBorrowRates (response);
    }

    parseBorrowRates (response) {
        // {
        //    "btc": {
        //        "hourlyInterestRate": "0.0001",
        //        "nextHourlyInterestRate": "0.00012"
        //    }
        // }
        const result = {};
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const [ currencyId, data ] = response[keys[i]];
            const code = this.safeCurrencyCode (currencyId);
            const rate = this.safeNumber (data, 'hourlyInterestRate');
            result[code] = rate * 24 * 365; // convert hourly rate to yearly rate
        }
        return result;
    }

    /**
     * @method
     * @name max#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Wallet/operation/getApiV3WalletMInterests
     * @param {string|undefined} code unified currency code
     * @param {string|undefined} symbol unified market symbol when fetch interest in isolated markets
     * @param {int|undefined} since timestamp in ms of earliest time to collect borrow interest from
     * @param {int|undefined} limit max number of items to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest (code: Str = undefined, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<BorrowInterest[]> {
        await this.loadMarkets ();
        const request = {};
        const market = undefined;
        if (code !== undefined) {
            const currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            this.validateTimestamp ('fetchBorrowInterest', since);
            request['timestamp'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = this.checkLimit ('fetchBorrowInterest', limit, 1, 1000);
        }
        const response = await this.privateGetWalletMInterests (this.extend (request, params));
        // [
        //     {
        //         "currency": "eth",
        //         "amount": "0.003",
        //         "interest_rate": "0.001",
        //         "principal": "3",
        //         "created_at": 1521726960123
        //     }
        // ]
        return this.parseBorrowInterests (response, market);
    }

    parseBorrowInterest (info, market = undefined): BorrowInterest {
        const timestamp = this.safeInteger (info, 'created_at');
        const currencyId = this.safeString (info, 'currency');
        return {
            'symbol': market ? market['symbol'] : undefined,
            'currency': this.safeCurrencyCode (currencyId),
            'interest': this.safeNumber (info, 'amount'),
            'interestRate': this.safeNumber (info, 'interest_rate'),
            'amountBorrowed': this.safeNumber (info, 'principal'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    parseAddress (address) {
        let parsedAddress = address;
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split ('?');
            if (parts.length === 2) {
                parsedAddress = parts[0];
                const queryString = parts[1];
                const queryParts = queryString.split ('=');
                if (queryParts.length === 2) {
                    tag = queryParts[1];
                }
            }
        }
        return [ parsedAddress, tag ];
    }

    /**
     * @method
     * @name max#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Wallet/operation/getApiV3DepositAddress
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the max api endpoint
     * @param {string|undefined} [params.network] deposit chain/network, if the currency supports multiple chains
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        const networks = this.safeValue (currency, 'networks', []);
        let currencyVersion = currency['id'];
        if (networkCode !== undefined) {
            const network = this.safeString (this.options['networks'], networkCode, networkCode);
            let networkItem = undefined;
            const availableNetworks = [];
            const networkKeys = Object.keys (networks);
            for (let i = 0; i < networkKeys.length; i++) {
                const n = networks[networkKeys[i]];
                availableNetworks.push (n['network']);
                if (n['network'] === network) {
                    networkItem = n;
                    break;
                }
            }
            if (networkItem === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a network parameter that is one of ' + availableNetworks.join (', '));
            }
            currencyVersion = networkItem['id'];
        } else if (networks.length > 0) {
            const firstNetwork = networks[0];
            currencyVersion = firstNetwork['id'];
            // network = firstNetwork['network'].toLowerCase ();
        }
        const request = {
            'currency_version': currencyVersion,
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "currency": "usdt",
        //         "network_protocol": "tron-trc20",
        //         "currency_version": "trc20usdt",
        //         "address": "TU91BoeyrqW9MKaiRPDiE6z7UecK2n2Hze"
        //     }
        //
        const rawAddress = this.safeString (response, 'address');
        const [ address, tag ] = this.parseAddress (rawAddress);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': this.safeString (response, 'network_protocol'),
            'info': response,
        };
    }

    /**
     * @method
     * @name max#createDepositAddress
     * @description create a currency deposit address
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Wallet/operation/getApiV3DepositAddress
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the max api endpoint
     * @param {string|undefined} [params.network] deposit chain/network, if the currency supports multiple chains
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async createDepositAddress (code: string, params = {}) {
        // Note: MAX API automatically creates deposit addresses when requesting them
        // So we can just call fetchDepositAddress
        return await this.fetchDepositAddress (code, params);
    }

    /**
     * @method
     * @name max#fetchMarginMode
     * @description fetch the margin mode for a market
     * @see https://max.maicoin.com/documents/api_list/v3#tag/Public/operation/getApiV3Markets
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a {link https://docs.ccxt.com/#/?id=margin-mode-structure margin mode structure}
     */
    async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['margin']) {
            throw new BadSymbol (this.id + ' fetchMarginMode() requested margin mode for a non-margin market ' + symbol);
        }
        return {
            'info': market['info'],
            'symbol': symbol,
            'marginMode': 'isolated', // MAX only supports isolated margin
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let newParams = params;
        const request = '/api/v3/' + this.implodeParams (path, params);
        let url = this.urls['api'][api];
        url += request;
        if (!headers) {
            headers = {};
        }
        params = this.omit (params, [ 'walletType' ]);
        headers['X-MAX-AGENT'] = 'ccxt';
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            newParams = this.extend (params, {
                'nonce': nonce,
            });
            const paramsWithPath = this.extend (params, {
                'nonce': nonce,
                'path': request,
            });
            const payload = this.stringToBase64 (this.json (paramsWithPath));
            const signature = this.hmac (payload, this.encode (this.secret), sha256);
            headers = this.extend (headers, {
                'X-MAX-ACCESSKEY': this.apiKey,
                'X-MAX-PAYLOAD': payload,
                'X-MAX-SIGNATURE': signature,
            });
        }
        if (method === 'GET') {
            if (!this.isEmpty (newParams)) {
                const newParamsIsArray = {};
                const newParamsOthers = {};
                const newParamsKeys = Object.keys (newParams);
                for (let i = 0; i < newParamsKeys.length; i++) {
                    const key = newParamsKeys[i];
                    if (Array.isArray (newParams[key])) {
                        newParamsIsArray[key] = newParams[key];
                    } else {
                        newParamsOthers[key] = newParams[key];
                    }
                }
                url += '?';
                if (!this.isEmpty (newParamsOthers)) {
                    url += this.urlencode (newParamsOthers);
                }
                if (!this.isEmpty (newParamsOthers) && !this.isEmpty (newParamsIsArray)) {
                    url += '&';
                }
                if (!this.isEmpty (newParamsIsArray)) {
                    const result = [];
                    const newParamsIsArrayKeys = Object.keys (newParamsIsArray);
                    for (let i = 0; i < newParamsIsArrayKeys.length; i++) {
                        const key = newParamsIsArrayKeys[i];
                        for (let j = 0; j < newParamsIsArray[key].length; j++) {
                            result.push (key + '%5B%5D=' + newParamsIsArray[key][j]);
                        }
                    }
                    url += result.join ('&');
                }
            }
        } else {
            body = this.json (newParams);
            headers = this.extend (headers, {
                'Content-Type': 'application/json',
            });
        }
        return {
            'url': url,
            'method': method,
            'body': body,
            'headers': headers,
        };
    }
}
