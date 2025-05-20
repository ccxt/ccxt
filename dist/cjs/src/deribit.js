'use strict';

var deribit$1 = require('./abstract/deribit.js');
var number = require('./base/functions/number.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var totp = require('./base/functions/totp.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class deribit
 * @augments Exchange
 */
class deribit extends deribit$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'deribit',
            'name': 'Deribit',
            'countries': ['NL'],
            'version': 'v2',
            'userAgent': undefined,
            // 20 requests per second for non-matching-engine endpoints, 1000ms / 20 = 50ms between requests
            // 5 requests per second for matching-engine endpoints, cost = (1000ms / rateLimit) / 5 = 4
            'rateLimit': 50,
            'pro': true,
            'has': {
                'CORS': true,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTrailingAmountOrder': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFees': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchGreeks': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': true,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOption': true,
                'fetchOptionChain': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'sandbox': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '10m': '10',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '6h': '360',
                '12h': '720',
                '1d': '1D',
            },
            'urls': {
                'test': {
                    'rest': 'https://test.deribit.com',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg',
                'api': {
                    'rest': 'https://www.deribit.com',
                },
                'www': 'https://www.deribit.com',
                'doc': [
                    'https://docs.deribit.com/v2',
                    'https://github.com/deribit',
                ],
                'fees': 'https://www.deribit.com/pages/information/fees',
                'referral': {
                    'url': 'https://www.deribit.com/reg-1189.4038',
                    'discount': 0.1,
                },
            },
            'api': {
                'public': {
                    'get': {
                        // Authentication
                        'auth': 1,
                        'exchange_token': 1,
                        'fork_token': 1,
                        // Session management
                        'set_heartbeat': 1,
                        'disable_heartbeat': 1,
                        // Supporting
                        'get_time': 1,
                        'hello': 1,
                        'status': 1,
                        'test': 1,
                        // Subscription management
                        'subscribe': 1,
                        'unsubscribe': 1,
                        'unsubscribe_all': 1,
                        // Account management
                        'get_announcements': 1,
                        // Market data
                        'get_book_summary_by_currency': 1,
                        'get_book_summary_by_instrument': 1,
                        'get_contract_size': 1,
                        'get_currencies': 1,
                        'get_delivery_prices': 1,
                        'get_funding_chart_data': 1,
                        'get_funding_rate_history': 1,
                        'get_funding_rate_value': 1,
                        'get_historical_volatility': 1,
                        'get_index': 1,
                        'get_index_price': 1,
                        'get_index_price_names': 1,
                        'get_instrument': 1,
                        'get_instruments': 1,
                        'get_last_settlements_by_currency': 1,
                        'get_last_settlements_by_instrument': 1,
                        'get_last_trades_by_currency': 1,
                        'get_last_trades_by_currency_and_time': 1,
                        'get_last_trades_by_instrument': 1,
                        'get_last_trades_by_instrument_and_time': 1,
                        'get_mark_price_history': 1,
                        'get_order_book': 1,
                        'get_trade_volumes': 1,
                        'get_tradingview_chart_data': 1,
                        'get_volatility_index_data': 1,
                        'ticker': 1,
                    },
                },
                'private': {
                    'get': {
                        // Authentication
                        'logout': 1,
                        // Session management
                        'enable_cancel_on_disconnect': 1,
                        'disable_cancel_on_disconnect': 1,
                        'get_cancel_on_disconnect': 1,
                        // Subscription management
                        'subscribe': 1,
                        'unsubscribe': 1,
                        'unsubscribe_all': 1,
                        // Account management
                        'change_api_key_name': 1,
                        'change_scope_in_api_key': 1,
                        'change_subaccount_name': 1,
                        'create_api_key': 1,
                        'create_subaccount': 1,
                        'disable_api_key': 1,
                        'disable_tfa_for_subaccount': 1,
                        'enable_affiliate_program': 1,
                        'enable_api_key': 1,
                        'get_access_log': 1,
                        'get_account_summary': 1,
                        'get_account_summaries': 1,
                        'get_affiliate_program_info': 1,
                        'get_email_language': 1,
                        'get_new_announcements': 1,
                        'get_portfolio_margins': 1,
                        'get_position': 1,
                        'get_positions': 1,
                        'get_subaccounts': 1,
                        'get_subaccounts_details': 1,
                        'get_transaction_log': 1,
                        'list_api_keys': 1,
                        'remove_api_key': 1,
                        'remove_subaccount': 1,
                        'reset_api_key': 1,
                        'set_announcement_as_read': 1,
                        'set_api_key_as_default': 1,
                        'set_email_for_subaccount': 1,
                        'set_email_language': 1,
                        'set_password_for_subaccount': 1,
                        'toggle_notifications_from_subaccount': 1,
                        'toggle_subaccount_login': 1,
                        // Block Trade
                        'execute_block_trade': 4,
                        'get_block_trade': 1,
                        'get_last_block_trades_by_currency': 1,
                        'invalidate_block_trade_signature': 1,
                        'verify_block_trade': 4,
                        // Trading
                        'buy': 4,
                        'sell': 4,
                        'edit': 4,
                        'edit_by_label': 4,
                        'cancel': 4,
                        'cancel_all': 4,
                        'cancel_all_by_currency': 4,
                        'cancel_all_by_instrument': 4,
                        'cancel_by_label': 4,
                        'close_position': 4,
                        'get_margins': 1,
                        'get_mmp_config': 1,
                        'get_open_orders_by_currency': 1,
                        'get_open_orders_by_instrument': 1,
                        'get_order_history_by_currency': 1,
                        'get_order_history_by_instrument': 1,
                        'get_order_margin_by_ids': 1,
                        'get_order_state': 1,
                        'get_stop_order_history': 1,
                        'get_trigger_order_history': 1,
                        'get_user_trades_by_currency': 1,
                        'get_user_trades_by_currency_and_time': 1,
                        'get_user_trades_by_instrument': 1,
                        'get_user_trades_by_instrument_and_time': 1,
                        'get_user_trades_by_order': 1,
                        'reset_mmp': 1,
                        'set_mmp_config': 1,
                        'get_settlement_history_by_instrument': 1,
                        'get_settlement_history_by_currency': 1,
                        // Wallet
                        'cancel_transfer_by_id': 1,
                        'cancel_withdrawal': 1,
                        'create_deposit_address': 1,
                        'get_current_deposit_address': 1,
                        'get_deposits': 1,
                        'get_transfers': 1,
                        'get_withdrawals': 1,
                        'submit_transfer_to_subaccount': 1,
                        'submit_transfer_to_user': 1,
                        'withdraw': 1,
                    },
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        // todo implement
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': true,
                        },
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': true,
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': true,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'iceberg': true, // todo
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'symbolRequired': true, // todo
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true, // todo
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true, // todo
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000,
                        'daysBackCanceled': 1,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true, // todo
                    },
                    'fetchOHLCV': {
                        'limit': 1000, // todo: recheck
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
            },
            'exceptions': {
                // 0 or absent Success, No error.
                '9999': errors.PermissionDenied,
                '10000': errors.AuthenticationError,
                '10001': errors.ExchangeError,
                '10002': errors.InvalidOrder,
                '10003': errors.InvalidOrder,
                '10004': errors.OrderNotFound,
                '10005': errors.InvalidOrder,
                '10006': errors.InvalidOrder,
                '10007': errors.InvalidOrder,
                '10008': errors.InvalidOrder,
                '10009': errors.InsufficientFunds,
                '10010': errors.OrderNotFound,
                '10011': errors.InvalidOrder,
                '10012': errors.InvalidOrder,
                '10013': errors.PermissionDenied,
                '10014': errors.PermissionDenied,
                '10015': errors.PermissionDenied,
                '10016': errors.PermissionDenied,
                '10017': errors.PermissionDenied,
                '10018': errors.PermissionDenied,
                '10019': errors.PermissionDenied,
                '10020': errors.ExchangeError,
                '10021': errors.InvalidOrder,
                '10022': errors.InvalidOrder,
                '10023': errors.InvalidOrder,
                '10024': errors.InvalidOrder,
                '10025': errors.InvalidOrder,
                '10026': errors.InvalidOrder,
                '10027': errors.InvalidOrder,
                '10028': errors.DDoSProtection,
                '10029': errors.OrderNotFound,
                '10030': errors.ExchangeError,
                '10031': errors.ExchangeError,
                '10032': errors.InvalidOrder,
                '10033': errors.NotSupported,
                '10034': errors.InvalidOrder,
                '10035': errors.InvalidOrder,
                '10036': errors.InvalidOrder,
                '10040': errors.ExchangeNotAvailable,
                '10041': errors.OnMaintenance,
                '10043': errors.InvalidOrder,
                '10044': errors.InvalidOrder,
                '10045': errors.InvalidOrder,
                '10046': errors.InvalidOrder,
                '10047': errors.DDoSProtection,
                '10048': errors.ExchangeError,
                '11008': errors.InvalidOrder,
                '11029': errors.BadRequest,
                '11030': errors.ExchangeError,
                '11031': errors.ExchangeError,
                '11035': errors.DDoSProtection,
                '11036': errors.InvalidOrder,
                '11037': errors.BadRequest,
                '11038': errors.InvalidOrder,
                '11039': errors.InvalidOrder,
                '11041': errors.InvalidOrder,
                '11042': errors.PermissionDenied,
                '11043': errors.BadRequest,
                '11044': errors.InvalidOrder,
                '11045': errors.BadRequest,
                '11046': errors.BadRequest,
                '11047': errors.BadRequest,
                '11048': errors.ExchangeError,
                '11049': errors.BadRequest,
                '11050': errors.BadRequest,
                '11051': errors.OnMaintenance,
                '11052': errors.ExchangeError,
                '11053': errors.ExchangeError,
                '11090': errors.InvalidAddress,
                '11091': errors.InvalidAddress,
                '11092': errors.InvalidAddress,
                '11093': errors.DDoSProtection,
                '11094': errors.ExchangeError,
                '11095': errors.ExchangeError,
                '11096': errors.ExchangeError,
                '12000': errors.AuthenticationError,
                '12001': errors.DDoSProtection,
                '12002': errors.ExchangeError,
                '12998': errors.AuthenticationError,
                '12003': errors.AuthenticationError,
                '12004': errors.AuthenticationError,
                '12005': errors.AuthenticationError,
                '12100': errors.ExchangeError,
                '12999': errors.AuthenticationError,
                '13000': errors.AuthenticationError,
                '13001': errors.AuthenticationError,
                '13002': errors.PermissionDenied,
                '13003': errors.AuthenticationError,
                '13004': errors.AuthenticationError,
                '13005': errors.AuthenticationError,
                '13006': errors.AuthenticationError,
                '13007': errors.AuthenticationError,
                '13008': errors.ExchangeError,
                '13009': errors.AuthenticationError,
                '13010': errors.BadRequest,
                '13011': errors.BadRequest,
                '13012': errors.PermissionDenied,
                '13013': errors.BadRequest,
                '13014': errors.BadRequest,
                '13015': errors.BadRequest,
                '13016': errors.BadRequest,
                '13017': errors.ExchangeError,
                '13018': errors.ExchangeError,
                '13019': errors.ExchangeError,
                '13020': errors.ExchangeError,
                '13021': errors.PermissionDenied,
                '13025': errors.ExchangeError,
                '-32602': errors.BadRequest,
                '-32601': errors.BadRequest,
                '-32700': errors.BadRequest,
                '-32000': errors.BadRequest,
                '11054': errors.InvalidOrder, // 'post_only_reject' post order would be filled immediately
            },
            'precisionMode': number.TICK_SIZE,
            'options': {
                'code': 'BTC',
                'fetchBalance': {
                    'code': 'BTC',
                },
                'transfer': {
                    'method': 'privateGetSubmitTransferToSubaccount', // or 'privateGetSubmitTransferToUser'
                },
            },
        });
    }
    createExpiredOptionMarket(symbol) {
        // support expired option contracts
        let quote = 'USD';
        let settle = undefined;
        const optionParts = symbol.split('-');
        const symbolBase = symbol.split('/');
        let base = undefined;
        let expiry = undefined;
        if (symbol.indexOf('/') > -1) {
            base = this.safeString(symbolBase, 0);
            expiry = this.safeString(optionParts, 1);
            if (symbol.indexOf('USDC') > -1) {
                base = base + '_USDC';
            }
        }
        else {
            base = this.safeString(optionParts, 0);
            expiry = this.convertMarketIdExpireDate(this.safeString(optionParts, 1));
        }
        if (symbol.indexOf('USDC') > -1) {
            quote = 'USDC';
            settle = 'USDC';
        }
        else {
            settle = base;
        }
        let splitBase = base;
        if (base.indexOf('_') > -1) {
            const splitSymbol = base.split('_');
            splitBase = this.safeString(splitSymbol, 0);
        }
        const strike = this.safeString(optionParts, 2);
        const optionType = this.safeString(optionParts, 3);
        const datetime = this.convertExpireDate(expiry);
        const timestamp = this.parse8601(datetime);
        return {
            'id': base + '-' + this.convertExpireDateToMarketIdDate(expiry) + '-' + strike + '-' + optionType,
            'symbol': splitBase + '/' + quote + ':' + settle + '-' + expiry + '-' + strike + '-' + optionType,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'active': false,
            'type': 'option',
            'linear': undefined,
            'inverse': undefined,
            'spot': false,
            'swap': false,
            'future': false,
            'option': true,
            'margin': false,
            'contract': true,
            'contractSize': undefined,
            'expiry': timestamp,
            'expiryDatetime': datetime,
            'optionType': (optionType === 'C') ? 'call' : 'put',
            'strike': this.parseNumber(strike),
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': undefined,
        };
    }
    safeMarket(marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        const isOption = (marketId !== undefined) && ((marketId.endsWith('-C')) || (marketId.endsWith('-P')));
        if (isOption && !(marketId in this.markets_by_id)) {
            // handle expired option contracts
            return this.createExpiredOptionMarket(marketId);
        }
        return super.safeMarket(marketId, market, delimiter, marketType);
    }
    /**
     * @method
     * @name deribit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.deribit.com/#public-get_time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetGetTime(params);
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": 1583922446019,
        //         "usIn": 1583922446019955,
        //         "usOut": 1583922446019956,
        //         "usDiff": 1,
        //         "testnet": false
        //     }
        //
        return this.safeInteger(response, 'result');
    }
    /**
     * @method
     * @name deribit#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.deribit.com/#public-get_currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetGetCurrencies(params);
        //
        //    {
        //      "jsonrpc": "2.0",
        //      "result": [
        //        {
        //          "withdrawal_priorities": [],
        //          "withdrawal_fee": 0.01457324,
        //          "min_withdrawal_fee": 0.000001,
        //          "min_confirmations": 1,
        //          "fee_precision": 8,
        //          "currency_long": "Solana",
        //          "currency": "SOL",
        //          "coin_type": "SOL"
        //        },
        //        ...
        //      ],
        //      "usIn": 1688652701456124,
        //      "usOut": 1688652701456390,
        //      "usDiff": 266,
        //      "testnet": true
        //    }
        //
        const data = this.safeValue(response, 'result', {});
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const currencyId = this.safeString(currency, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const name = this.safeString(currency, 'currency_long');
            result[code] = {
                'info': currency,
                'code': code,
                'id': currencyId,
                'name': name,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'type': 'crypto',
                'fee': this.safeNumber(currency, 'withdrawal_fee'),
                'precision': this.parseNumber(this.parsePrecision(this.safeString(currency, 'fee_precision'))),
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
                'networks': undefined,
            };
        }
        return result;
    }
    codeFromOptions(methodName, params = {}) {
        const defaultCode = this.safeValue(this.options, 'code', 'BTC');
        const options = this.safeValue(this.options, methodName, {});
        const code = this.safeValue(options, 'code', defaultCode);
        return this.safeValue(params, 'code', code);
    }
    /**
     * @method
     * @name deribit#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.deribit.com/#public-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.publicGetStatus(params);
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "locked": "false" // true, partial, false
        //         },
        //         "usIn": 1650641690226788,
        //         "usOut": 1650641690226836,
        //         "usDiff": 48,
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result');
        const locked = this.safeString(result, 'locked');
        const updateTime = this.safeIntegerProduct(response, 'usIn', 0.001, this.milliseconds());
        return {
            'status': (locked === 'false') ? 'ok' : 'maintenance',
            'updated': updateTime,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name deribit#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.deribit.com/#private-get_subaccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetGetSubaccounts(params);
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [{
        //                 "username": "someusername",
        //                 "type": "main",
        //                 "system_name": "someusername",
        //                 "security_keys_enabled": false,
        //                 "security_keys_assignments": [],
        //                 "receive_notifications": false,
        //                 "login_enabled": true,
        //                 "is_password": true,
        //                 "id": "238216",
        //                 "email": "pablo@abcdef.com"
        //             },
        //             {
        //                 "username": "someusername_1",
        //                 "type": "subaccount",
        //                 "system_name": "someusername_1",
        //                 "security_keys_enabled": false,
        //                 "security_keys_assignments": [],
        //                 "receive_notifications": false,
        //                 "login_enabled": false,
        //                 "is_password": false,
        //                 "id": "245499",
        //                 "email": "pablo@abcdef.com"
        //             }
        //         ],
        //         "usIn": "1652736468292006",
        //         "usOut": "1652736468292377",
        //         "usDiff": "371",
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        return this.parseAccounts(result);
    }
    parseAccount(account) {
        //
        //      {
        //          "username": "someusername_1",
        //          "type": "subaccount",
        //          "system_name": "someusername_1",
        //          "security_keys_enabled": false,
        //          "security_keys_assignments": [],
        //          "receive_notifications": false,
        //          "login_enabled": false,
        //          "is_password": false,
        //          "id": "245499",
        //          "email": "pablo@abcdef.com"
        //      }
        //
        return {
            'info': account,
            'id': this.safeString(account, 'id'),
            'type': this.safeString(account, 'type'),
            'code': undefined,
        };
    }
    /**
     * @method
     * @name deribit#fetchMarkets
     * @description retrieves data on all markets for deribit
     * @see https://docs.deribit.com/#public-get_currencies
     * @see https://docs.deribit.com/#public-get_instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const instrumentsResponses = [];
        const result = [];
        const parsedMarkets = {};
        let fetchAllMarkets = undefined;
        [fetchAllMarkets, params] = this.handleOptionAndParams(params, 'fetchMarkets', 'fetchAllMarkets', true);
        if (fetchAllMarkets) {
            const instrumentsResponse = await this.publicGetGetInstruments(params);
            instrumentsResponses.push(instrumentsResponse);
        }
        else {
            const currenciesResponse = await this.publicGetGetCurrencies(params);
            //
            //     {
            //         "jsonrpc": "2.0",
            //         "result": [
            //             {
            //                 "withdrawal_priorities": [
            //                     { value: 0.15, name: "very_low" },
            //                     { value: 1.5, name: "very_high" },
            //                 ],
            //                 "withdrawal_fee": 0.0005,
            //                 "min_withdrawal_fee": 0.0005,
            //                 "min_confirmations": 1,
            //                 "fee_precision": 4,
            //                 "currency_long": "Bitcoin",
            //                 "currency": "BTC",
            //                 "coin_type": "BITCOIN"
            //             }
            //         ],
            //         "usIn": 1583761588590479,
            //         "usOut": 1583761588590544,
            //         "usDiff": 65,
            //         "testnet": false
            //     }
            //
            const currenciesResult = this.safeValue(currenciesResponse, 'result', []);
            for (let i = 0; i < currenciesResult.length; i++) {
                const currencyId = this.safeString(currenciesResult[i], 'currency');
                const request = {
                    'currency': currencyId,
                };
                const instrumentsResponse = await this.publicGetGetInstruments(this.extend(request, params));
                //
                //     {
                //         "jsonrpc":"2.0",
                //         "result":[
                //             {
                //                 "tick_size":0.0005,
                //                 "taker_commission":0.0003,
                //                 "strike":52000.0,
                //                 "settlement_period":"month",
                //                 "settlement_currency":"BTC",
                //                 "quote_currency":"BTC",
                //                 "option_type":"put", // put, call
                //                 "min_trade_amount":0.1,
                //                 "maker_commission":0.0003,
                //                 "kind":"option",
                //                 "is_active":true,
                //                 "instrument_name":"BTC-24JUN22-52000-P",
                //                 "expiration_timestamp":1656057600000,
                //                 "creation_timestamp":1648199543000,
                //                 "counter_currency":"USD",
                //                 "contract_size":1.0,
                //                 "block_trade_commission":0.0003,
                //                 "base_currency":"BTC"
                //             },
                //             {
                //                 "tick_size":0.5,
                //                 "taker_commission":0.0005,
                //                 "settlement_period":"month", // month, week
                //                 "settlement_currency":"BTC",
                //                 "quote_currency":"USD",
                //                 "min_trade_amount":10.0,
                //                 "max_liquidation_commission":0.0075,
                //                 "max_leverage":50,
                //                 "maker_commission":0.0,
                //                 "kind":"future",
                //                 "is_active":true,
                //                 "instrument_name":"BTC-27MAY22",
                //                 "future_type":"reversed",
                //                 "expiration_timestamp":1653638400000,
                //                 "creation_timestamp":1648195209000,
                //                 "counter_currency":"USD",
                //                 "contract_size":10.0,
                //                 "block_trade_commission":0.0001,
                //                 "base_currency":"BTC"
                //             },
                //             {
                //                 "tick_size":0.5,
                //                 "taker_commission":0.0005,
                //                 "settlement_period":"perpetual",
                //                 "settlement_currency":"BTC",
                //                 "quote_currency":"USD",
                //                 "min_trade_amount":10.0,
                //                 "max_liquidation_commission":0.0075,
                //                 "max_leverage":50,
                //                 "maker_commission":0.0,
                //                 "kind":"future",
                //                 "is_active":true,
                //                 "instrument_name":"BTC-PERPETUAL",
                //                 "future_type":"reversed",
                //                 "expiration_timestamp":32503708800000,
                //                 "creation_timestamp":1534242287000,
                //                 "counter_currency":"USD",
                //                 "contract_size":10.0,
                //                 "block_trade_commission":0.0001,
                //                 "base_currency":"BTC"
                //             },
                //         ],
                //         "usIn":1648691472831791,
                //         "usOut":1648691472831896,
                //         "usDiff":105,
                //         "testnet":false
                //     }
                //
                instrumentsResponses.push(instrumentsResponse);
            }
        }
        for (let i = 0; i < instrumentsResponses.length; i++) {
            const instrumentsResult = this.safeValue(instrumentsResponses[i], 'result', []);
            for (let k = 0; k < instrumentsResult.length; k++) {
                const market = instrumentsResult[k];
                const kind = this.safeString(market, 'kind');
                const isSpot = (kind === 'spot');
                const id = this.safeString(market, 'instrument_name');
                const baseId = this.safeString(market, 'base_currency');
                const quoteId = this.safeString(market, 'counter_currency');
                const settleId = this.safeString(market, 'settlement_currency');
                const base = this.safeCurrencyCode(baseId);
                const quote = this.safeCurrencyCode(quoteId);
                const settle = this.safeCurrencyCode(settleId);
                const settlementPeriod = this.safeValue(market, 'settlement_period');
                const swap = (settlementPeriod === 'perpetual');
                const future = !swap && (kind.indexOf('future') >= 0);
                const option = (kind.indexOf('option') >= 0);
                const isComboMarket = kind.indexOf('combo') >= 0;
                const expiry = this.safeInteger(market, 'expiration_timestamp');
                let strike = undefined;
                let optionType = undefined;
                let symbol = id;
                let type = 'swap';
                if (future) {
                    type = 'future';
                }
                else if (option) {
                    type = 'option';
                }
                else if (isSpot) {
                    type = 'spot';
                }
                let inverse = undefined;
                let linear = undefined;
                if (isSpot) {
                    symbol = base + '/' + quote;
                }
                else if (!isComboMarket) {
                    symbol = base + '/' + quote + ':' + settle;
                    if (option || future) {
                        symbol = symbol + '-' + this.yymmdd(expiry, '');
                        if (option) {
                            strike = this.safeNumber(market, 'strike');
                            optionType = this.safeString(market, 'option_type');
                            const letter = (optionType === 'call') ? 'C' : 'P';
                            symbol = symbol + '-' + this.numberToString(strike) + '-' + letter;
                        }
                    }
                    inverse = (quote !== settle);
                    linear = (settle === quote);
                }
                const parsedMarketValue = this.safeValue(parsedMarkets, symbol);
                if (parsedMarketValue) {
                    continue;
                }
                parsedMarkets[symbol] = true;
                const minTradeAmount = this.safeNumber(market, 'min_trade_amount');
                const tickSize = this.safeNumber(market, 'tick_size');
                result.push({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'settle': settle,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'settleId': settleId,
                    'type': type,
                    'spot': isSpot,
                    'margin': false,
                    'swap': swap,
                    'future': future,
                    'option': option,
                    'active': this.safeValue(market, 'is_active'),
                    'contract': !isSpot,
                    'linear': linear,
                    'inverse': inverse,
                    'taker': this.safeNumber(market, 'taker_commission'),
                    'maker': this.safeNumber(market, 'maker_commission'),
                    'contractSize': this.safeNumber(market, 'contract_size'),
                    'expiry': expiry,
                    'expiryDatetime': this.iso8601(expiry),
                    'strike': strike,
                    'optionType': optionType,
                    'precision': {
                        'amount': minTradeAmount,
                        'price': tickSize,
                    },
                    'limits': {
                        'leverage': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'amount': {
                            'min': minTradeAmount,
                            'max': undefined,
                        },
                        'price': {
                            'min': tickSize,
                            'max': undefined,
                        },
                        'cost': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'created': this.safeInteger(market, 'creation_timestamp'),
                    'info': market,
                });
            }
        }
        return result;
    }
    parseBalance(balance) {
        const result = {
            'info': balance,
        };
        let summaries = [];
        if ('summaries' in balance) {
            summaries = this.safeList(balance, 'summaries');
        }
        else {
            summaries = [balance];
        }
        for (let i = 0; i < summaries.length; i++) {
            const data = summaries[i];
            const currencyId = this.safeString(data, 'currency');
            const currencyCode = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(data, 'available_funds');
            account['used'] = this.safeString(data, 'maintenance_margin');
            account['total'] = this.safeString(data, 'equity');
            result[currencyCode] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name deribit#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.deribit.com/#private-get_account_summary
     * @see https://docs.deribit.com/#private-get_account_summaries
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.code] unified currency code of the currency for the balance, if defined 'privateGetGetAccountSummary' will be used, otherwise 'privateGetGetAccountSummaries' will be used
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const code = this.safeString(params, 'code');
        params = this.omit(params, 'code');
        const request = {};
        if (code !== undefined) {
            request['currency'] = this.currencyId(code);
        }
        let response = undefined;
        if (code === undefined) {
            response = await this.privateGetGetAccountSummaries(params);
        }
        else {
            response = await this.privateGetGetAccountSummary(this.extend(request, params));
        }
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "total_pl": 0,
        //             "session_upl": 0,
        //             "session_rpl": 0,
        //             "session_funding": 0,
        //             "portfolio_margining_enabled": false,
        //             "options_vega": 0,
        //             "options_theta": 0,
        //             "options_session_upl": 0,
        //             "options_session_rpl": 0,
        //             "options_pl": 0,
        //             "options_gamma": 0,
        //             "options_delta": 0,
        //             "margin_balance": 0.00062359,
        //             "maintenance_margin": 0,
        //             "limits": {
        //                 "non_matching_engine_burst": 300,
        //                 "non_matching_engine": 200,
        //                 "matching_engine_burst": 20,
        //                 "matching_engine": 2
        //             },
        //             "initial_margin": 0,
        //             "futures_session_upl": 0,
        //             "futures_session_rpl": 0,
        //             "futures_pl": 0,
        //             "equity": 0.00062359,
        //             "deposit_address": "13tUtNsJSZa1F5GeCmwBywVrymHpZispzw",
        //             "delta_total": 0,
        //             "currency": "BTC",
        //             "balance": 0.00062359,
        //             "available_withdrawal_funds": 0.00062359,
        //             "available_funds": 0.00062359
        //         },
        //         "usIn": 1583775838115975,
        //         "usOut": 1583775838116520,
        //         "usDiff": 545,
        //         "testnet": false
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseBalance(result);
    }
    /**
     * @method
     * @name deribit#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.deribit.com/#private-create_deposit_address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetCreateDepositAddress(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 7538,
        //         "result": {
        //             "address": "2N8udZGBc1hLRCFsU9kGwMPpmYUwMFTuCwB",
        //             "creation_timestamp": 1550575165170,
        //             "currency": "BTC",
        //             "type": "deposit"
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const address = this.safeString(result, 'address');
        this.checkAddress(address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name deribit#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.deribit.com/#private-get_current_deposit_address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetGetCurrentDepositAddress(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "type": "deposit",
        //             "status": "ready",
        //             "requires_confirmation": true,
        //             "currency": "BTC",
        //             "creation_timestamp": 1514694684651,
        //             "address": "13tUtNsJSZa1F5GeCmwBywVrymHpZispzw"
        //         },
        //         "usIn": 1583785137274288,
        //         "usOut": 1583785137274454,
        //         "usDiff": 166,
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const address = this.safeString(result, 'address');
        this.checkAddress(address);
        return {
            'info': response,
            'currency': code,
            'network': undefined,
            'address': address,
            'tag': undefined,
        };
    }
    parseTicker(ticker, market = undefined) {
        //
        // fetchTicker /public/ticker
        //
        //     {
        //         "timestamp": 1583778859480,
        //         "stats": { volume: 60627.57263769, low: 7631.5, high: 8311.5 },
        //         "state": "open",
        //         "settlement_price": 7903.21,
        //         "open_interest": 111543850,
        //         "min_price": 7634,
        //         "max_price": 7866.51,
        //         "mark_price": 7750.02,
        //         "last_price": 7750.5,
        //         "instrument_name": "BTC-PERPETUAL",
        //         "index_price": 7748.01,
        //         "funding_8h": 0.0000026,
        //         "current_funding": 0,
        //         "best_bid_price": 7750,
        //         "best_bid_amount": 19470,
        //         "best_ask_price": 7750.5,
        //         "best_ask_amount": 343280
        //     }
        //
        // fetchTicker /public/get_book_summary_by_instrument
        // fetchTickers /public/get_book_summary_by_currency
        //
        //     {
        //         "volume": 124.1,
        //         "underlying_price": 7856.445926872601,
        //         "underlying_index": "SYN.BTC-10MAR20",
        //         "quote_currency": "USD",
        //         "open_interest": 121.8,
        //         "mid_price": 0.01975,
        //         "mark_price": 0.01984559,
        //         "low": 0.0095,
        //         "last": 0.0205,
        //         "interest_rate": 0,
        //         "instrument_name": "BTC-10MAR20-7750-C",
        //         "high": 0.0295,
        //         "estimated_delivery_price": 7856.29,
        //         "creation_timestamp": 1583783678366,
        //         "bid_price": 0.0185,
        //         "base_currency": "BTC",
        //         "ask_price": 0.021
        //     },
        //
        const timestamp = this.safeInteger2(ticker, 'timestamp', 'creation_timestamp');
        const marketId = this.safeString(ticker, 'instrument_name');
        const symbol = this.safeSymbol(marketId, market);
        const last = this.safeString2(ticker, 'last_price', 'last');
        const stats = this.safeValue(ticker, 'stats', ticker);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString2(stats, 'high', 'max_price'),
            'low': this.safeString2(stats, 'low', 'min_price'),
            'bid': this.safeString2(ticker, 'best_bid_price', 'bid_price'),
            'bidVolume': this.safeString(ticker, 'best_bid_amount'),
            'ask': this.safeString2(ticker, 'best_ask_price', 'ask_price'),
            'askVolume': this.safeString(ticker, 'best_ask_amount'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString(stats, 'volume'),
            'markPrice': this.safeString(ticker, 'mark_price'),
            'indexPrice': this.safeString(ticker, 'index_price'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name deribit#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.deribit.com/#public-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetTicker(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "timestamp": 1583778859480,
        //             "stats": { volume: 60627.57263769, low: 7631.5, high: 8311.5 },
        //             "state": "open",
        //             "settlement_price": 7903.21,
        //             "open_interest": 111543850,
        //             "min_price": 7634,
        //             "max_price": 7866.51,
        //             "mark_price": 7750.02,
        //             "last_price": 7750.5,
        //             "instrument_name": "BTC-PERPETUAL",
        //             "index_price": 7748.01,
        //             "funding_8h": 0.0000026,
        //             "current_funding": 0,
        //             "best_bid_price": 7750,
        //             "best_bid_amount": 19470,
        //             "best_ask_price": 7750.5,
        //             "best_ask_amount": 343280
        //         },
        //         "usIn": 1583778859483941,
        //         "usOut": 1583778859484075,
        //         "usDiff": 134,
        //         "testnet": false
        //     }
        //
        const result = this.safeDict(response, 'result');
        return this.parseTicker(result, market);
    }
    /**
     * @method
     * @name deribit#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.deribit.com/#public-get_book_summary_by_currency
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.code] *required* the currency code to fetch the tickers for, eg. 'BTC', 'ETH'
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let code = this.safeString2(params, 'code', 'currency');
        let type = undefined;
        params = this.omit(params, ['code']);
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market(symbols[i]);
                if (code !== undefined && code !== market['base']) {
                    throw new errors.BadRequest(this.id + ' fetchTickers the base currency must be the same for all symbols, this endpoint only supports one base currency at a time. Read more about it here: https://docs.deribit.com/#public-get_book_summary_by_currency');
                }
                if (code === undefined) {
                    code = market['base'];
                    type = market['type'];
                }
            }
        }
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTickers requires a currency/code (eg: BTC/ETH/USDT) parameter to fetch tickers for');
        }
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        if (type !== undefined) {
            let requestType = undefined;
            if (type === 'spot') {
                requestType = 'spot';
            }
            else if (type === 'future' || (type === 'contract')) {
                requestType = 'future';
            }
            else if (type === 'option') {
                requestType = 'option';
            }
            if (requestType !== undefined) {
                request['kind'] = requestType;
            }
        }
        const response = await this.publicGetGetBookSummaryByCurrency(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [
        //             {
        //                 "volume": 124.1,
        //                 "underlying_price": 7856.445926872601,
        //                 "underlying_index": "SYN.BTC-10MAR20",
        //                 "quote_currency": "USD",
        //                 "open_interest": 121.8,
        //                 "mid_price": 0.01975,
        //                 "mark_price": 0.01984559,
        //                 "low": 0.0095,
        //                 "last": 0.0205,
        //                 "interest_rate": 0,
        //                 "instrument_name": "BTC-10MAR20-7750-C",
        //                 "high": 0.0295,
        //                 "estimated_delivery_price": 7856.29,
        //                 "creation_timestamp": 1583783678366,
        //                 "bid_price": 0.0185,
        //                 "base_currency": "BTC",
        //                 "ask_price": 0.021
        //             },
        //         ],
        //         "usIn": 1583783678361966,
        //         "usOut": 1583783678372069,
        //         "usDiff": 10103,
        //         "testnet": false
        //     }
        //
        const result = this.safeList(response, 'result', []);
        const tickers = {};
        for (let i = 0; i < result.length; i++) {
            const ticker = this.parseTicker(result[i]);
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
        }
        return this.filterByArrayTickers(tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name deribit#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.deribit.com/#public-get_tradingview_chart_data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] whether to paginate the results, set to false by default
     * @param {int} [params.until] the latest time in ms to fetch ohlcv for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 5000);
        }
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const duration = this.parseTimeframe(timeframe);
        const now = this.milliseconds();
        if (since === undefined) {
            if (limit === undefined) {
                limit = 1000; // at max, it provides 5000 bars, but we set generous default here
            }
            request['start_timestamp'] = now - (limit - 1) * duration * 1000;
            request['end_timestamp'] = now;
        }
        else {
            since = Math.max(since - 1, 0);
            request['start_timestamp'] = since;
            if (limit === undefined) {
                request['end_timestamp'] = now;
            }
            else {
                request['end_timestamp'] = this.sum(since, limit * duration * 1000);
            }
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.publicGetGetTradingviewChartData(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "volume": [ 3.6680847969999992, 22.682721123, 3.011587939, 0 ],
        //             "ticks": [ 1583916960000, 1583917020000, 1583917080000, 1583917140000 ],
        //             "status": "ok",
        //             "open": [ 7834, 7839, 7833.5, 7833 ],
        //             "low": [ 7834, 7833.5, 7832.5, 7833 ],
        //             "high": [ 7839.5, 7839, 7833.5, 7833 ],
        //             "cost": [ 28740, 177740, 23590, 0 ],
        //             "close": [ 7839.5, 7833.5, 7833, 7833 ]
        //         },
        //         "usIn": 1583917166709801,
        //         "usOut": 1583917166710175,
        //         "usDiff": 374,
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const ohlcvs = this.convertTradingViewToOHLCV(result, 'ticks', 'open', 'high', 'low', 'close', 'volume', true);
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "trade_seq":132564271,
        //          "trade_id":"195402220",
        //          "timestamp":1639684927932,
        //          "tick_direction":0,
        //          "price":47946.5,
        //          "mark_price":47944.13,
        //          "instrument_name":"BTC-PERPETUAL",
        //          "index_price":47925.45,
        //          "direction":"buy",
        //          "amount":580.0
        //      }
        //
        //
        // fetchMyTrades, fetchOrderTrades (private)
        //
        //     {
        //         "trade_seq": 3,
        //         "trade_id": "ETH-34066",
        //         "timestamp": 1550219814585,
        //         "tick_direction": 1,
        //         "state": "open",
        //         "self_trade": false,
        //         "reduce_only": false,
        //         "price": 0.04,
        //         "post_only": false,
        //         "order_type": "limit",
        //         "order_id": "ETH-334607",
        //         "matching_id": null,
        //         "liquidity": "M",
        //         "iv": 56.83,
        //         "instrument_name": "ETH-22FEB19-120-C",
        //         "index_price": 121.37,
        //         "fee_currency": "ETH",
        //         "fee": 0.0011,
        //         "direction": "buy",
        //         "amount": 11
        //     }
        //
        const id = this.safeString(trade, 'trade_id');
        const marketId = this.safeString(trade, 'instrument_name');
        const symbol = this.safeSymbol(marketId, market);
        const timestamp = this.safeInteger(trade, 'timestamp');
        const side = this.safeString(trade, 'direction');
        const priceString = this.safeString(trade, 'price');
        market = this.safeMarket(marketId, market);
        // Amount for inverse perpetual and futures is in USD which in ccxt is the cost
        // For options amount and linear is in corresponding cryptocurrency contracts, e.g., BTC or ETH
        const amount = this.safeString(trade, 'amount');
        let cost = Precise["default"].stringMul(amount, priceString);
        if (market['inverse']) {
            cost = Precise["default"].stringDiv(amount, priceString);
        }
        const liquidity = this.safeString(trade, 'liquidity');
        let takerOrMaker = undefined;
        if (liquidity !== undefined) {
            // M = maker, T = taker, MT = both
            takerOrMaker = (liquidity === 'M') ? 'maker' : 'taker';
        }
        const feeCostString = this.safeString(trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'order': this.safeString(trade, 'order_id'),
            'type': this.safeString(trade, 'order_type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name deribit#fetchTrades
     * @see https://docs.deribit.com/#public-get_last_trades_by_instrument
     * @see https://docs.deribit.com/#public-get_last_trades_by_instrument_and_time
     * @description get the list of most recent trades for a particular symbol.
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
            'include_old': true,
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        if (limit !== undefined) {
            request['count'] = Math.min(limit, 1000); // default 10
        }
        const until = this.safeInteger2(params, 'until', 'end_timestamp');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_timestamp'] = until;
        }
        let response = undefined;
        if ((since === undefined) && !('end_timestamp' in request)) {
            response = await this.publicGetGetLastTradesByInstrument(this.extend(request, params));
        }
        else {
            response = await this.publicGetGetLastTradesByInstrumentAndTime(this.extend(request, params));
        }
        //
        //      {
        //          "jsonrpc":"2.0",
        //          "result": {
        //              "trades": [
        //                  {
        //                      "trade_seq":132564271,
        //                      "trade_id":"195402220",
        //                      "timestamp":1639684927932,
        //                      "tick_direction":0,
        //                      "price":47946.5,
        //                      "mark_price":47944.13,
        //                      "instrument_name":"BTC-PERPETUAL",
        //                      "index_price":47925.45,
        //                      "direction":"buy","amount":580.0
        //                  }
        //              ],
        //              "has_more":true
        //          },
        //          "usIn":1639684931934671,
        //          "usOut":1639684931935337,
        //          "usDiff":666,
        //          "testnet":false
        //      }
        //
        const result = this.safeValue(response, 'result', {});
        const trades = this.safeList(result, 'trades', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name deribit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.deribit.com/#private-get_account_summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const code = this.codeFromOptions('fetchTradingFees', params);
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'extended': true,
        };
        const response = await this.privateGetGetAccountSummary(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "total_pl": 0,
        //             "session_upl": 0,
        //             "session_rpl": 0,
        //             "session_funding": 0,
        //             "portfolio_margining_enabled": false,
        //             "options_vega": 0,
        //             "options_theta": 0,
        //             "options_session_upl": 0,
        //             "options_session_rpl": 0,
        //             "options_pl": 0,
        //             "options_gamma": 0,
        //             "options_delta": 0,
        //             "margin_balance": 0.00062359,
        //             "maintenance_margin": 0,
        //             "limits": {
        //                 "non_matching_engine_burst": 300,
        //                 "non_matching_engine": 200,
        //                 "matching_engine_burst": 20,
        //                 "matching_engine": 2
        //             },
        //             "initial_margin": 0,
        //             "futures_session_upl": 0,
        //             "futures_session_rpl": 0,
        //             "futures_pl": 0,
        //             "equity": 0.00062359,
        //             "deposit_address": "13tUtNsJSZa1F5GeCmwBywVrymHpZispzw",
        //             "delta_total": 0,
        //             "currency": "BTC",
        //             "balance": 0.00062359,
        //             "available_withdrawal_funds": 0.00062359,
        //             "available_funds": 0.00062359,
        //             "fees": [
        //                 "currency": '',
        //                 "instrument_type": "perpetual",
        //                 "fee_type": "relative",
        //                 "maker_fee": 0,
        //                 "taker_fee": 0,
        //             ],
        //         },
        //         "usIn": 1583775838115975,
        //         "usOut": 1583775838116520,
        //         "usDiff": 545,
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const fees = this.safeValue(result, 'fees', []);
        let perpetualFee = {};
        let futureFee = {};
        let optionFee = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            const instrumentType = this.safeString(fee, 'instrument_type');
            if (instrumentType === 'future') {
                futureFee = {
                    'info': fee,
                    'maker': this.safeNumber(fee, 'maker_fee'),
                    'taker': this.safeNumber(fee, 'taker_fee'),
                };
            }
            else if (instrumentType === 'perpetual') {
                perpetualFee = {
                    'info': fee,
                    'maker': this.safeNumber(fee, 'maker_fee'),
                    'taker': this.safeNumber(fee, 'taker_fee'),
                };
            }
            else if (instrumentType === 'option') {
                optionFee = {
                    'info': fee,
                    'maker': this.safeNumber(fee, 'maker_fee'),
                    'taker': this.safeNumber(fee, 'taker_fee'),
                };
            }
        }
        const parsedFees = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market(symbol);
            let fee = {
                'info': market,
                'symbol': symbol,
                'percentage': true,
                'tierBased': true,
                'maker': market['maker'],
                'taker': market['taker'],
            };
            if (market['swap']) {
                fee = this.extend(fee, perpetualFee);
            }
            else if (market['future']) {
                fee = this.extend(fee, futureFee);
            }
            else if (market['option']) {
                fee = this.extend(fee, optionFee);
            }
            parsedFees[symbol] = fee;
        }
        return parsedFees;
    }
    /**
     * @method
     * @name deribit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.deribit.com/#public-get_order_book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetGetOrderBook(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "timestamp": 1583781354740,
        //             "stats": { volume: 61249.66735634, low: 7631.5, high: 8311.5 },
        //             "state": "open",
        //             "settlement_price": 7903.21,
        //             "open_interest": 111536690,
        //             "min_price": 7695.13,
        //             "max_price": 7929.49,
        //             "mark_price": 7813.06,
        //             "last_price": 7814.5,
        //             "instrument_name": "BTC-PERPETUAL",
        //             "index_price": 7810.12,
        //             "funding_8h": 0.0000031,
        //             "current_funding": 0,
        //             "change_id": 17538025952,
        //             "bids": [
        //                 [7814, 351820],
        //                 [7813.5, 207490],
        //                 [7813, 32160],
        //             ],
        //             "best_bid_price": 7814,
        //             "best_bid_amount": 351820,
        //             "best_ask_price": 7814.5,
        //             "best_ask_amount": 11880,
        //             "asks": [
        //                 [7814.5, 11880],
        //                 [7815, 18100],
        //                 [7815.5, 2640],
        //             ],
        //         },
        //         "usIn": 1583781354745804,
        //         "usOut": 1583781354745932,
        //         "usDiff": 128,
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const timestamp = this.safeInteger(result, 'timestamp');
        const nonce = this.safeInteger(result, 'change_id');
        const orderbook = this.parseOrderBook(result, market['symbol'], timestamp);
        orderbook['nonce'] = nonce;
        return orderbook;
    }
    parseOrderStatus(status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
            'rejected': 'rejected',
            'untriggered': 'open',
        };
        return this.safeString(statuses, status, status);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'good_til_cancelled': 'GTC',
            'fill_or_kill': 'FOK',
            'immediate_or_cancel': 'IOC',
        };
        return this.safeString(timeInForces, timeInForce, timeInForce);
    }
    parseOrderType(orderType) {
        const orderTypes = {
            'stop_limit': 'limit',
            'take_limit': 'limit',
            'stop_market': 'market',
            'take_market': 'market',
        };
        return this.safeString(orderTypes, orderType, orderType);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "time_in_force": "good_til_cancelled",
        //         "reduce_only": false,
        //         "profit_loss": 0,
        //         "price": "market_price",
        //         "post_only": false,
        //         "order_type": "market",
        //         "order_state": "filled",
        //         "order_id": "ETH-349249",
        //         "max_show": 40,
        //         "last_update_timestamp": 1550657341322,
        //         "label": "market0000234",
        //         "is_liquidation": false,
        //         "instrument_name": "ETH-PERPETUAL",
        //         "filled_amount": 40,
        //         "direction": "buy",
        //         "creation_timestamp": 1550657341322,
        //         "commission": 0.000139,
        //         "average_price": 143.81,
        //         "api": true,
        //         "amount": 40,
        //         "trades": [], // injected by createOrder
        //     }
        //
        const marketId = this.safeString(order, 'instrument_name');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(order, 'creation_timestamp');
        const lastUpdate = this.safeInteger(order, 'last_update_timestamp');
        const id = this.safeString(order, 'order_id');
        let priceString = this.safeString(order, 'price');
        if (priceString === 'market_price') {
            priceString = undefined;
        }
        const averageString = this.safeString(order, 'average_price');
        // Inverse contracts amount is in USD which in ccxt is the cost
        // For options and Linear contracts amount is in corresponding cryptocurrency, e.g., BTC or ETH
        const filledString = this.safeString(order, 'filled_amount');
        const amount = this.safeString(order, 'amount');
        let cost = Precise["default"].stringMul(filledString, averageString);
        if (this.safeBool(market, 'inverse')) {
            if (averageString !== '0') {
                cost = Precise["default"].stringDiv(amount, averageString);
            }
        }
        let lastTradeTimestamp = undefined;
        if (filledString !== undefined) {
            const isFilledPositive = Precise["default"].stringGt(filledString, '0');
            if (isFilledPositive) {
                lastTradeTimestamp = lastUpdate;
            }
        }
        const status = this.parseOrderStatus(this.safeString(order, 'order_state'));
        const side = this.safeStringLower(order, 'direction');
        let feeCostString = this.safeString(order, 'commission');
        let fee = undefined;
        if (feeCostString !== undefined) {
            feeCostString = Precise["default"].stringAbs(feeCostString);
            fee = {
                'cost': feeCostString,
                'currency': market['base'],
            };
        }
        const rawType = this.safeString(order, 'order_type');
        const type = this.parseOrderType(rawType);
        // injected in createOrder
        const trades = this.safeValue(order, 'trades');
        const timeInForce = this.parseTimeInForce(this.safeString(order, 'time_in_force'));
        const postOnly = this.safeValue(order, 'post_only');
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': priceString,
            'triggerPrice': this.safeValue(order, 'stop_price'),
            'amount': amount,
            'cost': cost,
            'average': averageString,
            'filled': filledString,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': trades,
        }, market);
    }
    /**
     * @method
     * @name deribit#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.deribit.com/#private-get_order_state
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'order_id': id,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const response = await this.privateGetGetOrderState(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 4316,
        //         "result": {
        //             "time_in_force": "good_til_cancelled",
        //             "reduce_only": false,
        //             "profit_loss": 0.051134,
        //             "price": 118.94,
        //             "post_only": false,
        //             "order_type": "limit",
        //             "order_state": "filled",
        //             "order_id": "ETH-331562",
        //             "max_show": 37,
        //             "last_update_timestamp": 1550219810944,
        //             "label": "",
        //             "is_liquidation": false,
        //             "instrument_name": "ETH-PERPETUAL",
        //             "filled_amount": 37,
        //             "direction": "sell",
        //             "creation_timestamp": 1550219749176,
        //             "commission": 0.000031,
        //             "average_price": 118.94,
        //             "api": false,
        //             "amount": 37
        //         }
        //     }
        //
        const result = this.safeDict(response, 'result');
        return this.parseOrder(result, market);
    }
    /**
     * @method
     * @name deribit#createOrder
     * @description create a trade order
     * @see https://docs.deribit.com/#private-buy
     * @see https://docs.deribit.com/#private-sell
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency.
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.trigger] the trigger type 'index_price', 'mark_price', or 'last_price', default is 'last_price'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
            'amount': this.amountToPrecision(symbol, amount),
            'type': type, // limit, stop_limit, market, stop_market, default is limit
            // 'label': 'string', // user-defined label for the order (maximum 64 characters)
            // 'price': this.priceToPrecision (symbol, 123.45), // only for limit and stop_limit orders
            // 'time_in_force' : 'good_til_cancelled', // fill_or_kill, immediate_or_cancel
            // 'max_show': 123.45, // max amount within an order to be shown to other customers, 0 for invisible order
            // 'post_only': false, // if the new price would cause the order to be filled immediately (as taker), the price will be changed to be just below the spread.
            // 'reject_post_only': false, // if true the order is put to order book unmodified or request is rejected
            // 'reduce_only': false, // if true, the order is intended to only reduce a current position
            // 'stop_price': false, // stop price, required for stop_limit orders
            // 'trigger': 'index_price', // mark_price, last_price, required for stop_limit orders
            // 'advanced': 'usd', // 'implv', advanced option order type, options only
        };
        const trigger = this.safeString(params, 'trigger', 'last_price');
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        const reduceOnly = this.safeValue2(params, 'reduceOnly', 'reduce_only');
        // only stop loss sell orders are allowed when price crossed from above
        const stopLossPrice = this.safeValue(params, 'stopLossPrice');
        // only take profit buy orders are allowed when price crossed from below
        const takeProfitPrice = this.safeValue(params, 'takeProfitPrice');
        const trailingAmount = this.safeString2(params, 'trailingAmount', 'trigger_offset');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isStopLimit = type === 'stop_limit';
        const isStopMarket = type === 'stop_market';
        const isTakeLimit = type === 'take_limit';
        const isTakeMarket = type === 'take_market';
        const isStopLossOrder = isStopLimit || isStopMarket || (stopLossPrice !== undefined);
        const isTakeProfitOrder = isTakeLimit || isTakeMarket || (takeProfitPrice !== undefined);
        if (isStopLossOrder && isTakeProfitOrder) {
            throw new errors.InvalidOrder(this.id + ' createOrder () only allows one of stopLossPrice or takeProfitPrice to be specified');
        }
        const isStopOrder = isStopLossOrder || isTakeProfitOrder;
        const isLimitOrder = (type === 'limit') || isStopLimit || isTakeLimit;
        const isMarketOrder = (type === 'market') || isStopMarket || isTakeMarket;
        const exchangeSpecificPostOnly = this.safeValue(params, 'post_only');
        const postOnly = this.isPostOnly(isMarketOrder, exchangeSpecificPostOnly, params);
        if (isLimitOrder) {
            request['type'] = 'limit';
            request['price'] = this.priceToPrecision(symbol, price);
        }
        else {
            request['type'] = 'market';
        }
        if (isTrailingAmountOrder) {
            request['trigger'] = trigger;
            request['type'] = 'trailing_stop';
            request['trigger_offset'] = this.parseToNumeric(trailingAmount);
        }
        else if (isStopOrder) {
            const triggerPrice = (stopLossPrice !== undefined) ? stopLossPrice : takeProfitPrice;
            request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
            request['trigger'] = trigger;
            if (isStopLossOrder) {
                if (isMarketOrder) {
                    // stop_market (sell only)
                    request['type'] = 'stop_market';
                }
                else {
                    // stop_limit (sell only)
                    request['type'] = 'stop_limit';
                }
            }
            else {
                if (isMarketOrder) {
                    // take_market (buy only)
                    request['type'] = 'take_market';
                }
                else {
                    // take_limit (buy only)
                    request['type'] = 'take_limit';
                }
            }
        }
        if (reduceOnly) {
            request['reduce_only'] = true;
        }
        if (postOnly) {
            request['post_only'] = true;
            request['reject_post_only'] = true;
        }
        if (timeInForce !== undefined) {
            if (timeInForce === 'GTC') {
                request['time_in_force'] = 'good_til_cancelled';
            }
            if (timeInForce === 'IOC') {
                request['time_in_force'] = 'immediate_or_cancel';
            }
            if (timeInForce === 'FOK') {
                request['time_in_force'] = 'fill_or_kill';
            }
        }
        params = this.omit(params, ['timeInForce', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'reduceOnly', 'trailingAmount']);
        let response = undefined;
        if (this.capitalize(side) === 'Buy') {
            response = await this.privateGetBuy(this.extend(request, params));
        }
        else {
            response = await this.privateGetSell(this.extend(request, params));
        }
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 5275,
        //         "result": {
        //             "trades": [
        //                 {
        //                     "trade_seq": 14151,
        //                     "trade_id": "ETH-37435",
        //                     "timestamp": 1550657341322,
        //                     "tick_direction": 2,
        //                     "state": "closed",
        //                     "self_trade": false,
        //                     "price": 143.81,
        //                     "order_type": "market",
        //                     "order_id": "ETH-349249",
        //                     "matching_id": null,
        //                     "liquidity": "T",
        //                     "label": "market0000234",
        //                     "instrument_name": "ETH-PERPETUAL",
        //                     "index_price": 143.73,
        //                     "fee_currency": "ETH",
        //                     "fee": 0.000139,
        //                     "direction": "buy",
        //                     "amount": 40
        //                 }
        //             ],
        //             "order": {
        //                 "time_in_force": "good_til_cancelled",
        //                 "reduce_only": false,
        //                 "profit_loss": 0,
        //                 "price": "market_price",
        //                 "post_only": false,
        //                 "order_type": "market",
        //                 "order_state": "filled",
        //                 "order_id": "ETH-349249",
        //                 "max_show": 40,
        //                 "last_update_timestamp": 1550657341322,
        //                 "label": "market0000234",
        //                 "is_liquidation": false,
        //                 "instrument_name": "ETH-PERPETUAL",
        //                 "filled_amount": 40,
        //                 "direction": "buy",
        //                 "creation_timestamp": 1550657341322,
        //                 "commission": 0.000139,
        //                 "average_price": 143.81,
        //                 "api": true,
        //                 "amount": 40
        //             }
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const order = this.safeValue(result, 'order');
        const trades = this.safeValue(result, 'trades', []);
        order['trades'] = trades;
        return this.parseOrder(order, market);
    }
    /**
     * @method
     * @name deribit#editOrder
     * @description edit a trade order
     * @see https://docs.deribit.com/#private-edit
     * @param {string} id edit order id
     * @param {string} [symbol] unified symbol of the market to edit an order in
     * @param {string} [type] 'market' or 'limit'
     * @param {string} [side] 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency.
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (amount === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires an amount argument');
        }
        await this.loadMarkets();
        const request = {
            'order_id': id,
            'amount': this.amountToPrecision(symbol, amount),
            // 'post_only': false, // if the new price would cause the order to be filled immediately (as taker), the price will be changed to be just below the spread.
            // 'reject_post_only': false, // if true the order is put to order book unmodified or request is rejected
            // 'reduce_only': false, // if true, the order is intended to only reduce a current position
            // 'stop_price': false, // stop price, required for stop_limit orders
            // 'advanced': 'usd', // 'implv', advanced option order type, options only
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const trailingAmount = this.safeString2(params, 'trailingAmount', 'trigger_offset');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        if (isTrailingAmountOrder) {
            request['trigger_offset'] = this.parseToNumeric(trailingAmount);
            params = this.omit(params, 'trigger_offset');
        }
        const response = await this.privateGetEdit(this.extend(request, params));
        const result = this.safeValue(response, 'result', {});
        const order = this.safeValue(result, 'order');
        const trades = this.safeValue(result, 'trades', []);
        order['trades'] = trades;
        return this.parseOrder(order);
    }
    /**
     * @method
     * @name deribit#cancelOrder
     * @description cancels an open order
     * @see https://docs.deribit.com/#private-cancel
     * @param {string} id order id
     * @param {string} symbol not used by deribit cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetCancel(this.extend(request, params));
        const result = this.safeDict(response, 'result', {});
        return this.parseOrder(result);
    }
    /**
     * @method
     * @name deribit#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.deribit.com/#private-cancel_all
     * @see https://docs.deribit.com/#private-cancel_all_by_instrument
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let response = undefined;
        if (symbol === undefined) {
            response = await this.privateGetCancelAll(this.extend(request, params));
        }
        else {
            const market = this.market(symbol);
            request['instrument_name'] = market['id'];
            response = await this.privateGetCancelAllByInstrument(this.extend(request, params));
        }
        //
        //    {
        //        jsonrpc: '2.0',
        //        result: '1',
        //        usIn: '1720508354127369',
        //        usOut: '1720508354133603',
        //        usDiff: '6234',
        //        testnet: true
        //    }
        //
        return [
            this.safeOrder({
                'info': response,
            }),
        ];
    }
    /**
     * @method
     * @name deribit#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.deribit.com/#private-get_open_orders_by_currency
     * @see https://docs.deribit.com/#private-get_open_orders_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        let response = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions('fetchOpenOrders', params);
            const currency = this.currency(code);
            request['currency'] = currency['id'];
            response = await this.privateGetGetOpenOrdersByCurrency(this.extend(request, params));
        }
        else {
            market = this.market(symbol);
            request['instrument_name'] = market['id'];
            response = await this.privateGetGetOpenOrdersByInstrument(this.extend(request, params));
        }
        const result = this.safeList(response, 'result', []);
        return this.parseOrders(result, market, since, limit);
    }
    /**
     * @method
     * @name deribit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.deribit.com/#private-get_order_history_by_currency
     * @see https://docs.deribit.com/#private-get_order_history_by_instrument
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        let response = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions('fetchClosedOrders', params);
            const currency = this.currency(code);
            request['currency'] = currency['id'];
            response = await this.privateGetGetOrderHistoryByCurrency(this.extend(request, params));
        }
        else {
            market = this.market(symbol);
            request['instrument_name'] = market['id'];
            response = await this.privateGetGetOrderHistoryByInstrument(this.extend(request, params));
        }
        const result = this.safeList(response, 'result', []);
        return this.parseOrders(result, market, since, limit);
    }
    /**
     * @method
     * @name deribit#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.deribit.com/#private-get_user_trades_by_order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetGetUserTradesByOrder(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 9367,
        //         "result": {
        //             "trades": [
        //                 {
        //                     "trade_seq": 3,
        //                     "trade_id": "ETH-34066",
        //                     "timestamp": 1550219814585,
        //                     "tick_direction": 1,
        //                     "state": "open",
        //                     "self_trade": false,
        //                     "reduce_only": false,
        //                     "price": 0.04,
        //                     "post_only": false,
        //                     "order_type": "limit",
        //                     "order_id": "ETH-334607",
        //                     "matching_id": null,
        //                     "liquidity": "M",
        //                     "iv": 56.83,
        //                     "instrument_name": "ETH-22FEB19-120-C",
        //                     "index_price": 121.37,
        //                     "fee_currency": "ETH",
        //                     "fee": 0.0011,
        //                     "direction": "buy",
        //                     "amount": 11
        //                 },
        //             ],
        //             "has_more": true
        //         }
        //     }
        //
        const result = this.safeList(response, 'result', []);
        return this.parseTrades(result, undefined, since, limit);
    }
    /**
     * @method
     * @name deribit#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.deribit.com/#private-get_user_trades_by_currency
     * @see https://docs.deribit.com/#private-get_user_trades_by_currency_and_time
     * @see https://docs.deribit.com/#private-get_user_trades_by_instrument
     * @see https://docs.deribit.com/#private-get_user_trades_by_instrument_and_time
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'include_old': true,
        };
        let market = undefined;
        if (limit !== undefined) {
            request['count'] = limit; // default 10
        }
        let response = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions('fetchMyTrades', params);
            const currency = this.currency(code);
            request['currency'] = currency['id'];
            if (since === undefined) {
                response = await this.privateGetGetUserTradesByCurrency(this.extend(request, params));
            }
            else {
                request['start_timestamp'] = since;
                response = await this.privateGetGetUserTradesByCurrencyAndTime(this.extend(request, params));
            }
        }
        else {
            market = this.market(symbol);
            request['instrument_name'] = market['id'];
            if (since === undefined) {
                response = await this.privateGetGetUserTradesByInstrument(this.extend(request, params));
            }
            else {
                request['start_timestamp'] = since;
                response = await this.privateGetGetUserTradesByInstrumentAndTime(this.extend(request, params));
            }
        }
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 9367,
        //         "result": {
        //             "trades": [
        //                 {
        //                     "trade_seq": 3,
        //                     "trade_id": "ETH-34066",
        //                     "timestamp": 1550219814585,
        //                     "tick_direction": 1,
        //                     "state": "open",
        //                     "self_trade": false,
        //                     "reduce_only": false,
        //                     "price": 0.04,
        //                     "post_only": false,
        //                     "order_type": "limit",
        //                     "order_id": "ETH-334607",
        //                     "matching_id": null,
        //                     "liquidity": "M",
        //                     "iv": 56.83,
        //                     "instrument_name": "ETH-22FEB19-120-C",
        //                     "index_price": 121.37,
        //                     "fee_currency": "ETH",
        //                     "fee": 0.0011,
        //                     "direction": "buy",
        //                     "amount": 11
        //                 },
        //             ],
        //             "has_more": true
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const trades = this.safeList(result, 'trades', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name deribit#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.deribit.com/#private-get_deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDeposits() requires a currency code argument');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetDeposits(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 5611,
        //         "result": {
        //             "count": 1,
        //             "data": [
        //                 {
        //                     "address": "2N35qDKDY22zmJq9eSyiAerMD4enJ1xx6ax",
        //                     "amount": 5,
        //                     "currency": "BTC",
        //                     "received_timestamp": 1549295017670,
        //                     "state": "completed",
        //                     "transaction_id": "230669110fdaf0a0dbcdc079b6b8b43d5af29cc73683835b9bc6b3406c065fda",
        //                     "updated_timestamp": 1549295130159
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const data = this.safeList(result, 'data', []);
        return this.parseTransactions(data, currency, since, limit, params);
    }
    /**
     * @method
     * @name deribit#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.deribit.com/#private-get_withdrawals
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetWithdrawals(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 2745,
        //         "result": {
        //             "count": 1,
        //             "data": [
        //                 {
        //                     "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBz",
        //                     "amount": 0.5,
        //                     "confirmed_timestamp": null,
        //                     "created_timestamp": 1550571443070,
        //                     "currency": "BTC",
        //                     "fee": 0.0001,
        //                     "id": 1,
        //                     "priority": 0.15,
        //                     "state": "unconfirmed",
        //                     "transaction_id": null,
        //                     "updated_timestamp": 1550571443070
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const data = this.safeList(result, 'data', []);
        return this.parseTransactions(data, currency, since, limit, params);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'completed': 'ok',
            'unconfirmed': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchWithdrawals
        //
        //     {
        //         "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBz",
        //         "amount": 0.5,
        //         "confirmed_timestamp": null,
        //         "created_timestamp": 1550571443070,
        //         "currency": "BTC",
        //         "fee": 0.0001,
        //         "id": 1,
        //         "priority": 0.15,
        //         "state": "unconfirmed",
        //         "transaction_id": null,
        //         "updated_timestamp": 1550571443070
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "address": "2N35qDKDY22zmJq9eSyiAerMD4enJ1xx6ax",
        //         "amount": 5,
        //         "currency": "BTC",
        //         "received_timestamp": 1549295017670,
        //         "state": "completed",
        //         "transaction_id": "230669110fdaf0a0dbcdc079b6b8b43d5af29cc73683835b9bc6b3406c065fda",
        //         "updated_timestamp": 1549295130159
        //     }
        //
        const currencyId = this.safeString(transaction, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeInteger2(transaction, 'created_timestamp', 'received_timestamp');
        const updated = this.safeInteger(transaction, 'updated_timestamp');
        const status = this.parseTransactionStatus(this.safeString(transaction, 'state'));
        const address = this.safeString(transaction, 'address');
        const feeCost = this.safeNumber(transaction, 'fee');
        let type = 'deposit';
        let fee = undefined;
        if (feeCost !== undefined) {
            type = 'withdrawal';
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'id'),
            'txid': this.safeString(transaction, 'transaction_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.safeNumber(transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'network': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': fee,
        };
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 404,
        //         "result": {
        //             "average_price": 0,
        //             "delta": 0,
        //             "direction": "buy",
        //             "estimated_liquidation_price": 0,
        //             "floating_profit_loss": 0,
        //             "index_price": 3555.86,
        //             "initial_margin": 0,
        //             "instrument_name": "BTC-PERPETUAL",
        //             "leverage": 100,
        //             "kind": "future",
        //             "maintenance_margin": 0,
        //             "mark_price": 3556.62,
        //             "open_orders_margin": 0.000165889,
        //             "realized_profit_loss": 0,
        //             "settlement_price": 3555.44,
        //             "size": 0,
        //             "size_currency": 0,
        //             "total_profit_loss": 0
        //         }
        //     }
        //
        const contract = this.safeString(position, 'instrument_name');
        market = this.safeMarket(contract, market);
        let side = this.safeString(position, 'direction');
        side = (side === 'buy') ? 'long' : 'short';
        const unrealizedPnl = this.safeString(position, 'floating_profit_loss');
        const initialMarginString = this.safeString(position, 'initial_margin');
        const notionalString = this.safeString(position, 'size_currency');
        const maintenanceMarginString = this.safeString(position, 'maintenance_margin');
        const currentTime = this.milliseconds();
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': currentTime,
            'datetime': this.iso8601(currentTime),
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.parseNumber(initialMarginString),
            'initialMarginPercentage': this.parseNumber(Precise["default"].stringMul(Precise["default"].stringDiv(initialMarginString, notionalString), '100')),
            'maintenanceMargin': this.parseNumber(maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber(Precise["default"].stringMul(Precise["default"].stringDiv(maintenanceMarginString, notionalString), '100')),
            'entryPrice': this.safeNumber(position, 'average_price'),
            'notional': this.parseNumber(notionalString),
            'leverage': this.safeInteger(position, 'leverage'),
            'unrealizedPnl': this.parseNumber(unrealizedPnl),
            'contracts': undefined,
            'contractSize': this.safeNumber(market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber(position, 'estimated_liquidation_price'),
            'markPrice': this.safeNumber(position, 'mark_price'),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name deribit#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.deribit.com/#private-get_position
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privateGetGetPosition(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 404,
        //         "result": {
        //             "average_price": 0,
        //             "delta": 0,
        //             "direction": "buy",
        //             "estimated_liquidation_price": 0,
        //             "floating_profit_loss": 0,
        //             "index_price": 3555.86,
        //             "initial_margin": 0,
        //             "instrument_name": "BTC-PERPETUAL",
        //             "leverage": 100,
        //             "kind": "future",
        //             "maintenance_margin": 0,
        //             "mark_price": 3556.62,
        //             "open_orders_margin": 0.000165889,
        //             "realized_profit_loss": 0,
        //             "settlement_price": 3555.44,
        //             "size": 0,
        //             "size_currency": 0,
        //             "total_profit_loss": 0
        //         }
        //     }
        //
        const result = this.safeDict(response, 'result');
        return this.parsePosition(result);
    }
    /**
     * @method
     * @name deribit#fetchPositions
     * @description fetch all open positions
     * @see https://docs.deribit.com/#private-get_positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.currency] currency code filter for positions
     * @param {string} [params.kind] market type filter for positions 'future', 'option', 'spot', 'future_combo' or 'option_combo'
     * @param {int} [params.subaccount_id] the user id for the subaccount
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const code = this.safeString(params, 'currency');
        const request = {};
        if (code !== undefined) {
            params = this.omit(params, 'currency');
            const currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetGetPositions(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 2236,
        //         "result": [
        //             {
        //                 "average_price": 7440.18,
        //                 "delta": 0.006687487,
        //                 "direction": "buy",
        //                 "estimated_liquidation_price": 1.74,
        //                 "floating_profit_loss": 0,
        //                 "index_price": 7466.79,
        //                 "initial_margin": 0.000197283,
        //                 "instrument_name": "BTC-PERPETUAL",
        //                 "kind": "future",
        //                 "leverage": 34,
        //                 "maintenance_margin": 0.000143783,
        //                 "mark_price": 7476.65,
        //                 "open_orders_margin": 0.000197288,
        //                 "realized_funding": -1e-8,
        //                 "realized_profit_loss": -9e-9,
        //                 "settlement_price": 7476.65,
        //                 "size": 50,
        //                 "size_currency": 0.006687487,
        //                 "total_profit_loss": 0.000032781
        //             },
        //         ]
        //     }
        //
        const result = this.safeList(response, 'result');
        return this.parsePositions(result, symbols);
    }
    /**
     * @method
     * @name deribit#fetchVolatilityHistory
     * @description fetch the historical volatility of an option market based on an underlying asset
     * @see https://docs.deribit.com/#public-get_historical_volatility
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [volatility history objects]{@link https://docs.ccxt.com/#/?id=volatility-structure}
     */
    async fetchVolatilityHistory(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.publicGetGetHistoricalVolatility(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [
        //             [1640142000000,63.828320460740585],
        //             [1640142000000,63.828320460740585],
        //             [1640145600000,64.03821964123213]
        //         ],
        //         "usIn": 1641515379467734,
        //         "usOut": 1641515379468095,
        //         "usDiff": 361,
        //         "testnet": false
        //     }
        //
        return this.parseVolatilityHistory(response);
    }
    parseVolatilityHistory(volatility) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [
        //             [1640142000000,63.828320460740585],
        //             [1640142000000,63.828320460740585],
        //             [1640145600000,64.03821964123213]
        //         ],
        //         "usIn": 1641515379467734,
        //         "usOut": 1641515379468095,
        //         "usDiff": 361,
        //         "testnet": false
        //     }
        //
        const volatilityResult = this.safeValue(volatility, 'result', []);
        const result = [];
        for (let i = 0; i < volatilityResult.length; i++) {
            const timestamp = this.safeInteger(volatilityResult[i], 0);
            const volatilityObj = this.safeNumber(volatilityResult[i], 1);
            result.push({
                'info': volatilityObj,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'volatility': volatilityObj,
            });
        }
        return result;
    }
    /**
     * @method
     * @name deribit#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.deribit.com/#private-get_transfers
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTransfers() requires a currency code argument');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetTransfers(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 7606,
        //         "result": {
        //             "count": 2,
        //             "data": [
        //                 {
        //                     "amount": 0.2,
        //                     "created_timestamp": 1550579457727,
        //                     "currency": "BTC",
        //                     "direction": "payment",
        //                     "id": 2,
        //                     "other_side": "2MzyQc5Tkik61kJbEpJV5D5H9VfWHZK9Sgy",
        //                     "state": "prepared",
        //                     "type": "user",
        //                     "updated_timestamp": 1550579457727
        //                 },
        //                 {
        //                     "amount": 0.3,
        //                     "created_timestamp": 1550579255800,
        //                     "currency": "BTC",
        //                     "direction": "payment",
        //                     "id": 1,
        //                     "other_side": "new_user_1_1",
        //                     "state": "confirmed",
        //                     "type": "subaccount",
        //                     "updated_timestamp": 1550579255800
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const transfers = this.safeList(result, 'data', []);
        return this.parseTransfers(transfers, currency, since, limit, params);
    }
    /**
     * @method
     * @name deribit#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.deribit.com/#private-submit_transfer_to_user
     * @see https://docs.deribit.com/#private-submit_transfer_to_subaccount
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'amount': amount,
            'currency': currency['id'],
            'destination': toAccount,
        };
        let method = this.safeString(params, 'method');
        params = this.omit(params, 'method');
        if (method === undefined) {
            const transferOptions = this.safeValue(this.options, 'transfer', {});
            method = this.safeString(transferOptions, 'method', 'privateGetSubmitTransferToSubaccount');
        }
        let response = undefined;
        if (method === 'privateGetSubmitTransferToUser') {
            response = await this.privateGetSubmitTransferToUser(this.extend(request, params));
        }
        else {
            response = await this.privateGetSubmitTransferToSubaccount(this.extend(request, params));
        }
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 9421,
        //         "result": {
        //             "updated_timestamp": 1550232862350,
        //             "type": "user",
        //             "state": "prepared",
        //             "other_side": "0x4aa0753d798d668056920094d65321a8e8913e26",
        //             "id": 3,
        //             "direction": "payment",
        //             "currency": "ETH",
        //             "created_timestamp": 1550232862350,
        //             "amount": 13.456
        //         }
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseTransfer(result, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        //     {
        //         "updated_timestamp": 1550232862350,
        //         "type": "user",
        //         "state": "prepared",
        //         "other_side": "0x4aa0753d798d668056920094d65321a8e8913e26",
        //         "id": 3,
        //         "direction": "payment",
        //         "currency": "ETH",
        //         "created_timestamp": 1550232862350,
        //         "amount": 13.456
        //     }
        //
        const timestamp = this.safeTimestamp(transfer, 'created_timestamp');
        const status = this.safeString(transfer, 'state');
        const account = this.safeString(transfer, 'other_side');
        const direction = this.safeString(transfer, 'direction');
        const currencyId = this.safeString(transfer, 'currency');
        return {
            'info': transfer,
            'id': this.safeString(transfer, 'id'),
            'status': this.parseTransferStatus(status),
            'amount': this.safeNumber(transfer, 'amount'),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'fromAccount': direction !== 'payment' ? account : undefined,
            'toAccount': direction === 'payment' ? account : undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'prepared': 'pending',
            'confirmed': 'ok',
            'cancelled': 'cancelled',
            'waiting_for_admin': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name deribit#withdraw
     * @description make a withdrawal
     * @see https://docs.deribit.com/#private-withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
            // 'priority': 'high', // low, mid, high, very_high, extreme_high, insane
            // 'tfa': '123456', // if enabled
        };
        if (this.twofa !== undefined) {
            request['tfa'] = totp.totp(this.twofa);
        }
        const response = await this.privateGetWithdraw(this.extend(request, params));
        return this.parseTransaction(response, currency);
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //      "withdrawal_priorities": [],
        //      "withdrawal_fee": 0.01457324,
        //      "min_withdrawal_fee": 0.000001,
        //      "min_confirmations": 1,
        //      "fee_precision": 8,
        //      "currency_long": "Solana",
        //      "currency": "SOL",
        //      "coin_type": "SOL"
        //    }
        //
        return {
            'info': fee,
            'withdraw': {
                'fee': this.safeNumber(fee, 'withdrawal_fee'),
                'percentage': false,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
    }
    /**
     * @method
     * @name deribit#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://docs.deribit.com/#public-get_currencies
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetGetCurrencies(params);
        //
        //    {
        //      "jsonrpc": "2.0",
        //      "result": [
        //        {
        //          "withdrawal_priorities": [],
        //          "withdrawal_fee": 0.01457324,
        //          "min_withdrawal_fee": 0.000001,
        //          "min_confirmations": 1,
        //          "fee_precision": 8,
        //          "currency_long": "Solana",
        //          "currency": "SOL",
        //          "coin_type": "SOL"
        //        },
        //        ...
        //      ],
        //      "usIn": 1688652701456124,
        //      "usOut": 1688652701456390,
        //      "usDiff": 266,
        //      "testnet": true
        //    }
        //
        const data = this.safeList(response, 'result', []);
        return this.parseDepositWithdrawFees(data, codes, 'currency');
    }
    /**
     * @method
     * @name deribit#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.deribit.com/#public-get_funding_rate_value
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.start_timestamp] fetch funding rate starting from this timestamp
     * @param {int} [params.end_timestamp] fetch funding rate ending at this timestamp
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const time = this.milliseconds();
        const request = {
            'instrument_name': market['id'],
            'start_timestamp': time - (8 * 60 * 60 * 1000),
            'end_timestamp': time,
        };
        const response = await this.publicGetGetFundingRateValue(this.extend(request, params));
        //
        //   {
        //       "jsonrpc":"2.0",
        //       "result":"0",
        //       "usIn":"1691161645596519",
        //       "usOut":"1691161645597149",
        //       "usDiff":"630",
        //       "testnet":false
        //   }
        //
        return this.parseFundingRate(response, market);
    }
    /**
     * @method
     * @name deribit#fetchFundingRateHistory
     * @description fetch the current funding rate
     * @see https://docs.deribit.com/#public-get_funding_rate_history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding rate history for
     * @param {int} [limit] the maximum number of entries to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] fetch funding rate ending at this timestamp
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        const maxEntriesPerRequest = 744; // seems exchange returns max 744 items per request
        const eachItemDuration = '1h';
        if (paginate) {
            // fix for: https://github.com/ccxt/ccxt/issues/25040
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, eachItemDuration, this.extend(params, { 'isDeribitPaginationCall': true }), maxEntriesPerRequest);
        }
        const duration = this.parseTimeframe(eachItemDuration) * 1000;
        let time = this.milliseconds();
        const month = 30 * 24 * 60 * 60 * 1000;
        if (since === undefined) {
            since = time - month;
        }
        else {
            time = since + month;
        }
        const request = {
            'instrument_name': market['id'],
            'start_timestamp': since - 1,
        };
        const until = this.safeInteger2(params, 'until', 'end_timestamp');
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request['end_timestamp'] = until;
        }
        else {
            request['end_timestamp'] = time;
        }
        if ('isDeribitPaginationCall' in params) {
            params = this.omit(params, 'isDeribitPaginationCall');
            const maxUntil = this.sum(since, limit * duration);
            request['end_timestamp'] = Math.min(request['end_timestamp'], maxUntil);
        }
        const response = await this.publicGetGetFundingRateHistory(this.extend(request, params));
        //
        //    {
        //        "jsonrpc": "2.0",
        //        "id": 7617,
        //        "result": [
        //          {
        //            "timestamp": 1569891600000,
        //            "index_price": 8222.87,
        //            "prev_index_price": 8305.72,
        //            "interest_8h": -0.00009234260068476106,
        //            "interest_1h": -4.739622041017375e-7
        //          }
        //        ]
        //    }
        //
        const rates = [];
        const result = this.safeValue(response, 'result', []);
        for (let i = 0; i < result.length; i++) {
            const fr = result[i];
            const rate = this.parseFundingRate(fr, market);
            rates.push(rate);
        }
        return this.filterBySymbolSinceLimit(rates, symbol, since, limit);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //   {
        //       "jsonrpc":"2.0",
        //       "result":"0",
        //       "usIn":"1691161645596519",
        //       "usOut":"1691161645597149",
        //       "usDiff":"630",
        //       "testnet":false
        //   }
        // history
        //   {
        //     "timestamp": 1569891600000,
        //     "index_price": 8222.87,
        //     "prev_index_price": 8305.72,
        //     "interest_8h": -0.00009234260068476106,
        //     "interest_1h": -4.739622041017375e-7
        //   }
        //
        const timestamp = this.safeInteger(contract, 'timestamp');
        const datetime = this.iso8601(timestamp);
        const result = this.safeNumber2(contract, 'result', 'interest_8h');
        return {
            'info': contract,
            'symbol': this.safeSymbol(undefined, market),
            'markPrice': undefined,
            'indexPrice': this.safeNumber(contract, 'index_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fundingRate': result,
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': '8h',
        };
    }
    /**
     * @method
     * @name deribit#fetchLiquidations
     * @description retrieves the public liquidations of a trading pair
     * @see https://docs.deribit.com/#public-get_last_settlements_by_currency
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the deribit api endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    async fetchLiquidations(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLiquidations', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchLiquidations', symbol, since, limit, params, 'continuation', 'continuation', undefined);
        }
        const market = this.market(symbol);
        if (market['spot']) {
            throw new errors.NotSupported(this.id + ' fetchLiquidations() does not support ' + market['type'] + ' markets');
        }
        const request = {
            'instrument_name': market['id'],
            'type': 'bankruptcy',
        };
        if (since !== undefined) {
            request['search_start_timestamp'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicGetGetLastSettlementsByInstrument(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "settlements": [
        //                 {
        //                     "type": "bankruptcy",
        //                     "timestamp": 1696579200041,
        //                     "funded": 10000.0,
        //                     "session_bankrupcy": 10000.0
        //                     "session_profit_loss": 112951.68715857354,
        //                     "session_tax": 0.15,
        //                     "session_tax_rate": 0.0015,
        //                     "socialized": 0.001,
        //                 },
        //             ],
        //             "continuation": "5dHzoGyD8Hs8KURoUhfgXgHpJTA5oyapoudSmNeAfEftqRbjNE6jNNUpo2oCu1khnZL9ao"
        //         },
        //         "usIn": 1696652052254890,
        //         "usOut": 1696652052255733,
        //         "usDiff": 843,
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const cursor = this.safeString(result, 'continuation');
        const settlements = this.safeValue(result, 'settlements', []);
        const settlementsWithCursor = this.addPaginationCursorToResult(cursor, settlements);
        return this.parseLiquidations(settlementsWithCursor, market, since, limit);
    }
    addPaginationCursorToResult(cursor, data) {
        if (cursor !== undefined) {
            const dataLength = data.length;
            if (dataLength > 0) {
                const first = data[0];
                const last = data[dataLength - 1];
                first['continuation'] = cursor;
                last['continuation'] = cursor;
                data[0] = first;
                data[dataLength - 1] = last;
            }
        }
        return data;
    }
    /**
     * @method
     * @name deribit#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://docs.deribit.com/#private-get_settlement_history_by_instrument
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the deribit api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    async fetchMyLiquidations(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyLiquidations() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['spot']) {
            throw new errors.NotSupported(this.id + ' fetchMyLiquidations() does not support ' + market['type'] + ' markets');
        }
        const request = {
            'instrument_name': market['id'],
            'type': 'bankruptcy',
        };
        if (since !== undefined) {
            request['search_start_timestamp'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetSettlementHistoryByInstrument(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "settlements": [
        //                 {
        //                     "type": "bankruptcy",
        //                     "timestamp": 1696579200041,
        //                     "funded": 10000.0,
        //                     "session_bankrupcy": 10000.0
        //                     "session_profit_loss": 112951.68715857354,
        //                     "session_tax": 0.15,
        //                     "session_tax_rate": 0.0015,
        //                     "socialized": 0.001,
        //                 },
        //             ],
        //             "continuation": "5dHzoGyD8Hs8KURoUhfgXgHpJTA5oyapoudSmNeAfEftqRbjNE6jNNUpo2oCu1khnZL9ao"
        //         },
        //         "usIn": 1696652052254890,
        //         "usOut": 1696652052255733,
        //         "usDiff": 843,
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const settlements = this.safeList(result, 'settlements', []);
        return this.parseLiquidations(settlements, market, since, limit);
    }
    parseLiquidation(liquidation, market = undefined) {
        //
        //     {
        //         "type": "bankruptcy",
        //         "timestamp": 1696579200041,
        //         "funded": 1,
        //         "session_bankrupcy": 0.001,
        //         "session_profit_loss": 0.001,
        //         "session_tax": 0.0015,
        //         "session_tax_rate": 0.0015,
        //         "socialized": 0.001,
        //     }
        //
        const timestamp = this.safeInteger(liquidation, 'timestamp');
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(undefined, market),
            'contracts': undefined,
            'contractSize': this.safeNumber(market, 'contractSize'),
            'price': undefined,
            'baseValue': this.safeNumber(liquidation, 'session_bankrupcy'),
            'quoteValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    /**
     * @method
     * @name deribit#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://docs.deribit.com/#public-ticker
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    async fetchGreeks(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetTicker(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": {
        //             "estimated_delivery_price": 36552.72,
        //             "best_bid_amount": 0.2,
        //             "best_ask_amount": 9.1,
        //             "interest_rate": 0.0,
        //             "best_bid_price": 0.214,
        //             "best_ask_price": 0.219,
        //             "open_interest": 368.8,
        //             "settlement_price": 0.22103022,
        //             "last_price": 0.215,
        //             "bid_iv": 60.51,
        //             "ask_iv": 61.88,
        //             "mark_iv": 61.27,
        //             "underlying_index": "BTC-27SEP24",
        //             "underlying_price": 38992.71,
        //             "min_price": 0.1515,
        //             "max_price": 0.326,
        //             "mark_price": 0.2168,
        //             "instrument_name": "BTC-27SEP24-40000-C",
        //             "index_price": 36552.72,
        //             "greeks": {
        //                 "rho": 130.63998,
        //                 "theta": -13.48784,
        //                 "vega": 141.90146,
        //                 "gamma": 0.00002,
        //                 "delta": 0.59621
        //             },
        //             "stats": {
        //                 "volume_usd": 100453.9,
        //                 "volume": 12.0,
        //                 "price_change": -2.2727,
        //                 "low": 0.2065,
        //                 "high": 0.238
        //             },
        //             "state": "open",
        //             "timestamp": 1699578548021
        //         },
        //         "usIn": 1699578548308414,
        //         "usOut": 1699578548308606,
        //         "usDiff": 192,
        //         "testnet": false
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseGreeks(result, market);
    }
    parseGreeks(greeks, market = undefined) {
        //
        //     {
        //         "estimated_delivery_price": 36552.72,
        //         "best_bid_amount": 0.2,
        //         "best_ask_amount": 9.1,
        //         "interest_rate": 0.0,
        //         "best_bid_price": 0.214,
        //         "best_ask_price": 0.219,
        //         "open_interest": 368.8,
        //         "settlement_price": 0.22103022,
        //         "last_price": 0.215,
        //         "bid_iv": 60.51,
        //         "ask_iv": 61.88,
        //         "mark_iv": 61.27,
        //         "underlying_index": "BTC-27SEP24",
        //         "underlying_price": 38992.71,
        //         "min_price": 0.1515,
        //         "max_price": 0.326,
        //         "mark_price": 0.2168,
        //         "instrument_name": "BTC-27SEP24-40000-C",
        //         "index_price": 36552.72,
        //         "greeks": {
        //             "rho": 130.63998,
        //             "theta": -13.48784,
        //             "vega": 141.90146,
        //             "gamma": 0.00002,
        //             "delta": 0.59621
        //         },
        //         "stats": {
        //             "volume_usd": 100453.9,
        //             "volume": 12.0,
        //             "price_change": -2.2727,
        //             "low": 0.2065,
        //             "high": 0.238
        //         },
        //         "state": "open",
        //         "timestamp": 1699578548021
        //     }
        //
        const timestamp = this.safeInteger(greeks, 'timestamp');
        const marketId = this.safeString(greeks, 'instrument_name');
        const symbol = this.safeSymbol(marketId, market);
        const stats = this.safeValue(greeks, 'greeks', {});
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'delta': this.safeNumber(stats, 'delta'),
            'gamma': this.safeNumber(stats, 'gamma'),
            'theta': this.safeNumber(stats, 'theta'),
            'vega': this.safeNumber(stats, 'vega'),
            'rho': this.safeNumber(stats, 'rho'),
            'bidSize': this.safeNumber(greeks, 'best_bid_amount'),
            'askSize': this.safeNumber(greeks, 'best_ask_amount'),
            'bidImpliedVolatility': this.safeNumber(greeks, 'bid_iv'),
            'askImpliedVolatility': this.safeNumber(greeks, 'ask_iv'),
            'markImpliedVolatility': this.safeNumber(greeks, 'mark_iv'),
            'bidPrice': this.safeNumber(greeks, 'best_bid_price'),
            'askPrice': this.safeNumber(greeks, 'best_ask_price'),
            'markPrice': this.safeNumber(greeks, 'mark_price'),
            'lastPrice': this.safeNumber(greeks, 'last_price'),
            'underlyingPrice': this.safeNumber(greeks, 'underlying_price'),
            'info': greeks,
        };
    }
    /**
     * @method
     * @name deribit#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://docs.deribit.com/#public-get_book_summary_by_instrument
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    async fetchOption(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetGetBookSummaryByInstrument(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [
        //             {
        //                 "mid_price": 0.04025,
        //                 "volume_usd": 11045.12,
        //                 "quote_currency": "BTC",
        //                 "estimated_delivery_price": 65444.72,
        //                 "creation_timestamp": 1711100949273,
        //                 "base_currency": "BTC",
        //                 "underlying_index": "BTC-27DEC24",
        //                 "underlying_price": 73742.14,
        //                 "volume": 4.0,
        //                 "interest_rate": 0.0,
        //                 "price_change": -6.9767,
        //                 "open_interest": 274.2,
        //                 "ask_price": 0.042,
        //                 "bid_price": 0.0385,
        //                 "instrument_name": "BTC-27DEC24-240000-C",
        //                 "mark_price": 0.04007735,
        //                 "last": 0.04,
        //                 "low": 0.04,
        //                 "high": 0.043
        //             }
        //         ],
        //         "usIn": 1711100949273223,
        //         "usOut": 1711100949273580,
        //         "usDiff": 357,
        //         "testnet": false
        //     }
        //
        const result = this.safeList(response, 'result', []);
        const chain = this.safeDict(result, 0, {});
        return this.parseOption(chain, undefined, market);
    }
    /**
     * @method
     * @name deribit#fetchOptionChain
     * @description fetches data for an underlying asset that is commonly found in an option chain
     * @see https://docs.deribit.com/#public-get_book_summary_by_currency
     * @param {string} code base currency to fetch an option chain for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [option chain structures]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    async fetchOptionChain(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'kind': 'option',
        };
        const response = await this.publicGetGetBookSummaryByCurrency(this.extend(request, params));
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": [
        //             {
        //                 "mid_price": 0.4075,
        //                 "volume_usd": 2836.83,
        //                 "quote_currency": "BTC",
        //                 "estimated_delivery_price": 65479.26,
        //                 "creation_timestamp": 1711101594477,
        //                 "base_currency": "BTC",
        //                 "underlying_index": "BTC-28JUN24",
        //                 "underlying_price": 68827.27,
        //                 "volume": 0.1,
        //                 "interest_rate": 0.0,
        //                 "price_change": 0.0,
        //                 "open_interest": 364.1,
        //                 "ask_price": 0.411,
        //                 "bid_price": 0.404,
        //                 "instrument_name": "BTC-28JUN24-42000-C",
        //                 "mark_price": 0.40752052,
        //                 "last": 0.423,
        //                 "low": 0.423,
        //                 "high": 0.423
        //             }
        //         ],
        //         "usIn": 1711101594456388,
        //         "usOut": 1711101594484065,
        //         "usDiff": 27677,
        //         "testnet": false
        //     }
        //
        const result = this.safeList(response, 'result', []);
        return this.parseOptionChain(result, 'base_currency', 'instrument_name');
    }
    parseOption(chain, currency = undefined, market = undefined) {
        //
        //     {
        //         "mid_price": 0.04025,
        //         "volume_usd": 11045.12,
        //         "quote_currency": "BTC",
        //         "estimated_delivery_price": 65444.72,
        //         "creation_timestamp": 1711100949273,
        //         "base_currency": "BTC",
        //         "underlying_index": "BTC-27DEC24",
        //         "underlying_price": 73742.14,
        //         "volume": 4.0,
        //         "interest_rate": 0.0,
        //         "price_change": -6.9767,
        //         "open_interest": 274.2,
        //         "ask_price": 0.042,
        //         "bid_price": 0.0385,
        //         "instrument_name": "BTC-27DEC24-240000-C",
        //         "mark_price": 0.04007735,
        //         "last": 0.04,
        //         "low": 0.04,
        //         "high": 0.043
        //     }
        //
        const marketId = this.safeString(chain, 'instrument_name');
        market = this.safeMarket(marketId, market);
        const currencyId = this.safeString(chain, 'base_currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeInteger(chain, 'timestamp');
        return {
            'info': chain,
            'currency': code,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'impliedVolatility': undefined,
            'openInterest': this.safeNumber(chain, 'open_interest'),
            'bidPrice': this.safeNumber(chain, 'bid_price'),
            'askPrice': this.safeNumber(chain, 'ask_price'),
            'midPrice': this.safeNumber(chain, 'mid_price'),
            'markPrice': this.safeNumber(chain, 'mark_price'),
            'lastPrice': this.safeNumber(chain, 'last'),
            'underlyingPrice': this.safeNumber(chain, 'underlying_price'),
            'change': undefined,
            'percentage': this.safeNumber(chain, 'price_change'),
            'baseVolume': this.safeNumber(chain, 'volume'),
            'quoteVolume': this.safeNumber(chain, 'volume_usd'),
        };
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + 'api/' + this.version + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys(params).length) {
                request += '?' + this.urlencode(params);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            const nonce = this.nonce().toString();
            const timestamp = this.milliseconds().toString();
            const requestBody = '';
            if (Object.keys(params).length) {
                request += '?' + this.urlencode(params);
            }
            const requestData = method + "\n" + request + "\n" + requestBody + "\n"; // eslint-disable-line quotes
            const auth = timestamp + "\n" + nonce + "\n" + requestData; // eslint-disable-line quotes
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
            headers = {
                'Authorization': 'deri-hmac-sha256 id=' + this.apiKey + ',ts=' + timestamp + ',sig=' + signature + ',' + 'nonce=' + nonce,
            };
        }
        const url = this.urls['api']['rest'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "error": {
        //             "message": "Invalid params",
        //             "data": { reason: "invalid currency", param: "currency" },
        //             "code": -32602
        //         },
        //         "testnet": false,
        //         "usIn": 1583763842150374,
        //         "usOut": 1583763842150410,
        //         "usDiff": 36
        //     }
        //
        const error = this.safeValue(response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString(error, 'code');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions, errorCode, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = deribit;
