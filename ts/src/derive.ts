
//  ---------------------------------------------------------------------------

import { BadRequest, InvalidOrder, Precise, ExchangeError, OrderNotFound, ArgumentsRequired } from '../ccxt.js';
import Exchange from './abstract/derive.js';
import { TICK_SIZE } from './base/functions/number.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Dict, Currencies, Transaction, Currency, Market, MarketType, Bool, Str, Strings, Ticker, Int, int, Trade, OrderType, OrderSide, Num, FundingRateHistory, FundingRate, Balances, Order } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class derive
 * @augments Exchange
 */
export default class derive extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'derive',
            'name': 'derive',
            'countries': [ ],
            'version': 'v1',
            'rateLimit': 50, // 1200 requests per minute, 20 request per second
            'certified': true,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'hostname': 'derive.xyz',
            'urls': {
                'logo': undefined,
                'api': {
                    'public': 'https://api.lyra.finance/public',
                    'private': 'https://api.lyra.finance/private',
                },
                'test': {
                    'public': 'https://api-demo.lyra.finance/public',
                    'private': 'https://api-demo.lyra.finance/private',
                },
                'www': 'https://www.derive.xyz/',
                'doc': 'https://docs.derive.xyz/docs/',
                'fees': 'https://docs.derive.xyz/reference/fees-1/',
                'referral': 'https://www.derive.xyz/',
            },
            'api': {
                'public': {
                    'get': [
                        'get_all_currencies',
                    ],
                    'post': [
                        'build_register_session_key_tx',
                        'register_session_key',
                        'deregister_session_key',
                        'login',
                        'statistics',
                        'get_all_currencies',
                        'get_currency',
                        'get_instrument',
                        'get_all_instruments',
                        'get_instruments',
                        'get_ticker',
                        'get_latest_signed_feeds',
                        'get_option_settlement_prices',
                        'get_spot_feed_history',
                        'get_spot_feed_history_candles',
                        'get_funding_rate_history',
                        'get_trade_history',
                        'get_option_settlement_history',
                        'get_liquidation_history',
                        'get_interest_rate_history',
                        'get_transaction',
                        'get_margin',
                        'margin_watch',
                        'validate_invite_code',
                        'get_points',
                        'get_all_points',
                        'get_points_leaderboard',
                        'get_descendant_tree',
                        'get_tree_roots',
                        'get_swell_percent_points',
                        'get_vault_assets',
                        'get_etherfi_effective_balances',
                        'get_kelp_effective_balances',
                        'get_bridge_balances',
                        'get_ethena_participants',
                        'get_vault_share',
                        'get_vault_statistics',
                        'get_vault_balances',
                        'estimate_integrator_points',
                        'create_subaccount_debug',
                        'deposit_debug',
                        'withdraw_debug',
                        'send_quote_debug',
                        'execute_quote_debug',
                        'get_invite_code',
                        'register_invite',
                        'get_time',
                        'get_live_incidents',
                        'get_maker_programs',
                        'get_maker_program_scores',
                    ],
                },
                'private': {
                    'post': [
                        'get_account',
                        'create_subaccount',
                        'get_subaccount',
                        'get_subaccounts',
                        'get_all_portfolios',
                        'change_subaccount_label',
                        'get_notificationsv',
                        'update_notifications',
                        'deposit',
                        'withdraw',
                        'transfer_erc20',
                        'transfer_position',
                        'transfer_positions',
                        'order',
                        'replace',
                        'order_debug',
                        'get_order',
                        'get_orders',
                        'get_open_orders',
                        'cancel',
                        'cancel_by_label',
                        'cancel_by_nonce',
                        'cancel_by_instrument',
                        'cancel_all',
                        'cancel_trigger_order',
                        'get_order_history',
                        'get_trade_history',
                        'get_deposit_history',
                        'get_withdrawal_history',
                        'send_rfq',
                        'cancel_rfq',
                        'cancel_batch_rfqs',
                        'get_rfqs',
                        'poll_rfqs',
                        'send_quote',
                        'cancel_quote',
                        'cancel_batch_quotes',
                        'get_quotes',
                        'poll_quotes',
                        'execute_quote',
                        'rfq_get_best_quote',
                        'get_margin',
                        'get_collaterals',
                        'get_positions',
                        'get_option_settlement_history',
                        'get_subaccount_value_history',
                        'expired_and_cancelled_history',
                        'get_funding_history',
                        'get_interest_history',
                        'get_erc20_transfer_history',
                        'get_liquidation_history',
                        'liquidate',
                        'get_liquidator_history',
                        'session_keys',
                        'edit_session_key',
                        'register_scoped_session_key',
                        'get_mmp_config',
                        'set_mmp_config',
                        'reset_mmp',
                        'set_cancel_on_disconnect',
                        'get_invite_code',
                        'register_invite',
                    ],
                },
            },
            'fees': {
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {
                    '11006': OrderNotFound, // {"code":"11006","message":"Does not exist","data":"Open order with id: 804018f3-b092-40a3-a933-b29574fa1ff8 does not exist."}
                    '11011': InvalidOrder, // {"code":11011,"message":"Invalid signature expiry","data":"Order must expire in 300 sec or more"}
                    '11012': InvalidOrder, // {"code":"11012","message":"Invalid amount","data":"Amount must be a multiple of 0.01"}
                    '11013': InvalidOrder, // {"code":"11013","message":"Invalid limit price","data":{"limit":"10000","bandwidth":"92530"}}
                    '11023': InvalidOrder, // {"code":"11023","message":"Max fee order param is too low","data":"signed max_fee must be >= 194.420835871999983091712000000000000000"}
                    '11024': InvalidOrder, // {"code":11024,"message":"Reduce only not supported with this time in force"}
                    '11051': InvalidOrder, // {"code":"11051","message":"Trigger price must be higher than the current price for stop orders and vice versa for take orders","data":"Trigger price 9000.0 must be < or > current price 102671.2 depending on trigger type and direction."}
                    '11054': InvalidOrder, // {"code":"11054","message":"Trigger orders cannot replace or be replaced"}
                    '14000': BadRequest, // {"code": 14000, "message": "Account not found"}
                    '14001': InvalidOrder, // {"code": 14001, "message": "Subaccount not found"}
                    '14014': InvalidOrder, // {"code":"14014","message":"Signature invalid for message or transaction","data":"Signature does not match data"}
                    '14023': InvalidOrder, // {"code":"14023","message":"Signer in on-chain related request is not wallet owner or registered session key","data":"Session key does not belong to wallet"}
                    '-32602': InvalidOrder, // {"id":"55e66a3d-6a4e-4a36-a23d-5cf8a91ef478","error":{"code":"","message":"Invalid params"}}
                    '-32603': InvalidOrder, // {"code":"-32603","message":"Internal error","data":"SubAccount matching query does not exist."}
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
                'contractWalletAddress': '', // a contract wallet address "0x"-prefixed hexstring
            },
        });
    }

    setSandboxMode (enabled) {
        super.setSandboxMode (enabled);
        this.options['sandboxMode'] = enabled;
    }

    /**
     * @method
     * @name derive#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.derive.xyz/reference/post_public-get-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}) {
        const response = await this.publicPostGetTime (params);
        //
        // {
        //     "result": 1735846536758,
        //     "id": "f1c03d21-f886-4c5a-9a9d-33dd06f180f0"
        // }
        //
        return this.safeInteger (response, 'result');
    }

    /**
     * @method
     * @name derive#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.derive.xyz/reference/post_public-get-all-currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const result: Dict = {};
        const tokenResponse = await this.publicGetGetAllCurrencies (params);
        //
        // {
        //     "result": [
        //         {
        //             "currency": "USDC",
        //             "spot_price": "1.000066413299999872",
        //             "spot_price_24h": "1.000327785299999872"
        //         }
        //     ],
        //     "id": "7e07fe1d-0ab4-4d2b-9e22-b65ce9e232dc"
        // }
        //
        const currencies = this.safeList (tokenResponse, 'result', []);
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const currencyId = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            result[code] = {
                'id': currencyId,
                'name': undefined,
                'code': code,
                'precision': undefined,
                'active': undefined,
                'fee': undefined,
                'networks': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    /**
     * @method
     * @name derive#fetchMarkets
     * @description retrieves data on all markets for bybit
     * @see https://docs.derive.xyz/reference/post_public-get-all-instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const request: Dict = {
            'currency': 'BTC',
            'expired': true,
            'instrument_type': 'perp',
        };
        const response = await this.publicPostGetAllInstruments (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "instruments": [
        //             {
        //                 "instrument_type": "perp",
        //                 "instrument_name": "BTC-PERP",
        //                 "scheduled_activation": 1701840228,
        //                 "scheduled_deactivation": 9223372036854776000,
        //                 "is_active": true,
        //                 "tick_size": "0.1",
        //                 "minimum_amount": "0.01",
        //                 "maximum_amount": "10000",
        //                 "amount_step": "0.001",
        //                 "mark_price_fee_rate_cap": "0",
        //                 "maker_fee_rate": "0.00005",
        //                 "taker_fee_rate": "0.0003",
        //                 "base_fee": "0.1",
        //                 "base_currency": "BTC",
        //                 "quote_currency": "USD",
        //                 "option_details": null,
        //                 "perp_details": {
        //                     "index": "BTC-USD",
        //                     "max_rate_per_hour": "0.004",
        //                     "min_rate_per_hour": "-0.004",
        //                     "static_interest_rate": "0.0000125",
        //                     "aggregate_funding": "10538.574363381759146829",
        //                     "funding_rate": "0.0000125"
        //                 },
        //                 "erc20_details": null,
        //                 "base_asset_address": "0xDBa83C0C654DB1cd914FA2710bA743e925B53086",
        //                 "base_asset_sub_id": "0",
        //                 "pro_rata_fraction": "0",
        //                 "fifo_min_allocation": "0",
        //                 "pro_rata_amount_step": "0.1"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 1
        //         }
        //     },
        //     "id": "a06bc0b2-8e78-4536-a21f-f785f225b5a5"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const data = this.safeList (result, 'instruments', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        const type = this.safeString (market, 'instrument_type');
        let marketType: MarketType;
        let spot = false;
        let margin = true;
        let swap = false;
        let option = false;
        let linear: Bool = undefined;
        const baseId = this.safeString (market, 'base_currency');
        const quoteId = this.safeString (market, 'quote_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const marketId = this.safeString (market, 'instrument_name');
        let symbol = base + '/' + quote;
        let settleId: Str = undefined;
        let settle: Str = undefined;
        if (type === 'erc20') {
            spot = true;
            marketType = 'spot';
        } else if (type === 'perp') {
            margin = false;
            settleId = 'USDC';
            settle = this.safeCurrencyCode (settleId);
            symbol = base + '/' + quote + ':' + settle;
            swap = true;
            linear = true;
            marketType = 'swap';
        } else if (type === 'option') {
            margin = false;
            option = true;
        }
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': spot,
            'margin': margin,
            'swap': swap,
            'future': false,
            'option': option,
            'active': this.safeBool (market, 'is_active'),
            'contract': swap,
            'linear': linear,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'taker': this.safeNumber (market, 'taker_fee_rate'),
            'maker': this.safeNumber (market, 'maker_fee_rate'),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'amount_step'),
                'price': this.safeNumber (market, 'tick_size'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'minimum_amount'),
                    'max': this.safeNumber (market, 'maximum_amount'),
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
            'created': undefined,
            'info': market,
        };
    }

    /**
     * @method
     * @name derive#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.derive.xyz/reference/post_public-get-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
        };
        const response = await this.publicPostGetTicker (this.extend (request, params));
        //
        // spot
        //
        // {
        //     "result": {
        //         "instrument_type": "perp",
        //         "instrument_name": "BTC-PERP",
        //         "scheduled_activation": 1701840228,
        //         "scheduled_deactivation": 9223372036854776000,
        //         "is_active": true,
        //         "tick_size": "0.1",
        //         "minimum_amount": "0.01",
        //         "maximum_amount": "10000",
        //         "amount_step": "0.001",
        //         "mark_price_fee_rate_cap": "0",
        //         "maker_fee_rate": "0.00005",
        //         "taker_fee_rate": "0.0003",
        //         "base_fee": "0.1",
        //         "base_currency": "BTC",
        //         "quote_currency": "USD",
        //         "option_details": null,
        //         "perp_details": {
        //             "index": "BTC-USD",
        //             "max_rate_per_hour": "0.004",
        //             "min_rate_per_hour": "-0.004",
        //             "static_interest_rate": "0.0000125",
        //             "aggregate_funding": "10512.580833189805742522",
        //             "funding_rate": "-0.000022223906766867"
        //         },
        //         "erc20_details": null,
        //         "base_asset_address": "0xDBa83C0C654DB1cd914FA2710bA743e925B53086",
        //         "base_asset_sub_id": "0",
        //         "pro_rata_fraction": "0",
        //         "fifo_min_allocation": "0",
        //         "pro_rata_amount_step": "0.1",
        //         "best_ask_amount": "0.012",
        //         "best_ask_price": "99567.9",
        //         "best_bid_amount": "0.129",
        //         "best_bid_price": "99554.5",
        //         "five_percent_bid_depth": "11.208",
        //         "five_percent_ask_depth": "11.42",
        //         "option_pricing": null,
        //         "index_price": "99577.2",
        //         "mark_price": "99543.642926357933902181684970855712890625",
        //         "stats": {
        //             "contract_volume": "464.712",
        //             "num_trades": "10681",
        //             "open_interest": "72.804739389481989861",
        //             "high": "99519.1",
        //             "low": "97254.1",
        //             "percent_change": "0.0128",
        //             "usd_change": "1258.1"
        //         },
        //         "timestamp": 1736140984000,
        //         "min_price": "97591.2",
        //         "max_price": "101535.1"
        //     },
        //     "id": "bbd7c271-c2be-48f7-b93a-26cf6d4cb79f"
        // }
        //
        const data = this.safeDict (response, 'result', {});
        return this.parseTicker (data, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // {
        //     "instrument_type": "perp",
        //     "instrument_name": "BTC-PERP",
        //     "scheduled_activation": 1701840228,
        //     "scheduled_deactivation": 9223372036854776000,
        //     "is_active": true,
        //     "tick_size": "0.1",
        //     "minimum_amount": "0.01",
        //     "maximum_amount": "10000",
        //     "amount_step": "0.001",
        //     "mark_price_fee_rate_cap": "0",
        //     "maker_fee_rate": "0.00005",
        //     "taker_fee_rate": "0.0003",
        //     "base_fee": "0.1",
        //     "base_currency": "BTC",
        //     "quote_currency": "USD",
        //     "option_details": null,
        //     "perp_details": {
        //         "index": "BTC-USD",
        //         "max_rate_per_hour": "0.004",
        //         "min_rate_per_hour": "-0.004",
        //         "static_interest_rate": "0.0000125",
        //         "aggregate_funding": "10512.580833189805742522",
        //         "funding_rate": "-0.000022223906766867"
        //     },
        //     "erc20_details": null,
        //     "base_asset_address": "0xDBa83C0C654DB1cd914FA2710bA743e925B53086",
        //     "base_asset_sub_id": "0",
        //     "pro_rata_fraction": "0",
        //     "fifo_min_allocation": "0",
        //     "pro_rata_amount_step": "0.1",
        //     "best_ask_amount": "0.012",
        //     "best_ask_price": "99567.9",
        //     "best_bid_amount": "0.129",
        //     "best_bid_price": "99554.5",
        //     "five_percent_bid_depth": "11.208",
        //     "five_percent_ask_depth": "11.42",
        //     "option_pricing": null,
        //     "index_price": "99577.2",
        //     "mark_price": "99543.642926357933902181684970855712890625",
        //     "stats": {
        //         "contract_volume": "464.712",
        //         "num_trades": "10681",
        //         "open_interest": "72.804739389481989861",
        //         "high": "99519.1",
        //         "low": "97254.1",
        //         "percent_change": "0.0128",
        //         "usd_change": "1258.1"
        //     },
        //     "timestamp": 1736140984000,
        //     "min_price": "97591.2",
        //     "max_price": "101535.1"
        // }
        //
        const marketId = this.safeString (ticker, 'instrument_name');
        const timestamp = this.safeIntegerOmitZero (ticker, 'timestamp'); // exchange bitget provided 0
        const symbol = this.safeSymbol (marketId, market);
        const stats = this.safeDict (ticker, 'stats');
        const change = this.safeString (stats, 'percent_change');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (stats, 'high'),
            'low': this.safeString (stats, 'low'),
            'bid': this.safeString (ticker, 'best_bid_price'),
            'bidVolume': this.safeString (ticker, 'best_bid_amount'),
            'ask': this.safeString (ticker, 'best_ask_price'),
            'askVolume': this.safeString (ticker, 'best_ask_amount'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': change,
            'percentage': Precise.stringMul (change, '100'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'indexPrice': this.safeString (ticker, 'index_price'),
            'markPrice': this.safeString (ticker, 'mark_price'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name derive#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.derive.xyz/reference/post_public-get-trade-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                limit = 1000;
            }
            request['page_size'] = limit; // default 100, max 1000
        }
        if (since !== undefined) {
            request['from_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, [ 'until' ]);
        if (until !== undefined) {
            request['to_timestamp'] = until;
        }
        const response = await this.publicPostGetTradeHistory (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "trades": [
        //             {
        //                 "trade_id": "9dbc88b0-f0c4-4439-9cc1-4e6409d4eafb",
        //                 "instrument_name": "BTC-PERP",
        //                 "timestamp": 1736153910930,
        //                 "trade_price": "98995.3",
        //                 "trade_amount": "0.033",
        //                 "mark_price": "98990.875914388161618263",
        //                 "index_price": "99038.050611100001501184",
        //                 "direction": "sell",
        //                 "quote_id": null,
        //                 "wallet": "0x88B6BB87fbFac92a34F8155aaA35c87B5b166fA9",
        //                 "subaccount_id": 8250,
        //                 "tx_status": "settled",
        //                 "tx_hash": "0x020bd735b312f867f17f8cc254946d87cfe9f2c8ff3605035d8129082eb73723",
        //                 "trade_fee": "0.980476701049890015",
        //                 "liquidity_role": "taker",
        //                 "realized_pnl": "-2.92952402688793509",
        //                 "realized_pnl_excl_fees": "-1.949047325838045075"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 598196,
        //             "count": 598196
        //         }
        //     },
        //     "id": "b8539544-6975-4497-8163-5e51a38e4aa7"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const data = this.safeList (result, 'trades', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // {
        //     "subaccount_id": 130837,
        //     "order_id": "30c48194-8d48-43ac-ad00-0d5ba29eddc9",
        //     "instrument_name": "BTC-PERP",
        //     "direction": "sell",
        //     "label": "test1234",
        //     "quote_id": null,
        //     "trade_id": "f8a30740-488c-4c2d-905d-e17057bafde1",
        //     "timestamp": 1738065303708,
        //     "mark_price": "102740.137375457314192317",
        //     "index_price": "102741.553409299981533184",
        //     "trade_price": "102700.6",
        //     "trade_amount": "0.01",
        //     "liquidity_role": "taker",
        //     "realized_pnl": "0",
        //     "realized_pnl_excl_fees": "0",
        //     "is_transfer": false,
        //     "tx_status": "settled",
        //     "trade_fee": "1.127415534092999815",
        //     "tx_hash": "0xc55df1f07330faf86579bd8a6385391fbe9e73089301149d8550e9d29c9ead74",
        //     "transaction_id": "e18b9426-3fa5-41bb-99d3-8b54fb4d51bb"
        // }
        //
        const marketId = this.safeString (trade, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        const fee = {
            'currency': 'USDC',
            'cost': this.safeString (trade, 'trade_fee'),
        };
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'order': this.safeString (trade, 'order_id'),
            'symbol': symbol,
            'side': this.safeStringLower (trade, 'direction'),
            'type': undefined,
            'takerOrMaker': this.safeString (trade, 'liquidity_role'),
            'price': this.safeString (trade, 'trade_price'),
            'amount': this.safeString (trade, 'trade_amount'),
            'cost': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name derive#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.derive.xyz/reference/post_public-get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, [ 'until' ]);
        if (until !== undefined) {
            request['to_timestamp'] = until;
        }
        const response = await this.publicPostGetFundingRateHistory (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "funding_rate_history": [
        //             {
        //                 "timestamp": 1736215200000,
        //                 "funding_rate": "-0.000020014"
        //             }
        //         ]
        //     },
        //     "id": "3200ab8d-0080-42f0-8517-c13e3d9201d8"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const data = this.safeList (result, 'funding_rate_history', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger (entry, 'timestamp');
            rates.push ({
                'info': entry,
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    /**
     * @method
     * @name derive#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.derive.xyz/reference/post_public-get-funding-rate-history
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        const response = await this.fetchFundingRateHistory (symbol, undefined, 1, params);
        //
        // [
        //     {
        //         "info": {
        //             "timestamp": 1736157600000,
        //             "funding_rate": "-0.000008872"
        //         },
        //         "symbol": "BTC/USD:USDC",
        //         "fundingRate": -0.000008872,
        //         "timestamp": 1736157600000,
        //         "datetime": "2025-01-06T10:00:00.000Z"
        //     }
        // ]
        //
        const data = this.safeDict (response, 0);
        return this.parseFundingRate (data);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        const symbol = this.safeString (contract, 'symbol');
        const fundingTimestamp = this.safeInteger (contract, 'timestamp');
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
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    hashOrderMessage (binaryMessage) {
        const DOMAIN_SEPARATOR = '9bcf4dc06df5d8bf23af818d5716491b995020f377d3b7b64c29ed14e3dd1105';
        const binaryDomainSeparator = this.base16ToBinary (DOMAIN_SEPARATOR);
        const prefix = this.base16ToBinary('1901');
        return '0x' + this.hash (this.binaryConcat (prefix, binaryDomainSeparator, binaryMessage), keccak, 'hex');
    }

    signOrder (order, privateKey) {
        const accountHash = this.hash(this.ethAbiEncode ([
            'bytes32', 'uint256', 'uint256', 'address', 'bytes32', 'uint256', 'address', 'address',
        ], order), keccak, 'binary');
        const signature = ecdsa (this.hashOrderMessage (accountHash).slice (-64), privateKey.slice (-64), secp256k1, undefined);
        return '0x' + signature['r'] + signature['s'] + this.intToBase16 (this.sum (27, signature['v']));
    }

    hashMessage (message) {
        // takes a utf8 encoded message
        const binaryMessage = this.encode (message);
        const prefix = this.encode ('\x19Ethereum Signed Message:\n' + binaryMessage.byteLength);
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), keccak, 'hex');
    }

    signHash (hash, privateKey) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        return '0x' + signature['r'] + signature['s'] + this.intToBase16 (this.sum (27, signature['v']));
    }

    signMessage (message, privateKey) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    parseUnits (num: string, decimal = '1000000000000000000') {
        return Precise.stringMul (num, decimal);
    }

    /**
     * @method
     * @name derive#createOrder
     * @description create a trade order
     * @see https://docs.derive.xyz/reference/post_private-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const maxFee = this.safeNumber (params, 'max_fee', 0);
        const test = this.safeBool (params, 'test', false);
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only');
        const timeInForce = this.safeStringLower2 (params, 'timeInForce', 'time_in_force');
        const postOnly = this.safeBool (params, 'postOnly');
        const orderType = type.toLowerCase ();
        const orderSide = side.toLowerCase ();
        const nonce = this.now ();
        // Order signature expiry must be between 2592000 and 7776000 sec from now
        const signatureExpiry = this.safeNumber (params, 'signature_expiry_sec', this.seconds () + 7776000);
        // TODO: subaccount id / trade module address
        const ACTION_TYPEHASH = '0x4d7a9f27c403ff9c0f19bce61d76d82f9aa29f8d6d4b0c5474607d9770d1af17';
        const TRADE_MODULE_ADDRESS = '0x87F2863866D85E3192a35A73b388BD625D83f2be';
        const tradeModuleDataHash = this.hash (this.ethAbiEncode ([
            'address', 'uint', 'int', 'int', 'uint', 'uint', 'bool',
        ], [
            market['info']['base_asset_address'],
            market['info']['base_asset_sub_id'],
            this.parseUnits (price.toString ()),
            this.parseUnits (this.amountToPrecision (symbol, amount.toString ())),
            this.parseUnits (maxFee.toString ()),
            subaccountId,
            orderSide === 'buy',
        ]), keccak, 'hex');
        let contractWalletAddress = undefined;
        [ contractWalletAddress, params ] = this.handleOptionAndParams (params, 'createOrder', 'contractWalletAddress');
        const signature = this.signOrder ([
            ACTION_TYPEHASH,
            subaccountId,
            nonce,
            TRADE_MODULE_ADDRESS,
            '0x' + tradeModuleDataHash,
            signatureExpiry,
            contractWalletAddress,
            this.walletAddress,
        ], this.privateKey);
        const request: Dict = {
            'instrument_name': market['id'],
            'direction': orderSide,
            'order_type': orderType,
            'nonce': nonce,
            'amount': amount,
            'limit_price': price,
            'max_fee': maxFee,
            'subaccount_id': subaccountId,
            'signature_expiry_sec': signatureExpiry,
            'signer': this.walletAddress,
        };
        if (reduceOnly !== undefined) {
            request['reduce_only'] = reduceOnly;
            if (reduceOnly && postOnly) {
                throw new InvalidOrder (this.id + ' cannot use reduce only with post only time in force');
            }
        }
        if (postOnly !== undefined) {
            request['time_in_force'] = 'post_only';
        } else if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        const stopLoss = this.safeValue (params, 'stopLoss');
        const takeProfit = this.safeValue (params, 'takeProfit');
        const triggerPriceType = this.safeString (params, 'trigger_price_type', 'mark');
        if (stopLoss !== undefined) {
            const stopLossPrice = this.safeString (stopLoss, 'triggerPrice', stopLoss);
            request['trigger_price'] = stopLossPrice;
            request['trigger_type'] = 'stoploss';
            request['trigger_price_type'] = triggerPriceType;
        } else if (takeProfit !== undefined) {
            const takeProfitPrice = this.safeString (takeProfit, 'triggerPrice', takeProfit);
            request['trigger_price'] = takeProfitPrice;
            request['trigger_type'] = 'takeprofit';
            request['trigger_price_type'] = triggerPriceType;
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['label'] = clientOrderId;
        }
        request['signature'] = signature;
        params = this.omit (params, [ 'reduceOnly', 'reduce_only', 'timeInForce', 'time_in_force', 'postOnly', 'test', 'clientOrderId', 'stopPrice', 'triggerPrice', 'trigger_price', 'stopLoss', 'takeProfit', 'trigger_price_type' ]);
        let response = undefined;
        if (test) {
            response = await this.privatePostOrderDebug (this.extend (request, params));
        } else {
            response = await this.privatePostOrder (this.extend (request, params));
        }
        //
        // {
        //     "result": {
        //         "raw_data": {
        //             "subaccount_id": 130837,
        //             "nonce": 1736923517552,
        //             "module": "0x87F2863866D85E3192a35A73b388BD625D83f2be",
        //             "expiry": 86400,
        //             "owner": "0x108b9aF9279a525b8A8AeAbE7AC2bA925Bc50075",
        //             "signer": "0x108b9aF9279a525b8A8AeAbE7AC2bA925Bc50075",
        //             "signature": "0xaa4f42b2f3da33c668fa703ea872d4c3a6b55aca66025b5119e3bebb6679fe2e2794638db51dcace21fc39a498047835994f07eb59f311bb956ce057e66793d1c",
        //             "data": {
        //                 "asset": "0xAFB6Bb95cd70D5367e2C39e9dbEb422B9815339D",
        //                 "sub_id": 0,
        //                 "limit_price": "10000",
        //                 "desired_amount": "0.001",
        //                 "worst_fee": "0",
        //                 "recipient_id": 130837,
        //                 "is_bid": true,
        //                 "trade_id": ""
        //             }
        //         },
        //         "encoded_data": "0x000000000000000000000000afb6bb95cd70d5367e2c39e9dbeb422b9815339d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000021e19e0c9bab240000000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001ff150000000000000000000000000000000000000000000000000000000000000001",
        //         "encoded_data_hashed": "0xe88fb416bc54dba2d288988f1a82fee40fd792ed555b3471b5f6b4b810d279b4",
        //         "action_hash": "0x273a0befb3751fa991edc7ed73582456c3b50ae964d458c8f472e932fb6a0069",
        //         "typed_data_hash": "0x123e2d2f3d5b2473b4e260f51c6459d6bf904e5db8f042a3ea63be8d55329ce9"
        //     },
        //     "id": "f851c8c4-dddf-4b77-93cf-aeddd0966f29"
        // }
        // {
        //     "result": {
        //         "order": {
        //             "subaccount_id": 130837,
        //             "order_id": "96349ebb-7d46-43ae-81c7-7ab390444293",
        //             "instrument_name": "BTC-PERP",
        //             "direction": "buy",
        //             "label": "",
        //             "quote_id": null,
        //             "creation_timestamp": 1737467576257,
        //             "last_update_timestamp": 1737467576257,
        //             "limit_price": "10000",
        //             "amount": "0.01",
        //             "filled_amount": "0",
        //             "average_price": "0",
        //             "order_fee": "0",
        //             "order_type": "limit",
        //             "time_in_force": "gtc",
        //             "order_status": "open",
        //             "max_fee": "210",
        //             "signature_expiry_sec": 1737468175989,
        //             "nonce": 1737467575989,
        //             "signer": "0x30CB7B06AdD6749BbE146A6827502B8f2a79269A",
        //             "signature": "0xd1ca49df1fa06bd805bb59b132ff6c0de29bf973a3e01705abe0a01cc956e4945ed9eb99ab68f3df4c037908113cac5a5bfc3a954a0b7103cdab285962fa6a51c",
        //             "cancel_reason": "",
        //             "mmp": false,
        //             "is_transfer": false,
        //             "replaced_order_id": null,
        //             "trigger_type": null,
        //             "trigger_price_type": null,
        //             "trigger_price": null,
        //             "trigger_reject_message": null
        //         },
        //         "trades": []
        //     },
        //     "id": "397087fa-0125-42af-bfc3-f66166f9fb55"
        // }
        //
        const result = this.safeDict (response, 'result');
        let rawOrder = this.safeDict (result, 'raw_data');
        if (rawOrder === undefined) {
            rawOrder = this.safeDict (result, 'order');
        }
        const order = this.parseOrder (rawOrder, market);
        order['type'] = type;
        return order;
    }

    /**
     * @method
     * @name derive#editOrder
     * @description edit a trade order
     * @see https://docs.derive.xyz/reference/post_private-replace
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const maxFee = this.safeNumber (params, 'max_fee', 0);
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only');
        const timeInForce = this.safeStringLower2 (params, 'timeInForce', 'time_in_force');
        const postOnly = this.safeBool (params, 'postOnly');
        const orderType = type.toLowerCase ();
        const orderSide = side.toLowerCase ();
        const nonce = this.now ();
        const signatureExpiry = this.safeNumber (params, 'signature_expiry_sec', this.seconds () + 7776000);
        // TODO: subaccount id / trade module address
        const ACTION_TYPEHASH = '0x4d7a9f27c403ff9c0f19bce61d76d82f9aa29f8d6d4b0c5474607d9770d1af17';
        const TRADE_MODULE_ADDRESS = '0x87F2863866D85E3192a35A73b388BD625D83f2be';
        const tradeModuleDataHash = this.hash (this.ethAbiEncode ([
            'address', 'uint', 'int', 'int', 'uint', 'uint', 'bool',
        ], [
            market['info']['base_asset_address'],
            market['info']['base_asset_sub_id'],
            this.parseUnits (price.toString ()),
            this.parseUnits (this.amountToPrecision (symbol, amount.toString ())),
            this.parseUnits (maxFee.toString ()),
            subaccountId,
            orderSide === 'buy',
        ]), keccak, 'hex');
        let contractWalletAddress = undefined;
        [ contractWalletAddress, params ] = this.handleOptionAndParams (params, 'createOrder', 'contractWalletAddress');
        const signature = this.signOrder ([
            ACTION_TYPEHASH,
            subaccountId,
            nonce,
            TRADE_MODULE_ADDRESS,
            '0x' + tradeModuleDataHash,
            signatureExpiry,
            contractWalletAddress,
            this.walletAddress,
        ], this.privateKey);
        const request: Dict = {
            'instrument_name': market['id'],
            'order_id_to_cancel': id,
            'direction': orderSide,
            'order_type': orderType,
            'nonce': nonce,
            'amount': amount,
            'limit_price': price,
            'max_fee': maxFee,
            'subaccount_id': subaccountId,
            'signature_expiry_sec': signatureExpiry,
            'signer': this.walletAddress,
        };
        if (reduceOnly !== undefined) {
            request['reduce_only'] = reduceOnly;
            if (reduceOnly && postOnly) {
                throw new InvalidOrder (this.id + ' cannot use reduce only with post only time in force');
            }
        }
        if (postOnly !== undefined) {
            request['time_in_force'] = 'post_only';
        } else if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['label'] = clientOrderId;
        }
        request['signature'] = signature;
        params = this.omit (params, [ 'reduceOnly', 'reduce_only', 'timeInForce', 'time_in_force', 'postOnly', 'clientOrderId' ]);
        const response = await this.privatePostReplace (this.extend (request, params));
        //
        //   {
        //     "result":
        //       {
        //         "cancelled_order":
        //           {
        //             "subaccount_id": 130837,
        //             "order_id": "c2337704-f1af-437d-91c8-dddb9d6bac59",
        //             "instrument_name": "BTC-PERP",
        //             "direction": "buy",
        //             "label": "test1234",
        //             "quote_id": null,
        //             "creation_timestamp": 1737539743959,
        //             "last_update_timestamp": 1737539764234,
        //             "limit_price": "10000",
        //             "amount": "0.01",
        //             "filled_amount": "0",
        //             "average_price": "0",
        //             "order_fee": "0",
        //             "order_type": "limit",
        //             "time_in_force": "post_only",
        //             "order_status": "cancelled",
        //             "max_fee": "211",
        //             "signature_expiry_sec": 1737540343631,
        //             "nonce": 1737539743631,
        //             "signer": "0x30CB7B06AdD6749BbE146A6827502B8f2a79269A",
        //             "signature": "0xdb669e18f407a3efa816b79c0dd3bac1c651d4dbf3caad4db67678ce9b81c76378d787a08143a30707eb0827ce4626640767c9f174358df1b90611bd6d1391711b",
        //             "cancel_reason": "user_request",
        //             "mmp": false,
        //             "is_transfer": false,
        //             "replaced_order_id": null,
        //             "trigger_type": null,
        //             "trigger_price_type": null,
        //             "trigger_price": null,
        //             "trigger_reject_message": null,
        //           },
        //         "order":
        //           {
        //             "subaccount_id": 130837,
        //             "order_id": "97af0902-813f-4892-a54b-797e5689db05",
        //             "instrument_name": "BTC-PERP",
        //             "direction": "buy",
        //             "label": "test1234",
        //             "quote_id": null,
        //             "creation_timestamp": 1737539764154,
        //             "last_update_timestamp": 1737539764154,
        //             "limit_price": "10000",
        //             "amount": "0.01",
        //             "filled_amount": "0",
        //             "average_price": "0",
        //             "order_fee": "0",
        //             "order_type": "limit",
        //             "time_in_force": "post_only",
        //             "order_status": "open",
        //             "max_fee": "211",
        //             "signature_expiry_sec": 1737540363890,
        //             "nonce": 1737539763890,
        //             "signer": "0x30CB7B06AdD6749BbE146A6827502B8f2a79269A",
        //             "signature": "0xef2c459ab4797cbbd7d97b47678ff172542af009bac912bf53e7879cf92eb1aa6b1a6cf40bf0928684f5394942fb424cc2db71eac0eaf7226a72480034332f291c",
        //             "cancel_reason": "",
        //             "mmp": false,
        //             "is_transfer": false,
        //             "replaced_order_id": "c2337704-f1af-437d-91c8-dddb9d6bac59",
        //             "trigger_type": null,
        //             "trigger_price_type": null,
        //             "trigger_price": null,
        //             "trigger_reject_message": null,
        //           },
        //         "trades": [],
        //         "create_order_error": null,
        //       },
        //     "id": "fb19e991-15f6-4c80-a20c-917e762a1a38",
        //   }
        //
        const result = this.safeDict (response, 'result');
        const rawOrder = this.safeDict (result, 'order');
        const order = this.parseOrder (rawOrder, market);
        return order;
    }

    /**
     * @method
     * @name derive#cancelOrder
     * @see https://docs.derive.xyz/reference/post_private-cancel
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market: Market = this.market (symbol);
        const isTrigger = this.safeBool2 (params, 'trigger', 'stop', false);
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        params = this.omit (params, [ 'subaccount_id', 'trigger', 'stop' ]);
        const request: Dict = {
            'instrument_name': market['id'],
            'subaccount_id': subaccountId,
        };
        const clientOrderIdUnified = this.safeString (params, 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString (params, 'label', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        let response = undefined;
        if (isByClientOrder) {
            request['label'] = clientOrderIdExchangeSpecific;
            params = this.omit (params, [ 'clientOrderId', 'label' ]);
            response = await this.privatePostCancelByLabel (this.extend (request, params));
        } else {
            request['order_id'] = id;
            if (isTrigger) {
                response = await this.privatePostCancelTriggerOrder (this.extend (request, params));
            } else {
                response = await this.privatePostCancel (this.extend (request, params));
            }
        }
        //
        // {
        //     "result": {
        //         "subaccount_id": 130837,
        //         "order_id": "de4f30b6-0dcb-4df6-9222-c1a27f1ad80d",
        //         "instrument_name": "BTC-PERP",
        //         "direction": "buy",
        //         "label": "test1234",
        //         "quote_id": null,
        //         "creation_timestamp": 1737540100989,
        //         "last_update_timestamp": 1737540574696,
        //         "limit_price": "10000",
        //         "amount": "0.01",
        //         "filled_amount": "0",
        //         "average_price": "0",
        //         "order_fee": "0",
        //         "order_type": "limit",
        //         "time_in_force": "post_only",
        //         "order_status": "cancelled",
        //         "max_fee": "211",
        //         "signature_expiry_sec": 1737540700726,
        //         "nonce": 1737540100726,
        //         "signer": "0x30CB7B06AdD6749BbE146A6827502B8f2a79269A",
        //         "signature": "0x9cd1a6e32a0699929e4e090c08c548366b1353701ec56e02d5cdf37fc89bd19b7b29e00e57e8383bb6336d73019027a7e2a4364f40859e7a949115024c7f199a1b",
        //         "cancel_reason": "user_request",
        //         "mmp": false,
        //         "is_transfer": false,
        //         "replaced_order_id": "4ccc89ba-3c3d-4047-8900-0aa5fb4ef706",
        //         "trigger_type": null,
        //         "trigger_price_type": null,
        //         "trigger_price": null,
        //         "trigger_reject_message": null
        //     },
        //     "id": "cef61e2a-cb13-4779-8e6b-535361981fad"
        // }
        //
        // {
        //     "result": {
        //         "cancelled_orders": 1
        //     },
        //     "id": "674e075e-1e8a-4a47-99ff-75efbdd2370f"
        // }
        //
        const extendParams: Dict = { 'symbol': symbol };
        const order = this.safeDict (response, 'result');
        if (isByClientOrder) {
            extendParams['client_order_id'] = clientOrderIdExchangeSpecific;
        }
        return this.extend (this.parseOrder (order, market), extendParams);
    }

    /**
     * @method
     * @name derive#cancelAllOrders
     * @see https://docs.derive.xyz/reference/post_private-cancel-by-instrument
     * @see https://docs.derive.xyz/reference/post_private-cancel-all
     * @description cancel all open orders in a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let response = undefined;
        if (market !== undefined) {
            request['instrument_name'] = market['id'];
            response = await this.privatePostCancelByInstrument (this.extend (request, params));
        } else {
            response = await this.privatePostCancelAll (this.extend (request, params));
        }
        //
        // {
        //     "result": {
        //         "cancelled_orders": 0
        //     },
        //     "id": "9d633799-2098-4559-b547-605bb6f4d8f4"
        // }
        //
        // {
        //     "id": "45548646-c74f-4ca2-9de4-551e6de49afa",
        //     "result": "ok"
        // }
        //
        return response;
    }

    /**
     * @method
     * @name derive#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.derive.xyz/reference/post_private-get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchOrders', symbol, since, limit, params, 'page', 500) as Order[];
        }
        const isTrigger = this.safeBool2 (params, 'trigger', 'stop', false);
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        params = this.omit (params, [ 'subaccount_id', 'trigger', 'stop' ]);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        } else {
            request['page_size'] = 500;
        }
        if (isTrigger) {
            request['status'] = 'untriggered';
        }
        const response = await this.privatePostGetOrders (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "subaccount_id": 130837,
        //         "orders": [
        //             {
        //                 "subaccount_id": 130837,
        //                 "order_id": "63a80cb8-387b-472b-a838-71cd9513c365",
        //                 "instrument_name": "BTC-PERP",
        //                 "direction": "buy",
        //                 "label": "test1234",
        //                 "quote_id": null,
        //                 "creation_timestamp": 1737551053207,
        //                 "last_update_timestamp": 1737551053207,
        //                 "limit_price": "10000",
        //                 "amount": "0.01",
        //                 "filled_amount": "0",
        //                 "average_price": "0",
        //                 "order_fee": "0",
        //                 "order_type": "limit",
        //                 "time_in_force": "post_only",
        //                 "order_status": "open",
        //                 "max_fee": "211",
        //                 "signature_expiry_sec": 1737551652765,
        //                 "nonce": 1737551052765,
        //                 "signer": "0x30CB7B06AdD6749BbE146A6827502B8f2a79269A",
        //                 "signature": "0x35535ccb1bcad509ecc435c79e966174db6403fc9aeee1e237d08a941014c57b59279dfe4be39e081f9921a53eaad59cb2a151d9f52f2d05fc47e6280254952e1c",
        //                 "cancel_reason": "",
        //                 "mmp": false,
        //                 "is_transfer": false,
        //                 "replaced_order_id": null,
        //                 "trigger_type": null,
        //                 "trigger_price_type": null,
        //                 "trigger_price": null,
        //                 "trigger_reject_message": null
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 1
        //         }
        //     },
        //     "id": "e5a88d4f-7ac7-40cd-aec9-e0e8152b8b92"
        // }
        //
        const data = this.safeValue (response, 'result', response);
        const orders = this.safeList (data, 'orders');
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name derive#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.derive.xyz/reference/post_private-get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const extendedParams = this.extend (params, { 'status': 'open' });
        return await this.fetchOrders (symbol, since, limit, extendedParams);
    }

    /**
     * @method
     * @name derive#fetchClosedOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.derive.xyz/reference/post_private-get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const extendedParams = this.extend (params, { 'status': 'filled' });
        return await this.fetchOrders (symbol, since, limit, extendedParams);
    }

    /**
     * @method
     * @name derive#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.derive.xyz/reference/post_private-get-orders
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const extendedParams = this.extend (params, { 'status': 'cancelled' });
        return await this.fetchOrders (symbol, since, limit, extendedParams);
    }

    parseTimeInForce (timeInForce: Str) {
        const timeInForces: Dict = {
            'ioc': 'IOC',
            'fok': 'FOK',
            'gtc': 'GTC',
            'post_only': 'PO',
        };
        return this.safeString (timeInForces, timeInForce, undefined);
    }

    parseOrderStatus (status: Str) {
        if (status !== undefined) {
            const statuses: Dict = {
                'open': 'open',
                'untriggered': 'open',
                'filled': 'closed',
                'cancelled': 'canceled',
                'expired': 'rejected',
            };
            return this.safeString (statuses, status, status);
        }
        return status;
    }

    parseOrder (rawOrder: Dict, market: Market = undefined): Order {
        //
        // {
        //     "subaccount_id": 130837,
        //     "nonce": 1736923517552,
        //     "module": "0x87F2863866D85E3192a35A73b388BD625D83f2be",
        //     "expiry": 86400,
        //     "owner": "0x108b9aF9279a525b8A8AeAbE7AC2bA925Bc50075",
        //     "signer": "0x108b9aF9279a525b8A8AeAbE7AC2bA925Bc50075",
        //     "signature": "0xaa4f42b2f3da33c668fa703ea872d4c3a6b55aca66025b5119e3bebb6679fe2e2794638db51dcace21fc39a498047835994f07eb59f311bb956ce057e66793d1c",
        //     "data": {
        //         "asset": "0xAFB6Bb95cd70D5367e2C39e9dbEb422B9815339D",
        //         "sub_id": 0,
        //         "limit_price": "10000",
        //         "desired_amount": "0.001",
        //         "worst_fee": "0",
        //         "recipient_id": 130837,
        //         "is_bid": true,
        //         "trade_id": ""
        //     }
        // }
        // {
        //     "subaccount_id": 130837,
        //     "order_id": "96349ebb-7d46-43ae-81c7-7ab390444293",
        //     "instrument_name": "BTC-PERP",
        //     "direction": "buy",
        //     "label": "",
        //     "quote_id": null,
        //     "creation_timestamp": 1737467576257,
        //     "last_update_timestamp": 1737467576257,
        //     "limit_price": "10000",
        //     "amount": "0.01",
        //     "filled_amount": "0",
        //     "average_price": "0",
        //     "order_fee": "0",
        //     "order_type": "limit",
        //     "time_in_force": "gtc",
        //     "order_status": "open",
        //     "max_fee": "210",
        //     "signature_expiry_sec": 1737468175989,
        //     "nonce": 1737467575989,
        //     "signer": "0x30CB7B06AdD6749BbE146A6827502B8f2a79269A",
        //     "signature": "0xd1ca49df1fa06bd805bb59b132ff6c0de29bf973a3e01705abe0a01cc956e4945ed9eb99ab68f3df4c037908113cac5a5bfc3a954a0b7103cdab285962fa6a51c",
        //     "cancel_reason": "",
        //     "mmp": false,
        //     "is_transfer": false,
        //     "replaced_order_id": null,
        //     "trigger_type": null,
        //     "trigger_price_type": null,
        //     "trigger_price": null,
        //     "trigger_reject_message": null
        // }
        let order = this.safeDict (rawOrder, 'data');
        if (order === undefined) {
            order = rawOrder;
        }
        const timestamp = this.safeInteger (rawOrder, 'nonce');
        const orderId = this.safeString (order, 'order_id');
        const marketId = this.safeString (order, 'instrument_name');
        if (marketId !== undefined) {
            market = this.safeMarket (marketId, market);
        }
        const symbol = market['symbol'];
        const price = this.safeString (order, 'limit_price');
        const average = this.safeString (order, 'average_price');
        const amount = this.safeString (order, 'desired_amount');
        const filled = this.safeString (order, 'filled_amount');
        const fee = this.safeString (order, 'order_fee');
        const orderType = this.safeStringLower (order, 'order_type');
        const isBid = this.safeBool (order, 'is_bid');
        let side = this.safeString (order, 'direction');
        if (side === undefined) {
            if (isBid) {
                side = 'buy';
            } else {
                side = 'sell';
            }
        }
        const triggerType = this.safeString (order, 'trigger_type');
        let stopLossPrice = undefined;
        let takeProfitPrice = undefined;
        let triggerPrice = undefined;
        if (triggerType !== undefined) {
            triggerPrice = this.safeString (order, 'trigger_price');
            if (triggerType === 'stoploss') {
                stopLossPrice = triggerPrice;
            } else {
                takeProfitPrice = triggerPrice;
            }
        }
        const lastUpdateTimestamp = this.safeInteger (rawOrder, 'last_update_timestamp');
        const status = this.safeString (order, 'order_status');
        const timeInForce = this.safeString (order, 'time_in_force');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': this.safeString (order, 'label'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus (status),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce (timeInForce),
            'postOnly': undefined, // handled in safeOrder
            'reduceOnly': this.safeBool (order, 'reduce_only'),
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': {
                'cost': fee,
                'currency': 'USDC',
            },
            'info': order,
        }, market);
    }

    /**
     * @method
     * @name derive#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.derive.xyz/reference/post_private-get-trade-history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const request: Dict = {
            'order_id': id,
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['from_timestamp'] = since;
        }
        params = this.omit (params, [ 'subaccount_id' ]);
        const response = await this.privatePostGetTradeHistory (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "subaccount_id": 130837,
        //         "trades": [
        //             {
        //                 "subaccount_id": 130837,
        //                 "order_id": "30c48194-8d48-43ac-ad00-0d5ba29eddc9",
        //                 "instrument_name": "BTC-PERP",
        //                 "direction": "sell",
        //                 "label": "test1234",
        //                 "quote_id": null,
        //                 "trade_id": "f8a30740-488c-4c2d-905d-e17057bafde1",
        //                 "timestamp": 1738065303708,
        //                 "mark_price": "102740.137375457314192317",
        //                 "index_price": "102741.553409299981533184",
        //                 "trade_price": "102700.6",
        //                 "trade_amount": "0.01",
        //                 "liquidity_role": "taker",
        //                 "realized_pnl": "0",
        //                 "realized_pnl_excl_fees": "0",
        //                 "is_transfer": false,
        //                 "tx_status": "settled",
        //                 "trade_fee": "1.127415534092999815",
        //                 "tx_hash": "0xc55df1f07330faf86579bd8a6385391fbe9e73089301149d8550e9d29c9ead74",
        //                 "transaction_id": "e18b9426-3fa5-41bb-99d3-8b54fb4d51bb"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 1
        //         }
        //     },
        //     "id": "a16f798c-a121-44e2-b77e-c38a063f8a99"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const trades = this.safeList (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    /**
     * @method
     * @name derive#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.derive.xyz/reference/post_private-get-trade-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch trades with pagination
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchMyTrades', symbol, since, limit, params, 'page', 500) as Trade[];
        }
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['from_timestamp'] = since;
        }
        params = this.omit (params, [ 'subaccount_id' ]);
        const response = await this.privatePostGetTradeHistory (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "subaccount_id": 130837,
        //         "trades": [
        //             {
        //                 "subaccount_id": 130837,
        //                 "order_id": "30c48194-8d48-43ac-ad00-0d5ba29eddc9",
        //                 "instrument_name": "BTC-PERP",
        //                 "direction": "sell",
        //                 "label": "test1234",
        //                 "quote_id": null,
        //                 "trade_id": "f8a30740-488c-4c2d-905d-e17057bafde1",
        //                 "timestamp": 1738065303708,
        //                 "mark_price": "102740.137375457314192317",
        //                 "index_price": "102741.553409299981533184",
        //                 "trade_price": "102700.6",
        //                 "trade_amount": "0.01",
        //                 "liquidity_role": "taker",
        //                 "realized_pnl": "0",
        //                 "realized_pnl_excl_fees": "0",
        //                 "is_transfer": false,
        //                 "tx_status": "settled",
        //                 "trade_fee": "1.127415534092999815",
        //                 "tx_hash": "0xc55df1f07330faf86579bd8a6385391fbe9e73089301149d8550e9d29c9ead74",
        //                 "transaction_id": "e18b9426-3fa5-41bb-99d3-8b54fb4d51bb"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 1
        //         }
        //     },
        //     "id": "a16f798c-a121-44e2-b77e-c38a063f8a99"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const trades = this.safeList (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchPositions (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        params = this.omit (params, [ 'subaccount_id' ]);
        const response = await this.privatePostGetPositions (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "subaccount_id": 130837,
        //         "positions": [
        //             {
        //                 "instrument_type": "perp",
        //                 "instrument_name": "BTC-PERP",
        //                 "amount": "-0.02",
        //                 "average_price": "102632.9105389869500088",
        //                 "realized_pnl": "0",
        //                 "unrealized_pnl": "-2.6455959784245548835819950103759765625",
        //                 "total_fees": "2.255789220260999824",
        //                 "average_price_excl_fees": "102745.7",
        //                 "realized_pnl_excl_fees": "0",
        //                 "unrealized_pnl_excl_fees": "-0.3898067581635550595819950103759765625",
        //                 "net_settlements": "-4.032902047219498639",
        //                 "cumulative_funding": "-0.004677736347850093",
        //                 "pending_funding": "0",
        //                 "mark_price": "102765.190337908177752979099750518798828125",
        //                 "index_price": "102767.657193800017641472",
        //                 "delta": "1",
        //                 "gamma": "0",
        //                 "vega": "0",
        //                 "theta": "0",
        //                 "mark_value": "1.38730606879471451975405216217041015625",
        //                 "maintenance_margin": "-101.37788426911356509663164615631103515625",
        //                 "initial_margin": "-132.2074413704858670826070010662078857421875",
        //                 "open_orders_margin": "264.116085900726830004714429378509521484375",
        //                 "leverage": "8.6954476205089299495699106539379941746377322586618",
        //                 "liquidation_price": "109125.705451984322280623018741607666015625",
        //                 "creation_timestamp": 1738065303840
        //             }
        //         ]
        //     },
        //     "id": "167350f1-d9fc-41d4-9797-1c78f83fda8e"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const positions = this.safeList (result, 'positions', []);
        return this.parsePositions (positions, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // {
        //     "instrument_type": "perp",
        //     "instrument_name": "BTC-PERP",
        //     "amount": "-0.02",
        //     "average_price": "102632.9105389869500088",
        //     "realized_pnl": "0",
        //     "unrealized_pnl": "-2.6455959784245548835819950103759765625",
        //     "total_fees": "2.255789220260999824",
        //     "average_price_excl_fees": "102745.7",
        //     "realized_pnl_excl_fees": "0",
        //     "unrealized_pnl_excl_fees": "-0.3898067581635550595819950103759765625",
        //     "net_settlements": "-4.032902047219498639",
        //     "cumulative_funding": "-0.004677736347850093",
        //     "pending_funding": "0",
        //     "mark_price": "102765.190337908177752979099750518798828125",
        //     "index_price": "102767.657193800017641472",
        //     "delta": "1",
        //     "gamma": "0",
        //     "vega": "0",
        //     "theta": "0",
        //     "mark_value": "1.38730606879471451975405216217041015625",
        //     "maintenance_margin": "-101.37788426911356509663164615631103515625",
        //     "initial_margin": "-132.2074413704858670826070010662078857421875",
        //     "open_orders_margin": "264.116085900726830004714429378509521484375",
        //     "leverage": "8.6954476205089299495699106539379941746377322586618",
        //     "liquidation_price": "109125.705451984322280623018741607666015625",
        //     "creation_timestamp": 1738065303840
        // }
        //
        const contract = this.safeString (position, 'instrument_name');
        market = this.safeMarket (contract, market);
        let size = this.safeString (position, 'amount');
        let side: Str = undefined;
        if (Precise.stringGt (size, '0')) {
            side = 'long';
        } else {
            side = 'short';
        }
        const contractSize = this.safeString (market, 'contractSize');
        const markPrice = this.safeString (position, 'mark_price');
        const timestamp = this.safeTimestamp (position, 'creation_timestamp');
        const unrealisedPnl = this.safeString (position, 'unrealized_pnl');
        size = Precise.stringAbs (size);
        const notional = Precise.stringMul (size, markPrice);
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.safeString (position, 'initial_margin'),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': this.safeString (position, 'maintenance_margin'),
            'maintenanceMarginPercentage': undefined,
            'entryPrice': undefined,
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size),
            'contractSize': this.parseNumber (contractSize),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidation_price'),
            'markPrice': this.parseNumber (markPrice),
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
     * @name derive#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://docs.derive.xyz/reference/post_private-get-funding-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchFundingHistory', symbol, since, limit, params, 'page', 500) as FundingHistory[];
        }
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        params = this.omit (params, [ 'subaccount_id' ]);
        const response = await this.privatePostGetFundingHistory (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "events": [
        //             {
        //                 "instrument_name": "BTC-PERP",
        //                 "timestamp": 1738066618272,
        //                 "funding": "-0.004677736347850093",
        //                 "pnl": "-0.944081615774632967"
        //             },
        //             {
        //                 "instrument_name": "BTC-PERP",
        //                 "timestamp": 1738066617964,
        //                 "funding": "0",
        //                 "pnl": "-0.437556413479249408"
        //             },
        //             {
        //                 "instrument_name": "BTC-PERP",
        //                 "timestamp": 1738065307565,
        //                 "funding": "0",
        //                 "pnl": "-0.39547479770461644"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 3
        //         }
        //     },
        //     "id": "524b817f-2108-467f-8795-511066f4acec"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const events = this.safeList (result, 'events', []);
        return this.parseIncomes (events, market, since, limit);
    }

    parseIncome (income, market: Market = undefined) {
        //
        // {
        //     "instrument_name": "BTC-PERP",
        //     "timestamp": 1738065307565,
        //     "funding": "0",
        //     "pnl": "-0.39547479770461644"
        // }
        //
        const marketId = this.safeString (income, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        let amount = this.safeString (income, 'funding');
        const code = this.safeCurrencyCode ('USDC');
        const timestamp = this.safeInteger (income, 'timestamp');
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': undefined,
            'amount': this.parseNumber (amount),
            'rate': undefined,
        };
    }

    /**
     * @method
     * @name derive#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.derive.xyz/reference/post_private-get-all-portfolios
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let contractWalletAddress = undefined;
        [ contractWalletAddress, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'contractWalletAddress');
        const request = {
            'wallet': contractWalletAddress,
        };
        const response = await this.privatePostGetAllPortfolios (this.extend (request, params));
        //
        // {
        //     "result": [{
        //             "subaccount_id": 130837,
        //             "label": "",
        //             "currency": "all",
        //             "margin_type": "SM",
        //             "is_under_liquidation": false,
        //             "positions_value": "0",
        //             "collaterals_value": "318.0760325000001103035174310207366943359375",
        //             "subaccount_value": "318.0760325000001103035174310207366943359375",
        //             "positions_maintenance_margin": "0",
        //             "positions_initial_margin": "0",
        //             "collaterals_maintenance_margin": "238.557024375000082727638073265552520751953125",
        //             "collaterals_initial_margin": "190.845619500000083235136116854846477508544921875",
        //             "maintenance_margin": "238.557024375000082727638073265552520751953125",
        //             "initial_margin": "190.845619500000083235136116854846477508544921875",
        //             "open_orders_margin": "0",
        //             "projected_margin_change": "0",
        //             "open_orders": [],
        //             "positions": [],
        //             "collaterals": [
        //                 {
        //                     "asset_type": "erc20",
        //                     "asset_name": "ETH",
        //                     "currency": "ETH",
        //                     "amount": "0.1",
        //                     "mark_price": "3180.760325000000438272",
        //                     "mark_value": "318.0760325000001103035174310207366943359375",
        //                     "cumulative_interest": "0",
        //                     "pending_interest": "0",
        //                     "initial_margin": "190.845619500000083235136116854846477508544921875",
        //                     "maintenance_margin": "238.557024375000082727638073265552520751953125",
        //                     "realized_pnl": "0",
        //                     "average_price": "3184.891931",
        //                     "unrealized_pnl": "-0.413161",
        //                     "total_fees": "0",
        //                     "average_price_excl_fees": "3184.891931",
        //                     "realized_pnl_excl_fees": "0",
        //                     "unrealized_pnl_excl_fees": "-0.413161",
        //                     "open_orders_margin": "0",
        //                     "creation_timestamp": 1736860533493
        //                 }
        //             ]
        //     }],
        //     "id": "27b9a64e-3379-4ce6-a126-9fb941c4a970"
        // }
        //
        const result = this.safeList (response, 'result');
        return this.parseBalance (result);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        // TODO:
        // checked multiple subaccounts
        // checked balance after open orders / positions
        for (let i = 0; i < response.length; i++) {
            const subaccount = response[i];
            const collaterals = this.safeList (subaccount, 'collaterals', []);
            for (let i = 0; i < collaterals.length; i++) {
                const balance = collaterals[i];
                const code = this.safeCurrencyCode (this.safeString (balance, 'currency'));
                const account = this.account ();
                account['total'] = this.safeString (balance, 'amount');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name derive#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.derive.xyz/reference/post_private-get-deposit-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        params = this.omit (params, [ 'subaccount_id' ]);
        const response = await this.privatePostGetDepositHistory (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "events": [
        //             {
        //                 "timestamp": 1736860533599,
        //                 "transaction_id": "f2069395-ec00-49f5-925a-87202a5d240f",
        //                 "asset": "ETH",
        //                 "amount": "0.1",
        //                 "tx_status": "settled",
        //                 "tx_hash": "0xeda21a315c59302a19c42049b4cef05a10b685302b6cc3edbaf49102d91166d4",
        //                 "error_log": {}
        //             }
        //         ]
        //     },
        //     "id": "ceebc730-22ab-40cd-9941-33ceb2a74389"
        // }
        //
        const currency = this.safeCurrency (code);
        const result = this.safeDict (response, 'result', {});
        const events = this.safeList (result, 'events');
        return this.parseTransactions (events, currency, since, limit, params);
    }

    /**
     * @method
     * @name derive#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.derive.xyz/reference/post_private-get-withdrawal-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const subaccountId = this.safeInteger (params, 'subaccount_id', 0);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        params = this.omit (params, [ 'subaccount_id' ]);
        const response = await this.privatePostGetWithdrawalHistory (this.extend (request, params));
        //
        // {
        //     "result": {
        //         "events": [
        //             {
        //                 "timestamp": 1736860533599,
        //                 "transaction_id": "f2069395-ec00-49f5-925a-87202a5d240f",
        //                 "asset": "ETH",
        //                 "amount": "0.1",
        //                 "tx_status": "settled",
        //                 "tx_hash": "0xeda21a315c59302a19c42049b4cef05a10b685302b6cc3edbaf49102d91166d4",
        //                 "error_log": {}
        //             }
        //         ]
        //     },
        //     "id": "ceebc730-22ab-40cd-9941-33ceb2a74389"
        // }
        //
        const currency = this.safeCurrency (code);
        const result = this.safeDict (response, 'result', {});
        const events = this.safeList (result, 'events');
        return this.parseTransactions (events, currency, since, limit, params);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // {
        //     "timestamp": 1736860533599,
        //     "transaction_id": "f2069395-ec00-49f5-925a-87202a5d240f",
        //     "asset": "ETH",
        //     "amount": "0.1",
        //     "tx_status": "settled",
        //     "tx_hash": "0xeda21a315c59302a19c42049b4cef05a10b685302b6cc3edbaf49102d91166d4",
        //     "error_log": {}
        // }
        //
        const code = this.safeString (transaction, 'asset');
        const timestamp = this.safeInteger (transaction, 'timestamp');
        let txId = this.safeString (transaction, 'tx_hash');
        if (txId === '0x0') {
            txId = undefined;
        }
        return {
            'info': transaction,
            'id': undefined,
            'txid': txId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'tx_status')),
            'updated': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': undefined,
            'network': undefined,
        } as Transaction;
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'settled': 'ok',
            'reverted': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        const error = this.safeDict (response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api'][api] + '/' + path;
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            if (api === 'private') {
                this.checkRequiredCredentials ();
                const now = this.now ().toString ();
                const signature = this.signMessage (now, this.privateKey);
                const contractWalletAddress = this.safeString (this.options, 'contractWalletAddress');
                headers['X-LyraWallet'] = contractWalletAddress;
                headers['X-LyraTimestamp'] = now;
                headers['X-LyraSignature'] = signature;
            }
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
