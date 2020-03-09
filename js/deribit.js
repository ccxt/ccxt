'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, DDoSProtection, NotSupported, ExchangeNotAvailable, InsufficientFunds, BadRequest, InvalidAddress, OnMaintenance } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class deribit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deribit',
            'name': 'Deribit',
            'countries': [ 'NL' ], // Netherlands
            'version': 'v2',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'CORS': true,
                'editOrder': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchTickers': false,
            },
            'urls': {
                'test': 'https://test.deribit.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg',
                'api': 'https://www.deribit.com',
                'www': 'https://www.deribit.com',
                'doc': [
                    'https://docs.deribit.com',
                    'https://github.com/deribit',
                ],
                'fees': 'https://www.deribit.com/pages/information/fees',
                'referral': 'https://www.deribit.com/reg-1189.4038',
            },
            'api': {
                'public': {
                    'get': [
                        // Authentication
                        'auth',
                        'exchange_token',
                        'fork_token',
                        // Session management
                        'set_heartbeat',
                        'disable_heartbeat',
                        // Supporting
                        'get_time',
                        'hello',
                        'test',
                        // Subscription management
                        'subscribe',
                        'unsubscribe',
                        // Account management
                        'get_announcements',
                        // Market data
                        'get_book_summary_by_currency',
                        'get_book_summary_by_instrument',
                        'get_contract_size',
                        'get_currencies',
                        'get_funding_chart_data',
                        'get_funding_rate_history',
                        'get_funding_rate_value',
                        'get_historical_volatility',
                        'get_index',
                        'get_instruments',
                        'get_last_settlements_by_currency',
                        'get_last_settlements_by_instrument',
                        'get_last_trades_by_currency',
                        'get_last_trades_by_currency_and_time',
                        'get_last_trades_by_instrument',
                        'get_last_trades_by_instrument_and_time',
                        'get_order_book',
                        'get_trade_volumes',
                        'get_tradingview_chart_data',
                        'ticker',
                    ],
                },
                'private': {
                    'get': [
                        // Authentication
                        'logout',
                        // Session management
                        'enable_cancel_on_disconnect',
                        'disable_cancel_on_disconnect',
                        'get_cancel_on_disconnect',
                        // Subscription management
                        'subscribe',
                        'unsubscribe',
                        // Account management
                        'change_api_key_name',
                        'change_scope_in_api_key',
                        'change_subaccount_name',
                        'create_api_key',
                        'create_subaccount',
                        'disable_api_key',
                        'disable_tfa_for_subaccount',
                        'enable_api_key',
                        'get_account_summary',
                        'get_email_language',
                        'get_new_announcements',
                        'get_position',
                        'get_positions',
                        'get_subaccounts',
                        'list_api_keys',
                        'remove_api_key',
                        'reset_api_key',
                        'set_announcement_as_read',
                        'set_api_key_as_default',
                        'set_email_for_subaccount',
                        'set_email_language',
                        'set_password_for_subaccount',
                        'toggle_notifications_from_subaccount',
                        'toggle_subaccount_login',
                        // Block Trade
                        'execute_block_trade',
                        'get_block_trade',
                        'get_last_block_trades_by_currency',
                        'invalidate_block_trade_signature',
                        'verify_block_trade',
                        // Trading
                        'buy',
                        'sell',
                        'edit',
                        'cancel',
                        'cancel_all',
                        'cancel_all_by_currency',
                        'cancel_all_by_instrument',
                        'cancel_by_label',
                        'close_position',
                        'get_margins',
                        'get_open_orders_by_currency',
                        'get_open_orders_by_instrument',
                        'get_order_history_by_currency',
                        'get_order_history_by_instrument',
                        'get_order_margin_by_ids',
                        'get_order_state',
                        'get_stop_order_history',
                        'get_user_trades_by_currency',
                        'get_user_trades_by_currency_and_time',
                        'get_user_trades_by_instrument',
                        'get_user_trades_by_instrument_and_time',
                        'get_user_trades_by_order',
                        'get_settlement_history_by_instrument',
                        'get_settlement_history_by_currency',
                        // Wallet
                        'cancel_transfer_by_id',
                        'cancel_withdrawal',
                        'create_deposit_address',
                        'get_current_deposit_address',
                        'get_deposits',
                        'get_transfers',
                        'get_withdrawals',
                        'submit_transfer_to_subaccount',
                        'submit_transfer_to_user',
                        'withdraw',
                    ],
                },
            },
            'exceptions': {
                // 0 or absent Success, No error.
                '9999': PermissionDenied, // "api_not_enabled" User didn't enable API for the Account.
                '10000': AuthenticationError, // "authorization_required" Authorization issue, invalid or absent signature etc.
                '10001': ExchangeError, // "error" Some general failure, no public information available.
                '10002': InvalidOrder, // "qty_too_low" Order quantity is too low.
                '10003': InvalidOrder, // "order_overlap" Rejection, order overlap is found and self-trading is not enabled.
                '10004': OrderNotFound, // "order_not_found" Attempt to operate with order that can't be found by specified id.
                '10005': InvalidOrder, // "price_too_low <Limit>" Price is too low, <Limit> defines current limit for the operation.
                '10006': InvalidOrder, // "price_too_low4idx <Limit>" Price is too low for current index, <Limit> defines current bottom limit for the operation.
                '10007': InvalidOrder, // "price_too_high <Limit>" Price is too high, <Limit> defines current up limit for the operation.
                '10008': InvalidOrder, // "price_too_high4idx <Limit>" Price is too high for current index, <Limit> defines current up limit for the operation.
                '10009': InsufficientFunds, // "not_enough_funds" Account has not enough funds for the operation.
                '10010': OrderNotFound, // "already_closed" Attempt of doing something with closed order.
                '10011': InvalidOrder, // "price_not_allowed" This price is not allowed for some reason.
                '10012': InvalidOrder, // "book_closed" Operation for instrument which order book had been closed.
                '10013': PermissionDenied, // "pme_max_total_open_orders <Limit>" Total limit of open orders has been exceeded, it is applicable for PME users.
                '10014': PermissionDenied, // "pme_max_future_open_orders <Limit>" Limit of count of futures' open orders has been exceeded, it is applicable for PME users.
                '10015': PermissionDenied, // "pme_max_option_open_orders <Limit>" Limit of count of options' open orders has been exceeded, it is applicable for PME users.
                '10016': PermissionDenied, // "pme_max_future_open_orders_size <Limit>" Limit of size for futures has been exceeded, it is applicable for PME users.
                '10017': PermissionDenied, // "pme_max_option_open_orders_size <Limit>" Limit of size for options has been exceeded, it is applicable for PME users.
                '10018': PermissionDenied, // "non_pme_max_future_position_size <Limit>" Limit of size for futures has been exceeded, it is applicable for non-PME users.
                '10019': PermissionDenied, // "locked_by_admin" Trading is temporary locked by admin.
                '10020': ExchangeError, // "invalid_or_unsupported_instrument" Instrument name is not valid.
                '10021': InvalidOrder, // "invalid_amount" Amount is not valid.
                '10022': InvalidOrder, // "invalid_quantity" quantity was not recognized as a valid number (for API v1).
                '10023': InvalidOrder, // "invalid_price" price was not recognized as a valid number.
                '10024': InvalidOrder, // "invalid_max_show" max_show parameter was not recognized as a valid number.
                '10025': InvalidOrder, // "invalid_order_id" Order id is missing or its format was not recognized as valid.
                '10026': InvalidOrder, // "price_precision_exceeded" Extra precision of the price is not supported.
                '10027': InvalidOrder, // "non_integer_contract_amount" Futures contract amount was not recognized as integer.
                '10028': DDoSProtection, // "too_many_requests" Allowed request rate has been exceeded.
                '10029': OrderNotFound, // "not_owner_of_order" Attempt to operate with not own order.
                '10030': ExchangeError, // "must_be_websocket_request" REST request where Websocket is expected.
                '10031': ExchangeError, // "invalid_args_for_instrument" Some of arguments are not recognized as valid.
                '10032': InvalidOrder, // "whole_cost_too_low" Total cost is too low.
                '10033': NotSupported, // "not_implemented" Method is not implemented yet.
                '10034': InvalidOrder, // "stop_price_too_high" Stop price is too high.
                '10035': InvalidOrder, // "stop_price_too_low" Stop price is too low.
                '10036': InvalidOrder, // "invalid_max_show_amount" Max Show Amount is not valid.
                '10040': ExchangeNotAvailable, // "retry" Request can't be processed right now and should be retried.
                '10041': OnMaintenance, // "settlement_in_progress" Settlement is in progress. Every day at settlement time for several seconds, the system calculates user profits and updates balances. That time trading is paused for several seconds till the calculation is completed.
                '10043': InvalidOrder, // "price_wrong_tick" Price has to be rounded to a certain tick size.
                '10044': InvalidOrder, // "stop_price_wrong_tick" Stop Price has to be rounded to a certain tick size.
                '10045': InvalidOrder, // "can_not_cancel_liquidation_order" Liquidation order can't be canceled.
                '10046': InvalidOrder, // "can_not_edit_liquidation_order" Liquidation order can't be edited.
                '10047': DDoSProtection, // "matching_engine_queue_full" Reached limit of pending Matching Engine requests for user.
                '10048': ExchangeError, // "not_on_this_server" The requested operation is not available on this server.
                '11008': InvalidOrder, // "already_filled" This request is not allowed in regards to the filled order.
                '11029': BadRequest, // "invalid_arguments" Some invalid input has been detected.
                '11030': ExchangeError, // "other_reject <Reason>" Some rejects which are not considered as very often, more info may be specified in <Reason>.
                '11031': ExchangeError, // "other_error <Error>" Some errors which are not considered as very often, more info may be specified in <Error>.
                '11035': DDoSProtection, // "no_more_stops <Limit>" Allowed amount of stop orders has been exceeded.
                '11036': InvalidOrder, // "invalid_stoppx_for_index_or_last" Invalid StopPx (too high or too low) as to current index or market.
                '11037': BadRequest, // "outdated_instrument_for_IV_order" Instrument already not available for trading.
                '11038': InvalidOrder, // "no_adv_for_futures" Advanced orders are not available for futures.
                '11039': InvalidOrder, // "no_adv_postonly" Advanced post-only orders are not supported yet.
                '11041': InvalidOrder, // "not_adv_order" Advanced order properties can't be set if the order is not advanced.
                '11042': PermissionDenied, // "permission_denied" Permission for the operation has been denied.
                '11043': BadRequest, // "bad_argument" Bad argument has been passed.
                '11044': InvalidOrder, // "not_open_order" Attempt to do open order operations with the not open order.
                '11045': BadRequest, // "invalid_event" Event name has not been recognized.
                '11046': BadRequest, // "outdated_instrument" At several minutes to instrument expiration, corresponding advanced implied volatility orders are not allowed.
                '11047': BadRequest, // "unsupported_arg_combination" The specified combination of arguments is not supported.
                '11048': ExchangeError, // "wrong_max_show_for_option" Wrong Max Show for options.
                '11049': BadRequest, // "bad_arguments" Several bad arguments have been passed.
                '11050': BadRequest, // "bad_request" Request has not been parsed properly.
                '11051': OnMaintenance, // "system_maintenance" System is under maintenance.
                '11052': ExchangeError, // "subscribe_error_unsubscribed" Subscription error. However, subscription may fail without this error, please check list of subscribed channels returned, as some channels can be not subscribed due to wrong input or lack of permissions.
                '11053': ExchangeError, // "transfer_not_found" Specified transfer is not found.
                '11090': InvalidAddress, // "invalid_addr" Invalid address.
                '11091': InvalidAddress, // "invalid_transfer_address" Invalid addres for the transfer.
                '11092': InvalidAddress, // "address_already_exist" The address already exists.
                '11093': DDoSProtection, // "max_addr_count_exceeded" Limit of allowed addresses has been reached.
                '11094': ExchangeError, // "internal_server_error" Some unhandled error on server. Please report to admin. The details of the request will help to locate the problem.
                '11095': ExchangeError, // "disabled_deposit_address_creation" Deposit address creation has been disabled by admin.
                '11096': ExchangeError, // "address_belongs_to_user" Withdrawal instead of transfer.
                '12000': AuthenticationError, // "bad_tfa" Wrong TFA code
                '12001': DDoSProtection, // "too_many_subaccounts" Limit of subbacounts is reached.
                '12002': ExchangeError, // "wrong_subaccount_name" The input is not allowed as name of subaccount.
                '12998': AuthenticationError, // "tfa_over_limit" The number of failed TFA attempts is limited.
                '12003': AuthenticationError, // "login_over_limit" The number of failed login attempts is limited.
                '12004': AuthenticationError, // "registration_over_limit" The number of registration requests is limited.
                '12005': AuthenticationError, // "country_is_banned" The country is banned (possibly via IP check).
                '12100': ExchangeError, // "transfer_not_allowed" Transfer is not allowed. Possible wrong direction or other mistake.
                '12999': AuthenticationError, // "tfa_used" TFA code is correct but it is already used. Please, use next code.
                '13000': AuthenticationError, // "invalid_login" Login name is invalid (not allowed or it contains wrong characters).
                '13001': AuthenticationError, // "account_not_activated" Account must be activated.
                '13002': PermissionDenied, // "account_blocked" Account is blocked by admin.
                '13003': AuthenticationError, // "tfa_required" This action requires TFA authentication.
                '13004': AuthenticationError, // "invalid_credentials" Invalid credentials has been used.
                '13005': AuthenticationError, // "pwd_match_error" Password confirmation error.
                '13006': AuthenticationError, // "security_error" Invalid Security Code.
                '13007': AuthenticationError, // "user_not_found" User's security code has been changed or wrong.
                '13008': ExchangeError, // "request_failed" Request failed because of invalid input or internal failure.
                '13009': AuthenticationError, // "unauthorized" Wrong or expired authorization token or bad signature. For example, please check scope of the token, "connection" scope can't be reused for other connections.
                '13010': BadRequest, // "value_required" Invalid input, missing value.
                '13011': BadRequest, // "value_too_short" Input is too short.
                '13012': PermissionDenied, // "unavailable_in_subaccount" Subaccount restrictions.
                '13013': BadRequest, // "invalid_phone_number" Unsupported or invalid phone number.
                '13014': BadRequest, // "cannot_send_sms" SMS sending failed -- phone number is wrong.
                '13015': BadRequest, // "invalid_sms_code" Invalid SMS code.
                '13016': BadRequest, // "invalid_input" Invalid input.
                '13017': ExchangeError, // "subscription_failed" Subscription hailed, invalid subscription parameters.
                '13018': ExchangeError, // "invalid_content_type" Invalid content type of the request.
                '13019': ExchangeError, // "orderbook_closed" Closed, expired order book.
                '13020': ExchangeError, // "not_found" Instrument is not found, invalid instrument name.
                '13021': PermissionDenied, // "forbidden" Not enough permissions to execute the request, forbidden.
                '13025': ExchangeError, // "method_switched_off_by_admin" API method temporarily switched off by administrator.
                '-32602': BadRequest, // "Invalid params" see JSON-RPC spec.
                '-32601': BadRequest, // "Method not found" see JSON-RPC spec.
                '-32700': BadRequest, // "Parse error" see JSON-RPC spec.
                '-32000': BadRequest, // "Missing params" see JSON-RPC spec.
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'fetchBalance': {
                    'code': 'BTC',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
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
            //         jsonrpc: '2.0',
            //         result: [
            //             {
            //                 tick_size: 0.0005,
            //                 taker_commission: 0.0004,
            //                 strike: 300,
            //                 settlement_period: 'week',
            //                 quote_currency: 'USD',
            //                 option_type: 'call',
            //                 min_trade_amount: 1,
            //                 maker_commission: 0.0004,
            //                 kind: 'option',
            //                 is_active: true,
            //                 instrument_name: 'ETH-13MAR20-300-C',
            //                 expiration_timestamp: 1584086400000,
            //                 creation_timestamp: 1582790403000,
            //                 contract_size: 1,
            //                 base_currency: 'ETH'
            //             },
            //         ],
            //         usIn: 1583761889500586,
            //         usOut: 1583761889505066,
            //         usDiff: 4480,
            //         testnet: false
            //     }
            //
            const instrumentsResult = this.safeValue (instrumentsResponse, 'result', []);
            for (let i = 0; i < instrumentsResult.length; i++) {
                const market = instrumentsResult[i];
                const id = this.safeString (market, 'instrument_name');
                const baseId = this.safeString (market, 'base_currency');
                const quoteId = this.safeString (market, 'quote_currency');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const type = this.safeString (market, 'kind');
                const future = (type === 'future');
                const option = (type === 'option');
                const active = this.safeValue (market, 'is_active');
                const minTradeAmount = this.safeFloat (market, 'min_trade_amount');
                const tickSize = this.safeFloat (market, 'tick_size');
                const precision = {
                    'amount': minTradeAmount,
                    'price': tickSize,
                };
                result.push ({
                    'id': id,
                    'symbol': id,
                    'base': base,
                    'quote': quote,
                    'active': active,
                    'precision': precision,
                    'limits': {
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
                    'type': type,
                    'spot': false,
                    'future': future,
                    'option': option,
                    'info': market,
                });
            }
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchBalance', {});
        const code = this.safeValue (options, 'code', 'BTC');
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetGetAccountSummary (params);
        //
        //     {
        //         "usOut":1569048827943520,
        //         "usIn":1569048827943020,
        //         "usDiff":500,
        //         "testnet":false,
        //         "success":true,
        //         "result":{
        //             "equity":2e-9,
        //             "maintenanceMargin":0.0,
        //             "initialMargin":0.0,
        //             "availableFunds":0.0,
        //             "balance":0.0,
        //             "marginBalance":0.0,
        //             "SUPL":0.0,
        //             "SRPL":0.0,
        //             "PNL":0.0,
        //             "optionsPNL":0.0,
        //             "optionsSUPL":0.0,
        //             "optionsSRPL":0.0,
        //             "optionsD":0.0,
        //             "optionsG":0.0,
        //             "optionsV":0.0,
        //             "optionsTh":0.0,
        //             "futuresPNL":0.0,
        //             "futuresSUPL":0.0,
        //             "futuresSRPL":0.0,
        //             "deltaTotal":0.0,
        //             "sessionFunding":0.0,
        //             "depositAddress":"13tUtNsJSZa1F5GeCmwBywVrymHpZispzw",
        //             "currency":"BTC"
        //         },
        //         "message":""
        //     }
        //
        const result = {
            'info': response,
        };
        const balance = this.safeValue (response, 'result', {});
        const currencyId = this.safeString (balance, 'currency');
        // const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeFloat (balance, 'availableFunds');
        account['used'] = this.safeFloat (balance, 'maintenanceMargin');
        account['total'] = this.safeFloat (balance, 'equity');
        result[code] = account;
        return this.parseBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetAccount (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const address = this.safeString (result, 'depositAddress');
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "currentFunding":0.0,
        //         "funding8h":0.0000017213784611422821,
        //         "instrumentName":"BTC-PERPETUAL",
        //         "openInterest":7600223,
        //         "openInterestAmount":76002230,
        //         "high":7665.5,
        //         "low":7450.0,
        //         "volume":12964792.0,
        //         "volumeUsd":129647920,
        //         "volumeBtc":17214.63595316,
        //         "last":7520.5,
        //         "bidPrice":7520.0,
        //         "askPrice":7520.5,
        //         "midPrice":7520.25,
        //         "estDelPrice":"",
        //         "markPrice":7521.0,
        //         "created":"2019-12-09 15:17:00 GMT"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'created');
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'instrumentName');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const response = await this.publicGetGetsummary (this.extend (request, params));
        //
        //     {
        //         "usOut":1575904620528163,
        //         "usIn":1575904620528129,
        //         "usDiff":34,
        //         "testnet":false,
        //         "success":true,
        //         "result": {
        //             "currentFunding":0.0,
        //             "funding8h":0.0000017213784611422821,
        //             "instrumentName":"BTC-PERPETUAL",
        //             "openInterest":7600223,
        //             "openInterestAmount":76002230,
        //             "high":7665.5,
        //             "low":7450.0,
        //             "volume":12964792.0,
        //             "volumeUsd":129647920,
        //             "volumeBtc":17214.63595316,
        //             "last":7520.5,
        //             "bidPrice":7520.0,
        //             "askPrice":7520.5,
        //             "midPrice":7520.25,
        //             "estDelPrice":"",
        //             "markPrice":7521.0,
        //             "created":"2019-12-09 15:17:00 GMT"
        //         },
        //         "message":""
        //     }
        //
        return this.parseTicker (response['result'], market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "tradeId":23197559,
        //         "instrument":"BTC-28JUN19",
        //         "timeStamp":1559643011379,
        //         "tradeSeq":1997200,
        //         "quantity":2,
        //         "amount":20.0,
        //         "price":8010.0,
        //         "direction":"sell",
        //         "tickDirection":2,
        //         "indexPrice":7969.01
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "quantity":54,
        //         "amount":540.0,
        //         "tradeId":23087297,
        //         "instrument":"BTC-PERPETUAL",
        //         "timeStamp":1559604178803,
        //         "tradeSeq":8265011,
        //         "price":8213.0,
        //         "side":"sell",
        //         "orderId":12373631800,
        //         "matchingId":0,
        //         "liquidity":"T",
        //         "fee":0.000049312,
        //         "feeCurrency":"BTC",
        //         "tickDirection":3,
        //         "indexPrice":8251.94,
        //         "selfTrade":false
        //     }
        //
        const id = this.safeString (trade, 'tradeId');
        const orderId = this.safeString (trade, 'orderId');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (trade, 'timeStamp');
        const side = this.safeString2 (trade, 'side', 'direction');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        } else {
            request['limit'] = 10000;
        }
        const response = await this.publicGetGetlasttrades (this.extend (request, params));
        //
        //     {
        //         "usOut":1559643108984527,
        //         "usIn":1559643108984470,
        //         "usDiff":57,
        //         "testnet":false,
        //         "success":true,
        //         "result": [
        //             {
        //                 "tradeId":23197559,
        //                 "instrument":"BTC-28JUN19",
        //                 "timeStamp":1559643011379,
        //                 "tradeSeq":1997200,
        //                 "quantity":2,
        //                 "amount":20.0,
        //                 "price":8010.0,
        //                 "direction":"sell",
        //                 "tickDirection":2,
        //                 "indexPrice":7969.01
        //             }
        //         ],
        //         "message":""
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const response = await this.publicGetGetorderbook (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'usOut') / 1000;
        const orderbook = this.parseOrderBook (response['result'], timestamp, 'bids', 'asks', 'price', 'quantity');
        return this.extend (orderbook, {
            'nonce': this.safeInteger (response, 'tstamp'),
        });
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "orderId": 5258039,          // ID of the order
        //         "type": "limit",             // not documented, but present in the actual response
        //         "instrument": "BTC-26MAY17", // instrument name (market id)
        //         "direction": "sell",         // order direction, "buy" or "sell"
        //         "price": 1860,               // float, USD for futures, BTC for options
        //         "label": "",                 // label set by the owner, up to 32 chars
        //         "quantity": 10,              // quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //         "filledQuantity": 3,         // filled quantity, in contracts ($10 per contract for futures, ฿1 — for options)
        //         "avgPrice": 1860,            // average fill price of the order
        //         "commission": -0.000001613,  // in BTC units
        //         "created": 1494491899308,    // creation timestamp
        //         "state": "open",             // open, cancelled, etc
        //         "postOnly": false            // true for post-only orders only
        // open orders --------------------------------------------------------
        //         "lastUpdate": 1494491988754, // timestamp of the last order state change (before this cancelorder of course)
        // closed orders ------------------------------------------------------
        //         "tstamp": 1494492913288,     // timestamp of the last order state change, documented, but may be missing in the actual response
        //         "modified": 1494492913289,   // timestamp of the last db write operation, e.g. trade that doesn't change order status, documented, but may missing in the actual response
        //         "adv": false                 // advanced type (false, or "usd" or "implv")
        //         "trades": [],                // not documented, injected from the outside of the parseOrder method into the order
        //     }
        //
        const timestamp = this.safeInteger (order, 'created');
        const lastUpdate = this.safeInteger (order, 'lastUpdate');
        let lastTradeTimestamp = this.safeInteger2 (order, 'tstamp', 'modified');
        const id = this.safeString (order, 'orderId');
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'avgPrice');
        const amount = this.safeFloat (order, 'quantity');
        const filled = this.safeFloat (order, 'filledQuantity');
        if (lastTradeTimestamp === undefined) {
            if (filled !== undefined) {
                if (filled > 0) {
                    lastTradeTimestamp = lastUpdate;
                }
            }
        }
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
            }
            if (price !== undefined) {
                cost = price * filled;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const side = this.safeStringLower (order, 'direction');
        let feeCost = this.safeFloat (order, 'commission');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        const fee = {
            'cost': feeCost,
            'currency': 'BTC',
        };
        const type = this.safeString (order, 'type');
        const marketId = this.safeString (order, 'instrument');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined, // todo: parse trades
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrderstate (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        if (result === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() ' + this.json (response));
        }
        return this.parseOrder (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument': this.marketId (symbol),
            'quantity': amount,
            'type': type,
            // 'post_only': 'false' or 'true', https://github.com/ccxt/ccxt/issues/5159
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        const method = 'privatePost' + this.capitalize (side);
        const response = await this[method] (this.extend (request, params));
        const order = this.safeValue (response['result'], 'order');
        if (order === undefined) {
            return response;
        }
        return this.parseOrder (order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        if (amount !== undefined) {
            request['quantity'] = amount;
        }
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this.privatePostEdit (this.extend (request, params));
        return this.parseOrder (response['result']['order']);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostCancel (this.extend (request, params));
        return this.parseOrder (response['result']['order']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const response = await this.privateGetGetopenorders (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const response = await this.privateGetOrderhistory (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit; // default = 20
        }
        const response = await this.privateGetTradehistory (this.extend (request, params));
        //
        //     {
        //         "usOut":1559611553394836,
        //         "usIn":1559611553394000,
        //         "usDiff":836,
        //         "testnet":false,
        //         "success":true,
        //         "result": [
        //             {
        //                 "quantity":54,
        //                 "amount":540.0,
        //                 "tradeId":23087297,
        //                 "instrument":"BTC-PERPETUAL",
        //                 "timeStamp":1559604178803,
        //                 "tradeSeq":8265011,
        //                 "price":8213.0,
        //                 "side":"sell",
        //                 "orderId":12373631800,
        //                 "matchingId":0,
        //                 "liquidity":"T",
        //                 "fee":0.000049312,
        //                 "feeCurrency":"BTC",
        //                 "tickDirection":3,
        //                 "indexPrice":8251.94,
        //                 "selfTrade":false
        //             }
        //         ],
        //         "message":"",
        //         "has_more":true
        //     }
        //
        const trades = this.safeValue (response, 'result', []);
        return this.parseTrades (trades, market, since, limit);
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
            //
            // Additional authorization method - Deribit signature credentials
            // The Derbit service provides dedicated authorization method, which
            // harness user generated signature to increase security level for passing
            // request data. Generated value is passed inside Authorization header, coded as:
            //
            // Authorization: deri-hmac-sha256 id=ClientId,ts=Timestamp,sig=Signature,nonce=Nonce
            //
            // where:
            //
            // Deribit credential   Description
            // ClientId             Can be found on the API page on the Deribit website (the user can configure up to 8 different IDs - with different privileges)
            // Timestamp            Time when the request was generated - given as miliseconds. It's valid for 60 seconds since generation, after that time any request with an old timestamp will be rejected.
            // Signature            Value for signature calculated as described below
            // Nonce                Single usage, user generated initialization vector for the server token
            //
            // The signature is generated by the following formula:
            //
            // RequestData = UPPERCASE(HTTP_METHOD()) + "\n" + URI() + "\n" + RequestBody + "\n";
            // StringToSign = Timestamp + "\n" + Nonce + "\n" + RequestData;
            // Signature = HEX_STRING( HMAC-SHA256( ClientSecret, StringToSign ) );
            //
            // Note the newline characters in RequestData and StringToSign variables. If RequestBody is ommitted in RequestData, it's treated as an empty string, so these three newline characters must always be present.
            //
            // Example using shell with openssl tool:
            //
            //     ClientId=AMANDA
            //     ClientSecret=AMANDASECRECT
            //     Timestamp=$( date +%s000 )
            //     Nonce=$( cat /dev/urandom | tr -dc 'a-z0-9' | head -c8 )
            //     URI="/api/v2/private/get_account_summary?currency=BTC"
            //     HttpMethod=GET
            //     Body=""
            //     Signature=$( echo -ne "${Timestamp}\n${Nonce}\n${HttpMethod}\n${URI}\n${Body}\n" | openssl sha256 -r -hmac "$ClientSecret" | cut -f1 -d' ' )
            //     echo $Signature
            //     shell output> 9bfbc51a2bc372d72cc396cf1a213dc78d42eb74cb7dc272351833ad0de276ab (WARNING: Exact value depends on current timestamp and client credentials)
            //     curl -s -X ${HttpMethod} -H "Authorization: deri-hmac-sha256 id=${ClientId},ts=${Timestamp},nonce=${Nonce},sig=${Signature}" "https://www.deribit.com${URI}"
            //
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const timestamp = this.milliseconds ().toString ();
            let requestBody = '';
            if (Object.keys (params).length) {
                requestBody = this.urlencode (params);
                request += '?' + requestBody;
            }
            const requestData = method + "\n" + request + "\n" + requestBody + "\n";
            const auth = timestamp + "\n" + nonce + "\n" + requestData;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers = {
                'Authorization': 'deri-hmac-sha256 id=' + this.apiKey + ',ts=' + timestamp + ',sig=' + signature + ',nonce=' + nonce,
            };
        }
        const url = this.urls['api'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
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
    }
};
