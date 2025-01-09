
//  ---------------------------------------------------------------------------

import { BadRequest, InvalidOrder, Precise } from '../ccxt.js';
import Exchange from './abstract/derive.js';
import { TICK_SIZE } from './base/functions/number.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Dict, Currencies, Market, MarketType, Bool, Str, Ticker, Int, int, Trade, OrderType, OrderSide, Num, FundingRateHistory, FundingRate, Balances } from './base/types.js';

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
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
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
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
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
                'fetchWithdrawals': false,
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
                    '14000': BadRequest, // {"code": 14000, "message": "Account not found"}
                    '14001': InvalidOrder, // {"code": 14001, "message": "Subaccount not found"}
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
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
            'order': undefined,
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
        // takes a binary encoded message
        // const binaryMessage = this.encode (message);
        const DOMAIN_SEPARATOR = '9bcf4dc06df5d8bf23af818d5716491b995020f377d3b7b64c29ed14e3dd1105';
        const binaryDomainSeparator = this.base16ToBinary (this.remove0xPrefix (DOMAIN_SEPARATOR));
        const prefix = this.encode ('\x1901');
        return '0x' + this.hash (this.binaryConcat (prefix, binaryDomainSeparator, binaryMessage), keccak, 'hex');
    }

    signOrder (order, privateKey) {
        // const accountHash = this.binaryToBase16 (this.ethAbiEncode ([
        //     'bytes32', 'uint256', 'uint256', 'address', 'bytes32', 'uint256', 'address', 'address',
        // ], order));
        const accountHash = this.ethAbiEncode ([
            'bytes32', 'uint256', 'uint256', 'address', 'bytes32', 'uint256', 'address', 'address',
        ], order);
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
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only');
        params = this.omit (params, [ 'reduceOnly', 'reduce_only' ]);
        const orderType = type.toLowerCase ();
        const orderSide = side.toLowerCase ();
        const nonce = this.now ();
        const request: Dict = {
            'instrument_name': market['id'],
            'direction': orderSide,
            'order_type': orderType,
            'nonce': nonce,
            'amount': amount,
            'limit_price': price,
            'max_fee': 0,
            'subaccount_id': 0,
            'signature_expiry_sec': 86400,
            'signer': this.walletAddress,
        };
        // ACTION_TYPEHASH, 
        // order.subaccount_id, 
        // order.nonce, 
        // TRADE_MODULE_ADDRESS, 
        // tradeModuleData, 
        // order.signature_expiry_sec, 
        // wallet.address, 
        // order.signer
        const ACTION_TYPEHASH = '0x4d7a9f27c403ff9c0f19bce61d76d82f9aa29f8d6d4b0c5474607d9770d1af17';
        const ASSET_ADDRESS = '0xBcB494059969DAaB460E0B5d4f5c2366aab79aa1';
        const OPTION_SUB_ID = '644245094401698393600';
        const TRADE_MODULE_ADDRESS = '0x87F2863866D85E3192a35A73b388BD625D83f2be';
        // const subaccount_id = 9
        // ethers.parseUnits(request['limit_price'].toString(), 18),
        const tradeModuleDataHash = this.hash (this.ethAbiEncode ([
            'address', 'uint', 'int', 'int', 'uint', 'uint', 'bool',
        ], [
            ASSET_ADDRESS,
            OPTION_SUB_ID,
            request['limit_price'].toString(),
            request['amount'].toString(),
            request['max_fee'].toString(),
            request['subaccount_id'],
            orderSide === 'buy',
        ]), keccak, 'hex');
        const signature = this.signOrder ([
            ACTION_TYPEHASH,
            request['subaccount_id'],
            request['nonce'],
            TRADE_MODULE_ADDRESS,
            '0x' + tradeModuleDataHash,
            request['signature_expiry_sec'],
            this.walletAddress,
            request['signer'],
        ], this.privateKey);
        request['signature'] = signature;
        // const accountHash = this.hash ();
        // request['signature'] = 'xxx';
        // request['signature_expiry_sec'] = 'xxx';
        // request['signer'] = 'xxx';
        // const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        // const stopLoss = this.safeValue (params, 'stopLoss');
        // const takeProfit = this.safeValue (params, 'takeProfit');
        // const algoType = this.safeString (params, 'algoType');
        // const isConditional = isTrailing || triggerPrice !== undefined || stopLoss !== undefined || takeProfit !== undefined || (this.safeValue (params, 'childOrders') !== undefined);
        // const isMarket = orderType === 'MARKET';
        // const timeInForce = this.safeStringLower (params, 'timeInForce');
        // const postOnly = this.isPostOnly (isMarket, undefined, params);
        // const reduceOnlyKey = isConditional ? 'reduceOnly' : 'reduce_only';
        // const clientOrderIdKey = isConditional ? 'clientOrderId' : 'client_order_id';
        // const orderQtyKey = isConditional ? 'quantity' : 'order_quantity';
        // const priceKey = isConditional ? 'price' : 'order_price';
        // const typeKey = isConditional ? 'type' : 'order_type';
        // request[typeKey] = orderType; // LIMIT/MARKET/IOC/FOK/POST_ONLY/ASK/BID
        // if (!isConditional) {
        //     if (postOnly) {
        //         request['order_type'] = 'POST_ONLY';
        //     } else if (timeInForce === 'fok') {
        //         request['order_type'] = 'FOK';
        //     } else if (timeInForce === 'ioc') {
        //         request['order_type'] = 'IOC';
        //     }
        // }
        // if (reduceOnly) {
        //     request[reduceOnlyKey] = reduceOnly;
        // }
        // if (!isMarket && price !== undefined) {
        //     request[priceKey] = this.priceToPrecision (symbol, price);
        // }
        // if (isMarket && !isConditional) {
        //     // for market buy it requires the amount of quote currency to spend
        //     const cost = this.safeString2 (params, 'cost', 'order_amount');
        //     params = this.omit (params, [ 'cost', 'order_amount' ]);
        //     const isPriceProvided = price !== undefined;
        //     if (market['spot'] && (isPriceProvided || (cost !== undefined))) {
        //         let quoteAmount = undefined;
        //         if (cost !== undefined) {
        //             quoteAmount = this.costToPrecision (symbol, cost);
        //         } else {
        //             const amountString = this.numberToString (amount);
        //             const priceString = this.numberToString (price);
        //             const costRequest = Precise.stringMul (amountString, priceString);
        //             quoteAmount = this.costToPrecision (symbol, costRequest);
        //         }
        //         request['order_amount'] = quoteAmount;
        //     } else {
        //         request['order_quantity'] = this.amountToPrecision (symbol, amount);
        //     }
        // } else if (algoType !== 'POSITIONAL_TP_SL') {
        //     request[orderQtyKey] = this.amountToPrecision (symbol, amount);
        // }
        // const clientOrderId = this.safeStringN (params, [ 'clOrdID', 'clientOrderId', 'client_order_id' ]);
        // if (clientOrderId !== undefined) {
        //     request[clientOrderIdKey] = clientOrderId;
        // }
        // if (triggerPrice !== undefined) {
        //     if (algoType !== 'TRAILING_STOP') {
        //         request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        //         request['algoType'] = 'STOP';
        //     }
        // } else if ((stopLoss !== undefined) || (takeProfit !== undefined)) {
        //     request['algoType'] = 'BRACKET';
        //     const outterOrder: Dict = {
        //         'symbol': market['id'],
        //         'reduceOnly': false,
        //         'algoType': 'POSITIONAL_TP_SL',
        //         'childOrders': [],
        //     };
        //     const closeSide = (orderSide === 'BUY') ? 'SELL' : 'BUY';
        //     if (stopLoss !== undefined) {
        //         const stopLossPrice = this.safeString (stopLoss, 'triggerPrice', stopLoss);
        //         const stopLossOrder: Dict = {
        //             'side': closeSide,
        //             'algoType': 'STOP_LOSS',
        //             'triggerPrice': this.priceToPrecision (symbol, stopLossPrice),
        //             'type': 'CLOSE_POSITION',
        //             'reduceOnly': true,
        //         };
        //         outterOrder['childOrders'].push (stopLossOrder);
        //     }
        //     if (takeProfit !== undefined) {
        //         const takeProfitPrice = this.safeString (takeProfit, 'triggerPrice', takeProfit);
        //         const takeProfitOrder: Dict = {
        //             'side': closeSide,
        //             'algoType': 'TAKE_PROFIT',
        //             'triggerPrice': this.priceToPrecision (symbol, takeProfitPrice),
        //             'type': 'CLOSE_POSITION',
        //             'reduceOnly': true,
        //         };
        //         outterOrder['childOrders'].push (takeProfitOrder);
        //     }
        //     request['childOrders'] = [ outterOrder ];
        // }
        params = this.omit (params, [ 'clOrdID', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'stopLoss', 'takeProfit' ]);
        const response = await this.privatePostOrderDebug (this.extend (request, params));
        //
        //
        const data = this.safeDict (response, 'data');
        if (data !== undefined) {
            const rows = this.safeList (data, 'rows', []);
            return this.parseOrder (rows[0], market);
        }
        const order = this.parseOrder (response, market);
        order['type'] = type;
        return order;
    }

    /**
     * @method
     * @name derive#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.derive.xyz/reference/post_private-get-account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const request = {
            'wallet': this.walletAddress,
        };
        const response = await this.privatePostGetAccount (this.extend (request, params));
        //
        //
        const data = this.safeDict (response, 'data');
        return this.parseBalance (data);
    }

    parseBalance (response): Balances {
        return this.safeBalance (response);
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
                const now = this.now ();
                const signature = this.signMessage (now.toString (), this.privateKey);
                headers['X-LyraWallet'] = this.walletAddress;
                headers['X-LyraTimestamp'] = now;
                headers['X-LyraSignature'] = signature;
            }
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
