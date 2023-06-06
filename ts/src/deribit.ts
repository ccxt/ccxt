
//  ---------------------------------------------------------------------------

import Exchange from './abstract/deribit.js';
import { TICK_SIZE } from './base/functions/number.js';
import { AuthenticationError, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, DDoSProtection, NotSupported, ExchangeNotAvailable, InsufficientFunds, BadRequest, InvalidAddress, OnMaintenance } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import totp from './base/functions/totp.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class deribit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deribit',
            'name': 'Deribit',
            'countries': [ 'NL' ], // Netherlands
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
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchHistoricalVolatility': true,
                'fetchIndexOHLCV': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
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
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
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
                        'get_stop_order_history': 1, // deprecated
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
            'exceptions': {
                // 0 or absent Success, No error.
                '9999': PermissionDenied, // 'api_not_enabled' User didn't enable API for the Account.
                '10000': AuthenticationError, // 'authorization_required' Authorization issue, invalid or absent signature etc.
                '10001': ExchangeError, // 'error' Some general failure, no public information available.
                '10002': InvalidOrder, // 'qty_too_low' Order quantity is too low.
                '10003': InvalidOrder, // 'order_overlap' Rejection, order overlap is found and self-trading is not enabled.
                '10004': OrderNotFound, // 'order_not_found' Attempt to operate with order that can't be found by specified id.
                '10005': InvalidOrder, // 'price_too_low <Limit>' Price is too low, <Limit> defines current limit for the operation.
                '10006': InvalidOrder, // 'price_too_low4idx <Limit>' Price is too low for current index, <Limit> defines current bottom limit for the operation.
                '10007': InvalidOrder, // 'price_too_high <Limit>' Price is too high, <Limit> defines current up limit for the operation.
                '10008': InvalidOrder, // 'price_too_high4idx <Limit>' Price is too high for current index, <Limit> defines current up limit for the operation.
                '10009': InsufficientFunds, // 'not_enough_funds' Account has not enough funds for the operation.
                '10010': OrderNotFound, // 'already_closed' Attempt of doing something with closed order.
                '10011': InvalidOrder, // 'price_not_allowed' This price is not allowed for some reason.
                '10012': InvalidOrder, // 'book_closed' Operation for instrument which order book had been closed.
                '10013': PermissionDenied, // 'pme_max_total_open_orders <Limit>' Total limit of open orders has been exceeded, it is applicable for PME users.
                '10014': PermissionDenied, // 'pme_max_future_open_orders <Limit>' Limit of count of futures' open orders has been exceeded, it is applicable for PME users.
                '10015': PermissionDenied, // 'pme_max_option_open_orders <Limit>' Limit of count of options' open orders has been exceeded, it is applicable for PME users.
                '10016': PermissionDenied, // 'pme_max_future_open_orders_size <Limit>' Limit of size for futures has been exceeded, it is applicable for PME users.
                '10017': PermissionDenied, // 'pme_max_option_open_orders_size <Limit>' Limit of size for options has been exceeded, it is applicable for PME users.
                '10018': PermissionDenied, // 'non_pme_max_future_position_size <Limit>' Limit of size for futures has been exceeded, it is applicable for non-PME users.
                '10019': PermissionDenied, // 'locked_by_admin' Trading is temporary locked by admin.
                '10020': ExchangeError, // 'invalid_or_unsupported_instrument' Instrument name is not valid.
                '10021': InvalidOrder, // 'invalid_amount' Amount is not valid.
                '10022': InvalidOrder, // 'invalid_quantity' quantity was not recognized as a valid number (for API v1).
                '10023': InvalidOrder, // 'invalid_price' price was not recognized as a valid number.
                '10024': InvalidOrder, // 'invalid_max_show' max_show parameter was not recognized as a valid number.
                '10025': InvalidOrder, // 'invalid_order_id' Order id is missing or its format was not recognized as valid.
                '10026': InvalidOrder, // 'price_precision_exceeded' Extra precision of the price is not supported.
                '10027': InvalidOrder, // 'non_integer_contract_amount' Futures contract amount was not recognized as integer.
                '10028': DDoSProtection, // 'too_many_requests' Allowed request rate has been exceeded.
                '10029': OrderNotFound, // 'not_owner_of_order' Attempt to operate with not own order.
                '10030': ExchangeError, // 'must_be_websocket_request' REST request where Websocket is expected.
                '10031': ExchangeError, // 'invalid_args_for_instrument' Some of arguments are not recognized as valid.
                '10032': InvalidOrder, // 'whole_cost_too_low' Total cost is too low.
                '10033': NotSupported, // 'not_implemented' Method is not implemented yet.
                '10034': InvalidOrder, // 'stop_price_too_high' Stop price is too high.
                '10035': InvalidOrder, // 'stop_price_too_low' Stop price is too low.
                '10036': InvalidOrder, // 'invalid_max_show_amount' Max Show Amount is not valid.
                '10040': ExchangeNotAvailable, // 'retry' Request can't be processed right now and should be retried.
                '10041': OnMaintenance, // 'settlement_in_progress' Settlement is in progress. Every day at settlement time for several seconds, the system calculates user profits and updates balances. That time trading is paused for several seconds till the calculation is completed.
                '10043': InvalidOrder, // 'price_wrong_tick' Price has to be rounded to a certain tick size.
                '10044': InvalidOrder, // 'stop_price_wrong_tick' Stop Price has to be rounded to a certain tick size.
                '10045': InvalidOrder, // 'can_not_cancel_liquidation_order' Liquidation order can't be canceled.
                '10046': InvalidOrder, // 'can_not_edit_liquidation_order' Liquidation order can't be edited.
                '10047': DDoSProtection, // 'matching_engine_queue_full' Reached limit of pending Matching Engine requests for user.
                '10048': ExchangeError, // 'not_on_this_server' The requested operation is not available on this server.
                '11008': InvalidOrder, // 'already_filled' This request is not allowed in regards to the filled order.
                '11029': BadRequest, // 'invalid_arguments' Some invalid input has been detected.
                '11030': ExchangeError, // 'other_reject <Reason>' Some rejects which are not considered as very often, more info may be specified in <Reason>.
                '11031': ExchangeError, // 'other_error <Error>' Some errors which are not considered as very often, more info may be specified in <Error>.
                '11035': DDoSProtection, // 'no_more_stops <Limit>' Allowed amount of stop orders has been exceeded.
                '11036': InvalidOrder, // 'invalid_stoppx_for_index_or_last' Invalid StopPx (too high or too low) as to current index or market.
                '11037': BadRequest, // 'outdated_instrument_for_IV_order' Instrument already not available for trading.
                '11038': InvalidOrder, // 'no_adv_for_futures' Advanced orders are not available for futures.
                '11039': InvalidOrder, // 'no_adv_postonly' Advanced post-only orders are not supported yet.
                '11041': InvalidOrder, // 'not_adv_order' Advanced order properties can't be set if the order is not advanced.
                '11042': PermissionDenied, // 'permission_denied' Permission for the operation has been denied.
                '11043': BadRequest, // 'bad_argument' Bad argument has been passed.
                '11044': InvalidOrder, // 'not_open_order' Attempt to do open order operations with the not open order.
                '11045': BadRequest, // 'invalid_event' Event name has not been recognized.
                '11046': BadRequest, // 'outdated_instrument' At several minutes to instrument expiration, corresponding advanced implied volatility orders are not allowed.
                '11047': BadRequest, // 'unsupported_arg_combination' The specified combination of arguments is not supported.
                '11048': ExchangeError, // 'wrong_max_show_for_option' Wrong Max Show for options.
                '11049': BadRequest, // 'bad_arguments' Several bad arguments have been passed.
                '11050': BadRequest, // 'bad_request' Request has not been parsed properly.
                '11051': OnMaintenance, // 'system_maintenance' System is under maintenance.
                '11052': ExchangeError, // 'subscribe_error_unsubscribed' Subscription error. However, subscription may fail without this error, please check list of subscribed channels returned, as some channels can be not subscribed due to wrong input or lack of permissions.
                '11053': ExchangeError, // 'transfer_not_found' Specified transfer is not found.
                '11090': InvalidAddress, // 'invalid_addr' Invalid address.
                '11091': InvalidAddress, // 'invalid_transfer_address' Invalid addres for the transfer.
                '11092': InvalidAddress, // 'address_already_exist' The address already exists.
                '11093': DDoSProtection, // 'max_addr_count_exceeded' Limit of allowed addresses has been reached.
                '11094': ExchangeError, // 'internal_server_error' Some unhandled error on server. Please report to admin. The details of the request will help to locate the problem.
                '11095': ExchangeError, // 'disabled_deposit_address_creation' Deposit address creation has been disabled by admin.
                '11096': ExchangeError, // 'address_belongs_to_user' Withdrawal instead of transfer.
                '12000': AuthenticationError, // 'bad_tfa' Wrong TFA code
                '12001': DDoSProtection, // 'too_many_subaccounts' Limit of subbacounts is reached.
                '12002': ExchangeError, // 'wrong_subaccount_name' The input is not allowed as name of subaccount.
                '12998': AuthenticationError, // 'tfa_over_limit' The number of failed TFA attempts is limited.
                '12003': AuthenticationError, // 'login_over_limit' The number of failed login attempts is limited.
                '12004': AuthenticationError, // 'registration_over_limit' The number of registration requests is limited.
                '12005': AuthenticationError, // 'country_is_banned' The country is banned (possibly via IP check).
                '12100': ExchangeError, // 'transfer_not_allowed' Transfer is not allowed. Possible wrong direction or other mistake.
                '12999': AuthenticationError, // 'tfa_used' TFA code is correct but it is already used. Please, use next code.
                '13000': AuthenticationError, // 'invalid_login' Login name is invalid (not allowed or it contains wrong characters).
                '13001': AuthenticationError, // 'account_not_activated' Account must be activated.
                '13002': PermissionDenied, // 'account_blocked' Account is blocked by admin.
                '13003': AuthenticationError, // 'tfa_required' This action requires TFA authentication.
                '13004': AuthenticationError, // 'invalid_credentials' Invalid credentials has been used.
                '13005': AuthenticationError, // 'pwd_match_error' Password confirmation error.
                '13006': AuthenticationError, // 'security_error' Invalid Security Code.
                '13007': AuthenticationError, // 'user_not_found' User's security code has been changed or wrong.
                '13008': ExchangeError, // 'request_failed' Request failed because of invalid input or internal failure.
                '13009': AuthenticationError, // 'unauthorized' Wrong or expired authorization token or bad signature. For example, please check scope of the token, 'connection' scope can't be reused for other connections.
                '13010': BadRequest, // 'value_required' Invalid input, missing value.
                '13011': BadRequest, // 'value_too_short' Input is too short.
                '13012': PermissionDenied, // 'unavailable_in_subaccount' Subaccount restrictions.
                '13013': BadRequest, // 'invalid_phone_number' Unsupported or invalid phone number.
                '13014': BadRequest, // 'cannot_send_sms' SMS sending failed -- phone number is wrong.
                '13015': BadRequest, // 'invalid_sms_code' Invalid SMS code.
                '13016': BadRequest, // 'invalid_input' Invalid input.
                '13017': ExchangeError, // 'subscription_failed' Subscription hailed, invalid subscription parameters.
                '13018': ExchangeError, // 'invalid_content_type' Invalid content type of the request.
                '13019': ExchangeError, // 'orderbook_closed' Closed, expired order book.
                '13020': ExchangeError, // 'not_found' Instrument is not found, invalid instrument name.
                '13021': PermissionDenied, // 'forbidden' Not enough permissions to execute the request, forbidden.
                '13025': ExchangeError, // 'method_switched_off_by_admin' API method temporarily switched off by administrator.
                '-32602': BadRequest, // 'Invalid params' see JSON-RPC spec.
                '-32601': BadRequest, // 'Method not found' see JSON-RPC spec.
                '-32700': BadRequest, // 'Parse error' see JSON-RPC spec.
                '-32000': BadRequest, // 'Missing params' see JSON-RPC spec.
                '11054': InvalidOrder, // 'post_only_reject' post order would be filled immediately
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'code': 'BTC',
                'fetchBalance': {
                    'code': 'BTC',
                },
                'fetchPositions': {
                    'code': 'BTC',
                },
                'transfer': {
                    'method': 'privateGetSubmitTransferToSubaccount', // or 'privateGetSubmitTransferToUser'
                },
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name deribit#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetGetTime (params);
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: 1583922446019,
        //         usIn: 1583922446019955,
        //         usOut: 1583922446019956,
        //         usDiff: 1,
        //         testnet: false
        //     }
        //
        return this.safeInteger (response, 'result');
    }

    codeFromOptions (methodName, params = {}) {
        const defaultCode = this.safeValue (this.options, 'code', 'BTC');
        const options = this.safeValue (this.options, methodName, {});
        const code = this.safeValue (options, 'code', defaultCode);
        return this.safeValue (params, 'code', code);
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name deribit#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.publicGetStatus (params);
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
        const result = this.safeValue (response, 'result');
        const locked = this.safeString (result, 'locked');
        const updateTime = this.safeIntegerProduct (response, 'usIn', 0.001, this.milliseconds ());
        return {
            'status': (locked === 'false') ? 'ok' : 'maintenance',
            'updated': updateTime,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchAccounts (params = {}) {
        /**
         * @method
         * @name deribit#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
         */
        await this.loadMarkets ();
        const response = await this.privateGetGetSubaccounts (params);
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: [{
        //                 username: 'someusername',
        //                 type: 'main',
        //                 system_name: 'someusername',
        //                 security_keys_enabled: false,
        //                 security_keys_assignments: [],
        //                 receive_notifications: false,
        //                 login_enabled: true,
        //                 is_password: true,
        //                 id: '238216',
        //                 email: 'pablo@abcdef.com'
        //             },
        //             {
        //                 username: 'someusername_1',
        //                 type: 'subaccount',
        //                 system_name: 'someusername_1',
        //                 security_keys_enabled: false,
        //                 security_keys_assignments: [],
        //                 receive_notifications: false,
        //                 login_enabled: false,
        //                 is_password: false,
        //                 id: '245499',
        //                 email: 'pablo@abcdef.com'
        //             }
        //         ],
        //         usIn: '1652736468292006',
        //         usOut: '1652736468292377',
        //         usDiff: '371',
        //         testnet: false
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseAccounts (result);
    }

    parseAccount (account, currency = undefined) {
        //
        //      {
        //          username: 'someusername_1',
        //          type: 'subaccount',
        //          system_name: 'someusername_1',
        //          security_keys_enabled: false,
        //          security_keys_assignments: [],
        //          receive_notifications: false,
        //          login_enabled: false,
        //          is_password: false,
        //          id: '245499',
        //          email: 'pablo@abcdef.com'
        //      }
        //
        return {
            'info': account,
            'id': this.safeString (account, 'id'),
            'type': this.safeString (account, 'type'),
            'code': this.safeCurrencyCode (undefined, currency),
        };
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name deribit#fetchMarkets
         * @description retrieves data on all markets for deribit
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const currenciesResponse = await this.publicGetGetCurrencies (params);
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: [
        //             {
        //                 withdrawal_priorities: [
        //                     { value: 0.15, name: 'very_low' },
        //                     { value: 1.5, name: 'very_high' },
        //                 ],
        //                 withdrawal_fee: 0.0005,
        //                 min_withdrawal_fee: 0.0005,
        //                 min_confirmations: 1,
        //                 fee_precision: 4,
        //                 currency_long: 'Bitcoin',
        //                 currency: 'BTC',
        //                 coin_type: 'BITCOIN'
        //             }
        //         ],
        //         usIn: 1583761588590479,
        //         usOut: 1583761588590544,
        //         usDiff: 65,
        //         testnet: false
        //     }
        //
        const currenciesResult = this.safeValue (currenciesResponse, 'result', []);
        const result = [];
        for (let i = 0; i < currenciesResult.length; i++) {
            const currencyId = this.safeString (currenciesResult[i], 'currency');
            const request = {
                'currency': currencyId,
            };
            const instrumentsResponse = await this.publicGetGetInstruments (this.extend (request, params));
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
            const instrumentsResult = this.safeValue (instrumentsResponse, 'result', []);
            for (let k = 0; k < instrumentsResult.length; k++) {
                const market = instrumentsResult[k];
                const kind = this.safeString (market, 'kind');
                const isSpot = (kind === 'spot');
                const id = this.safeString (market, 'instrument_name');
                const baseId = this.safeString (market, 'base_currency');
                const quoteId = this.safeString (market, 'counter_currency');
                const settleId = this.safeString (market, 'settlement_currency');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const settle = this.safeCurrencyCode (settleId);
                const settlementPeriod = this.safeValue (market, 'settlement_period');
                const swap = (settlementPeriod === 'perpetual');
                const future = !swap && (kind.indexOf ('future') >= 0);
                const option = (kind.indexOf ('option') >= 0);
                const isComboMarket = kind.indexOf ('combo') >= 0;
                const expiry = this.safeInteger (market, 'expiration_timestamp');
                let strike = undefined;
                let optionType = undefined;
                let symbol = id;
                let type = 'swap';
                if (future) {
                    type = 'future';
                } else if (option) {
                    type = 'option';
                } else if (isSpot) {
                    type = 'spot';
                }
                if (isSpot) {
                    symbol = base + '/' + quote;
                } else if (!isComboMarket) {
                    symbol = base + '/' + quote + ':' + settle;
                    if (option || future) {
                        symbol = symbol + '-' + this.yymmdd (expiry, '');
                        if (option) {
                            strike = this.safeNumber (market, 'strike');
                            optionType = this.safeString (market, 'option_type');
                            const letter = (optionType === 'call') ? 'C' : 'P';
                            symbol = symbol + '-' + this.numberToString (strike) + '-' + letter;
                        }
                    }
                }
                const minTradeAmount = this.safeNumber (market, 'min_trade_amount');
                const tickSize = this.safeNumber (market, 'tick_size');
                result.push ({
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
                    'active': this.safeValue (market, 'is_active'),
                    'contract': !isSpot,
                    'linear': (settle === quote),
                    'inverse': (settle !== quote),
                    'taker': this.safeNumber (market, 'taker_commission'),
                    'maker': this.safeNumber (market, 'maker_commission'),
                    'contractSize': this.safeNumber (market, 'contract_size'),
                    'expiry': expiry,
                    'expiryDatetime': this.iso8601 (expiry),
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
                    'info': market,
                });
            }
        }
        return result;
    }

    parseBalance (balance) {
        const result = {
            'info': balance,
        };
        const currencyId = this.safeString (balance, 'currency');
        const currencyCode = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (balance, 'available_funds');
        account['used'] = this.safeString (balance, 'maintenance_margin');
        account['total'] = this.safeString (balance, 'equity');
        result[currencyCode] = account;
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name deribit#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const code = this.codeFromOptions ('fetchBalance', params);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetGetAccountSummary (this.extend (request, params));
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: {
        //             total_pl: 0,
        //             session_upl: 0,
        //             session_rpl: 0,
        //             session_funding: 0,
        //             portfolio_margining_enabled: false,
        //             options_vega: 0,
        //             options_theta: 0,
        //             options_session_upl: 0,
        //             options_session_rpl: 0,
        //             options_pl: 0,
        //             options_gamma: 0,
        //             options_delta: 0,
        //             margin_balance: 0.00062359,
        //             maintenance_margin: 0,
        //             limits: {
        //                 non_matching_engine_burst: 300,
        //                 non_matching_engine: 200,
        //                 matching_engine_burst: 20,
        //                 matching_engine: 2
        //             },
        //             initial_margin: 0,
        //             futures_session_upl: 0,
        //             futures_session_rpl: 0,
        //             futures_pl: 0,
        //             equity: 0.00062359,
        //             deposit_address: '13tUtNsJSZa1F5GeCmwBywVrymHpZispzw',
        //             delta_total: 0,
        //             currency: 'BTC',
        //             balance: 0.00062359,
        //             available_withdrawal_funds: 0.00062359,
        //             available_funds: 0.00062359
        //         },
        //         usIn: 1583775838115975,
        //         usOut: 1583775838116520,
        //         usDiff: 545,
        //         testnet: false
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseBalance (result);
    }

    async createDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name deribit#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetCreateDepositAddress (this.extend (request, params));
        //
        //     {
        //         'jsonrpc': '2.0',
        //         'id': 7538,
        //         'result': {
        //             'address': '2N8udZGBc1hLRCFsU9kGwMPpmYUwMFTuCwB',
        //             'creation_timestamp': 1550575165170,
        //             'currency': 'BTC',
        //             'type': 'deposit'
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const address = this.safeString (result, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name deribit#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetGetCurrentDepositAddress (this.extend (request, params));
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: {
        //             type: 'deposit',
        //             status: 'ready',
        //             requires_confirmation: true,
        //             currency: 'BTC',
        //             creation_timestamp: 1514694684651,
        //             address: '13tUtNsJSZa1F5GeCmwBywVrymHpZispzw'
        //         },
        //         usIn: 1583785137274288,
        //         usOut: 1583785137274454,
        //         usDiff: 166,
        //         testnet: false
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const address = this.safeString (result, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': response,
        };
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker /public/ticker
        //
        //     {
        //         timestamp: 1583778859480,
        //         stats: { volume: 60627.57263769, low: 7631.5, high: 8311.5 },
        //         state: 'open',
        //         settlement_price: 7903.21,
        //         open_interest: 111543850,
        //         min_price: 7634,
        //         max_price: 7866.51,
        //         mark_price: 7750.02,
        //         last_price: 7750.5,
        //         instrument_name: 'BTC-PERPETUAL',
        //         index_price: 7748.01,
        //         funding_8h: 0.0000026,
        //         current_funding: 0,
        //         best_bid_price: 7750,
        //         best_bid_amount: 19470,
        //         best_ask_price: 7750.5,
        //         best_ask_amount: 343280
        //     }
        //
        // fetchTicker /public/get_book_summary_by_instrument
        // fetchTickers /public/get_book_summary_by_currency
        //
        //     {
        //         volume: 124.1,
        //         underlying_price: 7856.445926872601,
        //         underlying_index: 'SYN.BTC-10MAR20',
        //         quote_currency: 'USD',
        //         open_interest: 121.8,
        //         mid_price: 0.01975,
        //         mark_price: 0.01984559,
        //         low: 0.0095,
        //         last: 0.0205,
        //         interest_rate: 0,
        //         instrument_name: 'BTC-10MAR20-7750-C',
        //         high: 0.0295,
        //         estimated_delivery_price: 7856.29,
        //         creation_timestamp: 1583783678366,
        //         bid_price: 0.0185,
        //         base_currency: 'BTC',
        //         ask_price: 0.021
        //     },
        //
        const timestamp = this.safeInteger2 (ticker, 'timestamp', 'creation_timestamp');
        const marketId = this.safeString (ticker, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString2 (ticker, 'last_price', 'last');
        const stats = this.safeValue (ticker, 'stats', ticker);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString2 (stats, 'high', 'max_price'),
            'low': this.safeString2 (stats, 'low', 'min_price'),
            'bid': this.safeString2 (ticker, 'best_bid_price', 'bid_price'),
            'bidVolume': this.safeString (ticker, 'best_bid_amount'),
            'ask': this.safeString2 (ticker, 'best_ask_price', 'ask_price'),
            'askVolume': this.safeString (ticker, 'best_ask_amount'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (stats, 'volume'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name deribit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: {
        //             timestamp: 1583778859480,
        //             stats: { volume: 60627.57263769, low: 7631.5, high: 8311.5 },
        //             state: 'open',
        //             settlement_price: 7903.21,
        //             open_interest: 111543850,
        //             min_price: 7634,
        //             max_price: 7866.51,
        //             mark_price: 7750.02,
        //             last_price: 7750.5,
        //             instrument_name: 'BTC-PERPETUAL',
        //             index_price: 7748.01,
        //             funding_8h: 0.0000026,
        //             current_funding: 0,
        //             best_bid_price: 7750,
        //             best_bid_amount: 19470,
        //             best_ask_price: 7750.5,
        //             best_ask_amount: 343280
        //         },
        //         usIn: 1583778859483941,
        //         usOut: 1583778859484075,
        //         usDiff: 134,
        //         testnet: false
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parseTicker (result, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const code = this.codeFromOptions ('fetchTickers', params);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.publicGetGetBookSummaryByCurrency (this.extend (request, params));
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: [
        //             {
        //                 volume: 124.1,
        //                 underlying_price: 7856.445926872601,
        //                 underlying_index: 'SYN.BTC-10MAR20',
        //                 quote_currency: 'USD',
        //                 open_interest: 121.8,
        //                 mid_price: 0.01975,
        //                 mark_price: 0.01984559,
        //                 low: 0.0095,
        //                 last: 0.0205,
        //                 interest_rate: 0,
        //                 instrument_name: 'BTC-10MAR20-7750-C',
        //                 high: 0.0295,
        //                 estimated_delivery_price: 7856.29,
        //                 creation_timestamp: 1583783678366,
        //                 bid_price: 0.0185,
        //                 base_currency: 'BTC',
        //                 ask_price: 0.021
        //             },
        //         ],
        //         usIn: 1583783678361966,
        //         usOut: 1583783678372069,
        //         usDiff: 10103,
        //         testnet: false
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const tickers = {};
        for (let i = 0; i < result.length; i++) {
            const ticker = this.parseTicker (result[i]);
            const symbol = ticker['symbol'];
            tickers[symbol] = ticker;
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.milliseconds ();
        if (since === undefined) {
            if (limit === undefined) {
                limit = 1000; // at max, it provides 5000 bars, but we set generous default here
            }
            request['start_timestamp'] = now - (limit - 1) * duration * 1000;
            request['end_timestamp'] = now;
        } else {
            request['start_timestamp'] = since;
            if (limit === undefined) {
                request['end_timestamp'] = now;
            } else {
                request['end_timestamp'] = this.sum (since, limit * duration * 1000);
            }
        }
        const response = await this.publicGetGetTradingviewChartData (this.extend (request, params));
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: {
        //             volume: [ 3.6680847969999992, 22.682721123, 3.011587939, 0 ],
        //             ticks: [ 1583916960000, 1583917020000, 1583917080000, 1583917140000 ],
        //             status: 'ok',
        //             open: [ 7834, 7839, 7833.5, 7833 ],
        //             low: [ 7834, 7833.5, 7832.5, 7833 ],
        //             high: [ 7839.5, 7839, 7833.5, 7833 ],
        //             cost: [ 28740, 177740, 23590, 0 ],
        //             close: [ 7839.5, 7833.5, 7833, 7833 ]
        //         },
        //         usIn: 1583917166709801,
        //         usOut: 1583917166710175,
        //         usDiff: 374,
        //         testnet: false
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const ohlcvs = this.convertTradingViewToOHLCV (result, 'ticks', 'open', 'high', 'low', 'close', 'volume', true);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
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
        const id = this.safeString (trade, 'trade_id');
        const marketId = this.safeString (trade, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeString (trade, 'direction');
        const priceString = this.safeString (trade, 'price');
        market = this.safeMarket (marketId, market);
        // Amount for inverse perpetual and futures is in USD which in ccxt is the cost
        // For options amount and linear is in corresponding cryptocurrency contracts, e.g., BTC or ETH
        const amount = this.safeString (trade, 'amount');
        let cost = Precise.stringMul (amount, priceString);
        if (market['inverse']) {
            cost = Precise.stringDiv (amount, priceString);
        }
        const liquidity = this.safeString (trade, 'liquidity');
        let takerOrMaker = undefined;
        if (liquidity !== undefined) {
            // M = maker, T = taker, MT = both
            takerOrMaker = (liquidity === 'M') ? 'maker' : 'taker';
        }
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'order_id'),
            'type': this.safeString (trade, 'order_type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchTrades
         * @see https://docs.deribit.com/#private-get_user_trades_by_currency
         * @description get the list of most recent trades for a particular symbol.
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            'include_old': true,
        };
        const method = (since === undefined) ? 'publicGetGetLastTradesByInstrument' : 'publicGetGetLastTradesByInstrumentAndTime';
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit; // default 10
        }
        const response = await this[method] (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name deribit#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const code = this.codeFromOptions ('fetchTradingFees', params);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'extended': true,
        };
        const response = await this.privateGetGetAccountSummary (this.extend (request, params));
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: {
        //             total_pl: 0,
        //             session_upl: 0,
        //             session_rpl: 0,
        //             session_funding: 0,
        //             portfolio_margining_enabled: false,
        //             options_vega: 0,
        //             options_theta: 0,
        //             options_session_upl: 0,
        //             options_session_rpl: 0,
        //             options_pl: 0,
        //             options_gamma: 0,
        //             options_delta: 0,
        //             margin_balance: 0.00062359,
        //             maintenance_margin: 0,
        //             limits: {
        //                 non_matching_engine_burst: 300,
        //                 non_matching_engine: 200,
        //                 matching_engine_burst: 20,
        //                 matching_engine: 2
        //             },
        //             initial_margin: 0,
        //             futures_session_upl: 0,
        //             futures_session_rpl: 0,
        //             futures_pl: 0,
        //             equity: 0.00062359,
        //             deposit_address: '13tUtNsJSZa1F5GeCmwBywVrymHpZispzw',
        //             delta_total: 0,
        //             currency: 'BTC',
        //             balance: 0.00062359,
        //             available_withdrawal_funds: 0.00062359,
        //             available_funds: 0.00062359,
        //             fees: [
        //                 currency: '',
        //                 instrument_type: 'perpetual',
        //                 fee_type: 'relative',
        //                 maker_fee: 0,
        //                 taker_fee: 0,
        //             ],
        //         },
        //         usIn: 1583775838115975,
        //         usOut: 1583775838116520,
        //         usDiff: 545,
        //         testnet: false
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const fees = this.safeValue (result, 'fees', []);
        let perpetualFee = {};
        let futureFee = {};
        let optionFee = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            const instrumentType = this.safeString (fee, 'instrument_type');
            if (instrumentType === 'future') {
                futureFee = {
                    'info': fee,
                    'maker': this.safeNumber (fee, 'maker_fee'),
                    'taker': this.safeNumber (fee, 'taker_fee'),
                };
            } else if (instrumentType === 'perpetual') {
                perpetualFee = {
                    'info': fee,
                    'maker': this.safeNumber (fee, 'maker_fee'),
                    'taker': this.safeNumber (fee, 'taker_fee'),
                };
            } else if (instrumentType === 'option') {
                optionFee = {
                    'info': fee,
                    'maker': this.safeNumber (fee, 'maker_fee'),
                    'taker': this.safeNumber (fee, 'taker_fee'),
                };
            }
        }
        const parsedFees = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            let fee = {
                'info': market,
                'symbol': symbol,
                'percentage': true,
                'tierBased': true,
                'maker': market['maker'],
                'taker': market['taker'],
            };
            if (market['swap']) {
                fee = this.extend (fee, perpetualFee);
            } else if (market['future']) {
                fee = this.extend (fee, futureFee);
            } else if (market['option']) {
                fee = this.extend (fee, optionFee);
            }
            parsedFees[symbol] = fee;
        }
        return parsedFees;
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        //
        //     {
        //         jsonrpc: '2.0',
        //         result: {
        //             timestamp: 1583781354740,
        //             stats: { volume: 61249.66735634, low: 7631.5, high: 8311.5 },
        //             state: 'open',
        //             settlement_price: 7903.21,
        //             open_interest: 111536690,
        //             min_price: 7695.13,
        //             max_price: 7929.49,
        //             mark_price: 7813.06,
        //             last_price: 7814.5,
        //             instrument_name: 'BTC-PERPETUAL',
        //             index_price: 7810.12,
        //             funding_8h: 0.0000031,
        //             current_funding: 0,
        //             change_id: 17538025952,
        //             bids: [
        //                 [7814, 351820],
        //                 [7813.5, 207490],
        //                 [7813, 32160],
        //             ],
        //             best_bid_price: 7814,
        //             best_bid_amount: 351820,
        //             best_ask_price: 7814.5,
        //             best_ask_amount: 11880,
        //             asks: [
        //                 [7814.5, 11880],
        //                 [7815, 18100],
        //                 [7815.5, 2640],
        //             ],
        //         },
        //         usIn: 1583781354745804,
        //         usOut: 1583781354745932,
        //         usDiff: 128,
        //         testnet: false
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const timestamp = this.safeInteger (result, 'timestamp');
        const nonce = this.safeInteger (result, 'change_id');
        const orderbook = this.parseOrderBook (result, market['symbol'], timestamp);
        orderbook['nonce'] = nonce;
        return orderbook;
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
            'rejected': 'rejected',
            'untriggered': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'good_til_cancelled': 'GTC',
            'fill_or_kill': 'FOK',
            'immediate_or_cancel': 'IOC',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrderType (orderType) {
        const orderTypes = {
            'stop_limit': 'limit',
            'take_limit': 'limit',
            'stop_market': 'market',
            'take_market': 'market',
        };
        return this.safeString (orderTypes, orderType, orderType);
    }

    parseOrder (order, market = undefined) {
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
        const marketId = this.safeString (order, 'instrument_name');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'creation_timestamp');
        const lastUpdate = this.safeInteger (order, 'last_update_timestamp');
        const id = this.safeString (order, 'order_id');
        let priceString = this.safeString (order, 'price');
        if (priceString === 'market_price') {
            priceString = undefined;
        }
        const averageString = this.safeString (order, 'average_price');
        // Inverse contracts amount is in USD which in ccxt is the cost
        // For options and Linear contracts amount is in corresponding cryptocurrency, e.g., BTC or ETH
        const filledString = this.safeString (order, 'filled_amount');
        const amount = this.safeString (order, 'amount');
        let cost = Precise.stringMul (filledString, averageString);
        if (market['inverse']) {
            if (this.parseNumber (averageString) !== 0) {
                cost = Precise.stringDiv (amount, averageString);
            }
        }
        let lastTradeTimestamp = undefined;
        if (filledString !== undefined) {
            const isFilledPositive = Precise.stringGt (filledString, '0');
            if (isFilledPositive) {
                lastTradeTimestamp = lastUpdate;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'order_state'));
        const side = this.safeStringLower (order, 'direction');
        let feeCostString = this.safeString (order, 'commission');
        let fee = undefined;
        if (feeCostString !== undefined) {
            feeCostString = Precise.stringAbs (feeCostString);
            fee = {
                'cost': feeCostString,
                'currency': market['base'],
            };
        }
        const rawType = this.safeString (order, 'order_type');
        const type = this.parseOrderType (rawType);
        // injected in createOrder
        const trades = this.safeValue (order, 'trades');
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'time_in_force'));
        const stopPrice = this.safeValue (order, 'stop_price');
        const postOnly = this.safeValue (order, 'post_only');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': priceString,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
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

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetGetOrderState (this.extend (request, params));
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
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name deribit#createOrder
         * @description create a trade order
         * @see https://docs.deribit.com/#private-buy
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade. For perpetual and futures the amount is in USD. For options it is in corresponding cryptocurrency contracts currency.
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['inverse']) {
            amount = this.amountToPrecision (symbol, amount);
        } else if (market['settle'] === 'USDC') {
            amount = this.amountToPrecision (symbol, amount);
        } else {
            amount = this.currencyToPrecision (symbol, amount);
        }
        const request = {
            'instrument_name': market['id'],
            // for perpetual and futures the amount is in USD
            // for options it is in corresponding cryptocurrency contracts, e.g., BTC or ETH
            'amount': amount,
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
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        const reduceOnly = this.safeValue2 (params, 'reduceOnly', 'reduce_only');
        // only stop loss sell orders are allowed when price crossed from above
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        // only take profit buy orders are allowed when price crossed from below
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isStopLimit = type === 'stop_limit';
        const isStopMarket = type === 'stop_market';
        const isTakeLimit = type === 'take_limit';
        const isTakeMarket = type === 'take_market';
        const isStopLossOrder = isStopLimit || isStopMarket || (stopLossPrice !== undefined);
        const isTakeProfitOrder = isTakeLimit || isTakeMarket || (takeProfitPrice !== undefined);
        if (isStopLossOrder && isTakeProfitOrder) {
            throw new InvalidOrder (this.id + ' createOrder () only allows one of stopLossPrice or takeProfitPrice to be specified');
        }
        const isStopOrder = isStopLossOrder || isTakeProfitOrder;
        const isLimitOrder = (type === 'limit') || isStopLimit || isTakeLimit;
        const isMarketOrder = (type === 'market') || isStopMarket || isTakeMarket;
        const exchangeSpecificPostOnly = this.safeValue (params, 'post_only');
        const postOnly = this.isPostOnly (isMarketOrder, exchangeSpecificPostOnly, params);
        if (isLimitOrder) {
            request['type'] = 'limit';
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['type'] = 'market';
        }
        if (isStopOrder) {
            const triggerPrice = (stopLossPrice !== undefined) ? stopLossPrice : takeProfitPrice;
            request['trigger_price'] = this.priceToPrecision (symbol, triggerPrice);
            request['trigger'] = 'last_price'; // required
            if (isStopLossOrder) {
                if (isMarketOrder) {
                    // stop_market (sell only)
                    request['type'] = 'stop_market';
                } else {
                    // stop_limit (sell only)
                    request['type'] = 'stop_limit';
                }
            } else {
                if (isMarketOrder) {
                    // take_market (buy only)
                    request['type'] = 'take_market';
                } else {
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
        const method = 'privateGet' + this.capitalize (side);
        params = this.omit (params, [ 'timeInForce', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'reduceOnly' ]);
        const response = await this[method] (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const order = this.safeValue (result, 'order');
        const trades = this.safeValue (result, 'trades', []);
        order['trades'] = trades;
        return this.parseOrder (order, market);
    }

    async editOrder (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount argument');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a price argument');
        }
        await this.loadMarkets ();
        const request = {
            'order_id': id,
            // for perpetual and futures the amount is in USD
            // for options it is in corresponding cryptocurrency contracts, e.g., BTC or ETH
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price), // required
            // 'post_only': false, // if the new price would cause the order to be filled immediately (as taker), the price will be changed to be just below the spread.
            // 'reject_post_only': false, // if true the order is put to order book unmodified or request is rejected
            // 'reduce_only': false, // if true, the order is intended to only reduce a current position
            // 'stop_price': false, // stop price, required for stop_limit orders
            // 'advanced': 'usd', // 'implv', advanced option order type, options only
        };
        const response = await this.privateGetEdit (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const order = this.safeValue (result, 'order');
        const trades = this.safeValue (result, 'trades', []);
        order['trades'] = trades;
        return this.parseOrder (order);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name deribit#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by deribit cancelOrder ()
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetCancel (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name deribit#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let method = undefined;
        if (symbol === undefined) {
            method = 'privateGetCancelAll';
        } else {
            method = 'privateGetCancelAllByInstrument';
            const market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let method = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions ('fetchOpenOrders', params);
            const currency = this.currency (code);
            request['currency'] = currency['id'];
            method = 'privateGetGetOpenOrdersByCurrency';
        } else {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
            method = 'privateGetGetOpenOrdersByInstrument';
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let method = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions ('fetchClosedOrders', params);
            const currency = this.currency (code);
            request['currency'] = currency['id'];
            method = 'privateGetGetOrderHistoryByCurrency';
        } else {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
            method = 'privateGetGetOrderHistoryByInstrument';
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetGetUserTradesByOrder (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        return this.parseTrades (result, undefined, since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            'include_old': true,
        };
        let market = undefined;
        let method = undefined;
        if (symbol === undefined) {
            const code = this.codeFromOptions ('fetchMyTrades', params);
            const currency = this.currency (code);
            request['currency'] = currency['id'];
            if (since === undefined) {
                method = 'privateGetGetUserTradesByCurrency';
            } else {
                method = 'privateGetGetUserTradesByCurrencyAndTime';
                request['start_timestamp'] = since;
            }
        } else {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
            if (since === undefined) {
                method = 'privateGetGetUserTradesByInstrument';
            } else {
                method = 'privateGetGetUserTradesByInstrumentAndTime';
                request['start_timestamp'] = since;
            }
        }
        if (limit !== undefined) {
            request['count'] = limit; // default 10
        }
        const response = await this[method] (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetDeposits (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetWithdrawals (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'completed': 'ok',
            'unconfirmed': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
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
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger2 (transaction, 'created_timestamp', 'received_timestamp');
        const updated = this.safeInteger (transaction, 'updated_timestamp');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const address = this.safeString (transaction, 'address');
        const feeCost = this.safeNumber (transaction, 'fee');
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
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'transaction_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parsePosition (position, market = undefined) {
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
        const contract = this.safeString (position, 'instrument_name');
        market = this.safeMarket (contract, market);
        let side = this.safeString (position, 'direction');
        side = (side === 'buy') ? 'long' : 'short';
        const unrealizedPnl = this.safeString (position, 'floating_profit_loss');
        const initialMarginString = this.safeString (position, 'initial_margin');
        const notionalString = this.safeString (position, 'size_currency');
        const maintenanceMarginString = this.safeString (position, 'maintenance_margin');
        const currentTime = this.milliseconds ();
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (Precise.stringMul (Precise.stringDiv (initialMarginString, notionalString), '100')),
            'maintenanceMargin': this.parseNumber (maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber (Precise.stringMul (Precise.stringDiv (maintenanceMarginString, notionalString), '100')),
            'entryPrice': this.safeNumber (position, 'average_price'),
            'notional': this.parseNumber (notionalString),
            'leverage': this.safeInteger (position, 'leverage'),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'contracts': undefined,
            'contractSize': this.safeNumber (market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'estimated_liquidation_price'),
            'markPrice': this.safeNumber (position, 'mark_price'),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
        });
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name deribit#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privateGetGetPosition (this.extend (request, params));
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
        const result = this.safeValue (response, 'result');
        return this.parsePosition (result);
    }

    async fetchPositions (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        let code = undefined;
        if (symbols === undefined) {
            code = this.codeFromOptions ('fetchPositions', params);
        } else if (typeof symbols === 'string') {
            code = symbols;
            symbols = undefined; // fix https://github.com/ccxt/ccxt/issues/13961
        } else {
            if (Array.isArray (symbols)) {
                const length = symbols.length;
                if (length !== 1) {
                    throw new BadRequest (this.id + ' fetchPositions() symbols argument cannot contain more than 1 symbol');
                }
                const market = this.market (symbols[0]);
                code = market['base'];
            }
        }
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            // "kind" : "future", "option"
        };
        const response = await this.privateGetGetPositions (this.extend (request, params));
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
        const result = this.safeValue (response, 'result');
        return this.parsePositions (result, symbols);
    }

    async fetchHistoricalVolatility (code: string, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.publicGetGetHistoricalVolatility (this.extend (request, params));
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
        const volatilityResult = this.safeValue (response, 'result', {});
        const result = [];
        for (let i = 0; i < volatilityResult.length; i++) {
            const timestamp = this.safeInteger (volatilityResult[i], 0);
            const volatility = this.safeNumber (volatilityResult[i], 1);
            result.push ({
                'info': response,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'volatility': volatility,
            });
        }
        return result;
    }

    async fetchTransfers (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @param {string} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetGetTransfers (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const transfers = this.safeValue (result, 'data', []);
        return this.parseTransfers (transfers, currency, since, limit, params);
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name deribit#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
            'currency': currency['id'],
            'destination': toAccount,
        };
        let method = this.safeString (params, 'method');
        params = this.omit (params, 'method');
        if (method === undefined) {
            const transferOptions = this.safeValue (this.options, 'transfer', {});
            method = this.safeString (transferOptions, 'method', 'privateGetSubmitTransferToSubaccount');
        }
        const response = await this[method] (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        return this.parseTransfer (result, currency);
    }

    parseTransfer (transfer, currency = undefined) {
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
        const timestamp = this.safeTimestamp (transfer, 'created_timestamp');
        const status = this.safeString (transfer, 'state');
        const account = this.safeString (transfer, 'other_side');
        const direction = this.safeString (transfer, 'direction');
        const currencyId = this.safeString (transfer, 'currency');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'status': this.parseTransferStatus (status),
            'amount': this.safeNumber (transfer, 'amount'),
            'code': this.safeCurrencyCode (currencyId, currency),
            'fromAccount': direction !== 'payment' ? account : undefined,
            'toAccount': direction === 'payment' ? account : undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'prepared': 'pending',
            'confirmed': 'ok',
            'cancelled': 'cancelled',
            'waiting_for_admin': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name deribit#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the deribit api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'address': address, // must be in the address book
            'amount': amount,
            // 'priority': 'high', // low, mid, high, very_high, extreme_high, insane
            // 'tfa': '123456', // if enabled
        };
        if (this.twofa !== undefined) {
            request['tfa'] = totp (this.twofa);
        }
        const response = await this.privateGetWithdraw (this.extend (request, params));
        return this.parseTransaction (response, currency);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + 'api/' + this.version + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                request += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const timestamp = this.milliseconds ().toString ();
            const requestBody = '';
            if (Object.keys (params).length) {
                request += '?' + this.urlencode (params);
            }
            const requestData = method + "\n" + request + "\n" + requestBody + "\n"; // eslint-disable-line quotes
            const auth = timestamp + "\n" + nonce + "\n" + requestData; // eslint-disable-line quotes
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            headers = {
                'Authorization': 'deri-hmac-sha256 id=' + this.apiKey + ',ts=' + timestamp + ',sig=' + signature + ',' + 'nonce=' + nonce,
            };
        }
        const url = this.urls['api']['rest'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         jsonrpc: '2.0',
        //         error: {
        //             message: 'Invalid params',
        //             data: { reason: 'invalid currency', param: 'currency' },
        //             code: -32602
        //         },
        //         testnet: false,
        //         usIn: 1583763842150374,
        //         usOut: 1583763842150410,
        //         usDiff: 36
        //     }
        //
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
