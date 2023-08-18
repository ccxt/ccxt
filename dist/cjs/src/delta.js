'use strict';

var delta$1 = require('./abstract/delta.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class delta
 * @extends Exchange
 */
class delta extends delta$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'delta',
            'name': 'Delta Exchange',
            'countries': ['VC'],
            'rateLimit': 300,
            'version': 'v2',
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': true,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': true,
                'fetchDeposits': undefined,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransfer': undefined,
                'fetchTransfers': undefined,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'reduceMargin': true,
                'setLeverage': true,
                'setMargin': false,
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
                '6h': '6h',
                '1d': '1d',
                '7d': '7d',
                '1w': '1w',
                '2w': '2w',
                '1M': '30d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg',
                'test': {
                    'public': 'https://testnet-api.delta.exchange',
                    'private': 'https://testnet-api.delta.exchange',
                },
                'api': {
                    'public': 'https://api.delta.exchange',
                    'private': 'https://api.delta.exchange',
                },
                'www': 'https://www.delta.exchange',
                'doc': [
                    'https://docs.delta.exchange',
                ],
                'fees': 'https://www.delta.exchange/fees',
                'referral': 'https://www.delta.exchange/app/signup/?code=IULYNB',
            },
            'api': {
                'public': {
                    'get': [
                        'assets',
                        'indices',
                        'products',
                        'products/{symbol}',
                        'tickers',
                        'tickers/{symbol}',
                        'l2orderbook/{symbol}',
                        'trades/{symbol}',
                        'stats',
                        'history/candles',
                        'history/sparklines',
                        'settings',
                    ],
                },
                'private': {
                    'get': [
                        'orders',
                        'products/{product_id}/orders/leverage',
                        'positions/margined',
                        'positions',
                        'orders/history',
                        'fills',
                        'fills/history/download/csv',
                        'wallet/balances',
                        'wallet/transactions',
                        'wallet/transactions/download',
                        'wallets/sub_accounts_transfer_history',
                        'users/trading_preferences',
                        'sub_accounts',
                        'profile',
                        'deposits/address',
                        'orders/leverage',
                    ],
                    'post': [
                        'orders',
                        'orders/bracket',
                        'orders/batch',
                        'products/{product_id}/orders/leverage',
                        'positions/change_margin',
                        'positions/close_all',
                        'wallets/sub_account_balance_transfer',
                        'orders/cancel_after',
                        'orders/leverage',
                    ],
                    'put': [
                        'orders',
                        'orders/bracket',
                        'orders/batch',
                        'positions/auto_topup',
                        'users/update_mmp',
                        'users/reset_mmp',
                    ],
                    'delete': [
                        'orders',
                        'orders/all',
                        'orders/batch',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0015'),
                    'maker': this.parseNumber('0.0010'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0015')],
                            [this.parseNumber('100'), this.parseNumber('0.0013')],
                            [this.parseNumber('250'), this.parseNumber('0.0013')],
                            [this.parseNumber('1000'), this.parseNumber('0.001')],
                            [this.parseNumber('5000'), this.parseNumber('0.0009')],
                            [this.parseNumber('10000'), this.parseNumber('0.00075')],
                            [this.parseNumber('20000'), this.parseNumber('0.00065')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.001')],
                            [this.parseNumber('100'), this.parseNumber('0.001')],
                            [this.parseNumber('250'), this.parseNumber('0.0009')],
                            [this.parseNumber('1000'), this.parseNumber('0.00075')],
                            [this.parseNumber('5000'), this.parseNumber('0.0006')],
                            [this.parseNumber('10000'), this.parseNumber('0.0005')],
                            [this.parseNumber('20000'), this.parseNumber('0.0005')],
                        ],
                    },
                },
            },
            'options': {
                'networks': {
                    'TRC20': 'TRC20(TRON)',
                    'BEP20': 'BEP20(BSC)',
                },
            },
            'precisionMode': number.TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    // Margin required to place order with selected leverage and quantity is insufficient.
                    'insufficient_margin': errors.InsufficientFunds,
                    'order_size_exceed_available': errors.InvalidOrder,
                    'risk_limits_breached': errors.BadRequest,
                    'invalid_contract': errors.BadSymbol,
                    'immediate_liquidation': errors.InvalidOrder,
                    'out_of_bankruptcy': errors.InvalidOrder,
                    'self_matching_disrupted_post_only': errors.InvalidOrder,
                    'immediate_execution_post_only': errors.InvalidOrder,
                    'bad_schema': errors.BadRequest,
                    'invalid_api_key': errors.AuthenticationError,
                    'invalid_signature': errors.AuthenticationError,
                    'open_order_not_found': errors.OrderNotFound,
                    'unavailable': errors.ExchangeNotAvailable, // {"error":{"code":"unavailable"},"success":false}
                },
                'broad': {},
            },
        });
    }
    convertExpireDate(date) {
        // parse YYMMDD to timestamp
        const year = date.slice(0, 2);
        const month = date.slice(2, 4);
        const day = date.slice(4, 6);
        const reconstructedDate = '20' + year + '-' + month + '-' + day + 'T00:00:00Z';
        return reconstructedDate;
    }
    createExpiredOptionMarket(symbol) {
        // support expired option contracts
        const quote = 'USDT';
        const optionParts = symbol.split('-');
        const symbolBase = symbol.split('/');
        let base = undefined;
        let expiry = undefined;
        let optionType = undefined;
        if (symbol.indexOf('/') > -1) {
            base = this.safeString(symbolBase, 0);
            expiry = this.safeString(optionParts, 1);
            optionType = this.safeString(optionParts, 3);
        }
        else {
            base = this.safeString(optionParts, 1);
            expiry = this.safeString(optionParts, 3);
            optionType = this.safeString(optionParts, 0);
        }
        const settle = quote;
        const strike = this.safeString(optionParts, 2);
        const datetime = this.convertExpireDate(expiry);
        const timestamp = this.parse8601(datetime);
        return {
            'id': optionType + '-' + base + '-' + strike + '-' + expiry,
            'symbol': base + '/' + quote + ':' + settle + '-' + expiry + '-' + strike + '-' + optionType,
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
            'contractSize': this.parseNumber('1'),
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
    market(symbol) {
        if (this.markets === undefined) {
            throw new errors.ExchangeError(this.id + ' markets not loaded');
        }
        if (typeof symbol === 'string') {
            if (symbol in this.markets) {
                return this.markets[symbol];
            }
            else if (symbol in this.markets_by_id) {
                const markets = this.markets_by_id[symbol];
                return markets[0];
            }
            else if ((symbol.indexOf('-C') > -1) || (symbol.indexOf('-P') > -1) || (symbol.indexOf('C')) || (symbol.indexOf('P'))) {
                return this.createExpiredOptionMarket(symbol);
            }
        }
        throw new errors.BadSymbol(this.id + ' does not have market symbol ' + symbol);
    }
    safeMarket(marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        const isOption = (marketId !== undefined) && ((marketId.indexOf('-C') > -1) || (marketId.indexOf('-P') > -1) || (marketId.indexOf('C')) || (marketId.indexOf('P')));
        if (isOption && !(marketId in this.markets_by_id)) {
            // handle expired option contracts
            return this.createExpiredOptionMarket(marketId);
        }
        return super.safeMarket(marketId, market, delimiter, marketType);
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name delta#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetSettings(params);
        // full response sample under `fetchStatus`
        const result = this.safeValue(response, 'result', {});
        return this.safeIntegerProduct(result, 'server_time', 0.001);
    }
    async fetchStatus(params = {}) {
        /**
         * @method
         * @name delta#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.publicGetSettings(params);
        //
        //     {
        //         "result": {
        //           "deto_liquidity_mining_daily_reward": "40775",
        //           "deto_msp": "1.0",
        //           "deto_staking_daily_reward": "23764.08",
        //           "enabled_wallets": [
        //             "BTC",
        //             ...
        //           ],
        //           "portfolio_margin_params": {
        //             "enabled_portfolios": {
        //               ".DEAVAXUSDT": {
        //                 "asset_id": 5,
        //                 "futures_contingency_margin_percent": "1",
        //                 "interest_rate": "0",
        //                 "maintenance_margin_multiplier": "0.8",
        //                 "max_price_shock": "20",
        //                 "max_short_notional_limit": "2000",
        //                 "options_contingency_margin_percent": "1",
        //                 "options_discount_range": "10",
        //                 "options_liq_band_range_percentage": "25",
        //                 "settling_asset": "USDT",
        //                 "sort_priority": 5,
        //                 "underlying_asset": "AVAX",
        //                 "volatility_down_shock": "30",
        //                 "volatility_up_shock": "45"
        //               },
        //               ...
        //             },
        //             "portfolio_enabled_contracts": [
        //               "futures",
        //               "perpetual_futures",
        //               "call_options",
        //               "put_options"
        //             ]
        //           },
        //           "server_time": 1650640673500273,
        //           "trade_farming_daily_reward": "100000",
        //           "circulating_supply": "140000000",
        //           "circulating_supply_update_time": "1636752800",
        //           "deto_referral_mining_daily_reward": "0",
        //           "deto_total_reward_pool": "100000000",
        //           "deto_trade_mining_daily_reward": "0",
        //           "kyc_deposit_limit": "20",
        //           "kyc_withdrawal_limit": "10000",
        //           "maintenance_start_time": "1650387600000000",
        //           "msp_deto_commission_percent": "25",
        //           "under_maintenance": "false"
        //         },
        //         "success": true
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const underMaintenance = this.safeString(result, 'under_maintenance');
        const status = (underMaintenance === 'true') ? 'maintenance' : 'ok';
        const updated = this.safeIntegerProduct(result, 'server_time', 0.001, this.milliseconds());
        return {
            'status': status,
            'updated': updated,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name delta#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.delta.exchange/#get-list-of-all-assets
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetAssets(params);
        //
        //     {
        //         "result":[
        //             {
        //                 "base_withdrawal_fee":"0.0005",
        //                 "deposit_status":"enabled",
        //                 "id":2,
        //                 "interest_credit":true,
        //                 "interest_slabs":[
        //                     {"limit":"0.1","rate":"0"},
        //                     {"limit":"1","rate":"0.05"},
        //                     {"limit":"5","rate":"0.075"},
        //                     {"limit":"10","rate":"0.1"},
        //                     {"limit":"9999999999999999","rate":"0"}
        //                 ],
        //                 "kyc_deposit_limit":"10",
        //                 "kyc_withdrawal_limit":"2",
        //                 "min_withdrawal_amount":"0.001",
        //                 "minimum_precision":4,
        //                 "name":"Bitcoin",
        //                 "precision":8,
        //                 "sort_priority":1,
        //                 "symbol":"BTC",
        //                 "variable_withdrawal_fee":"0",
        //                 "withdrawal_status":"enabled"
        //             },
        //         ],
        //         "success":true
        //     }
        //
        const currencies = this.safeValue(response, 'result', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString(currency, 'symbol');
            const numericId = this.safeInteger(currency, 'id');
            const code = this.safeCurrencyCode(id);
            const depositStatus = this.safeString(currency, 'deposit_status');
            const withdrawalStatus = this.safeString(currency, 'withdrawal_status');
            const depositsEnabled = (depositStatus === 'enabled');
            const withdrawalsEnabled = (withdrawalStatus === 'enabled');
            const active = depositsEnabled && withdrawalsEnabled;
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'name': this.safeString(currency, 'name'),
                'info': currency,
                'active': active,
                'deposit': depositsEnabled,
                'withdraw': withdrawalsEnabled,
                'fee': this.safeNumber(currency, 'base_withdrawal_fee'),
                'precision': this.parseNumber(this.parsePrecision(this.safeString(currency, 'precision'))),
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': {
                        'min': this.safeNumber(currency, 'min_withdrawal_amount'),
                        'max': undefined,
                    },
                },
                'networks': {},
            };
        }
        return result;
    }
    async loadMarkets(reload = false, params = {}) {
        const markets = await super.loadMarkets(reload, params);
        const currenciesByNumericId = this.safeValue(this.options, 'currenciesByNumericId');
        if ((currenciesByNumericId === undefined) || reload) {
            this.options['currenciesByNumericId'] = this.indexBy(this.currencies, 'numericId');
        }
        const marketsByNumericId = this.safeValue(this.options, 'marketsByNumericId');
        if ((marketsByNumericId === undefined) || reload) {
            this.options['marketsByNumericId'] = this.indexBy(this.markets, 'numericId');
        }
        return markets;
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name delta#fetchMarkets
         * @description retrieves data on all markets for delta
         * @see https://docs.delta.exchange/#get-list-of-products
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetProducts(params);
        //
        //     {
        //         "meta":{ "after":null, "before":null, "limit":100, "total_count":81 },
        //         "result":[
        //             // the below response represents item from perpetual market
        //             {
        //                 "annualized_funding":"5.475000000000000000",
        //                 "is_quanto":false,
        //                 "ui_config":{
        //                     "default_trading_view_candle":"15",
        //                     "leverage_slider_values":[1,3,5,10,25,50],
        //                     "price_clubbing_values":[0.001,0.005,0.05,0.1,0.5,1,5],
        //                     "show_bracket_orders":false,
        //                     "sort_priority":29,
        //                     "tags":[]
        //                 },
        //                 "basis_factor_max_limit":"0.15",
        //                 "symbol":"P-LINK-D-151120",
        //                 "id":1584,
        //                 "default_leverage":"5.000000000000000000",
        //                 "maker_commission_rate":"0.0005",
        //                 "contract_unit_currency":"LINK",
        //                 "strike_price":"12.507948",
        //                 "settling_asset":{
        //                     // asset structure
        //                 },
        //                 "auction_start_time":null,
        //                 "auction_finish_time":null,
        //                 "settlement_time":"2020-11-15T12:00:00Z",
        //                 "launch_time":"2020-11-14T11:55:05Z",
        //                 "spot_index":{
        //                     // index structure
        //                 },
        //                 "trading_status":"operational",
        //                 "tick_size":"0.001",
        //                 "position_size_limit":100000,
        //                 "notional_type":"vanilla", // vanilla, inverse
        //                 "price_band":"0.4",
        //                 "barrier_price":null,
        //                 "description":"Daily LINK PUT options quoted in USDT and settled in USDT",
        //                 "insurance_fund_margin_contribution":"1",
        //                 "quoting_asset":{
        //                     // asset structure
        //                 },
        //                 "liquidation_penalty_factor":"0.2",
        //                 "product_specs":{"max_volatility":3,"min_volatility":0.3,"spot_price_band":"0.40"},
        //                 "initial_margin_scaling_factor":"0.0001",
        //                 "underlying_asset":{
        //                     // asset structure
        //                 },
        //                 "state":"live",
        //                 "contract_value":"1",
        //                 "initial_margin":"2",
        //                 "impact_size":5000,
        //                 "settlement_price":null,
        //                 "contract_type":"put_options", // put_options, call_options, move_options, perpetual_futures, interest_rate_swaps, futures, spreads
        //                 "taker_commission_rate":"0.0005",
        //                 "maintenance_margin":"1",
        //                 "short_description":"LINK Daily PUT Options",
        //                 "maintenance_margin_scaling_factor":"0.00005",
        //                 "funding_method":"mark_price",
        //                 "max_leverage_notional":"20000"
        //             },
        //             // the below response represents item from spot market
        //             {
        //                 "position_size_limit": 10000000,
        //                 "settlement_price": null,
        //                 "funding_method": "mark_price",
        //                 "settling_asset": null,
        //                 "impact_size": 10,
        //                 "id": 32258,
        //                 "auction_finish_time": null,
        //                 "description": "Solana tether spot market",
        //                 "trading_status": "operational",
        //                 "tick_size": "0.01",
        //                 "liquidation_penalty_factor": "1",
        //                 "spot_index": {
        //                     "config": { "quoting_asset": "USDT", "service_id": 8, "underlying_asset": "SOL" },
        //                     "constituent_exchanges": [
        //                         { "exchange": "binance", "health_interval": 60, "health_priority": 1, "weight": 1 },
        //                         { "exchange": "huobi", "health_interval": 60, "health_priority": 2, "weight": 1 }
        //                     ],
        //                     "constituent_indices": null,
        //                     "description": "Solana index from binance and huobi",
        //                     "health_interval": 300,
        //                     "id": 105,
        //                     "impact_size": "40.000000000000000000",
        //                     "index_type": "spot_pair",
        //                     "is_composite": false,
        //                     "price_method": "ltp",
        //                     "quoting_asset_id": 5,
        //                     "symbol": ".DESOLUSDT",
        //                     "tick_size": "0.000100000000000000",
        //                     "underlying_asset_id": 66
        //                 },
        //                 "contract_type": "spot",
        //                 "launch_time": "2022-02-03T10:18:11Z",
        //                 "symbol": "SOL_USDT",
        //                 "disruption_reason": null,
        //                 "settlement_time": null,
        //                 "insurance_fund_margin_contribution": "1",
        //                 "is_quanto": false,
        //                 "maintenance_margin": "5",
        //                 "taker_commission_rate": "0.0005",
        //                 "auction_start_time": null,
        //                 "max_leverage_notional": "10000000",
        //                 "state": "live",
        //                 "annualized_funding": "0",
        //                 "notional_type": "vanilla",
        //                 "price_band": "100",
        //                 "product_specs": { "kyc_required": false, "max_order_size": 2000, "min_order_size": 0.01, "quoting_precision": 4, "underlying_precision": 2 },
        //                 "default_leverage": "1.000000000000000000",
        //                 "initial_margin": "10",
        //                 "maintenance_margin_scaling_factor": "1",
        //                 "ui_config": {
        //                     "default_trading_view_candle": "1d",
        //                     "leverage_slider_values": [],
        //                     "price_clubbing_values": [ 0.01, 0.05, 0.1, 0.5, 1, 2.5, 5 ],
        //                     "show_bracket_orders": false,
        //                     "sort_priority": 2,
        //                     "tags": []
        //                 },
        //                 "basis_factor_max_limit": "10000",
        //                 "contract_unit_currency": "SOL",
        //                 "strike_price": null,
        //                 "quoting_asset": {
        //                     "base_withdrawal_fee": "10.000000000000000000",
        //                     "deposit_status": "enabled",
        //                     "id": 5,
        //                     "interest_credit": false,
        //                     "interest_slabs": null,
        //                     "kyc_deposit_limit": "100000.000000000000000000",
        //                     "kyc_withdrawal_limit": "10000.000000000000000000",
        //                     "min_withdrawal_amount": "30.000000000000000000",
        //                     "minimum_precision": 2,
        //                     "name": "Tether",
        //                     "networks": [
        //                         { "base_withdrawal_fee": "25", "deposit_status": "enabled", "memo_required": false, "network": "ERC20", "variable_withdrawal_fee": "0", "withdrawal_status": "enabled" },
        //                         { "base_withdrawal_fee": "1", "deposit_status": "enabled", "memo_required": false, "network": "BEP20(BSC)", "variable_withdrawal_fee": "0", "withdrawal_status": "enabled" },
        //                         { "base_withdrawal_fee": "1", "deposit_status": "disabled", "memo_required": false, "network": "TRC20(TRON)", "variable_withdrawal_fee": "0", "withdrawal_status": "disabled" }
        //                     ],
        //                     "precision": 8,
        //                     "sort_priority": 1,
        //                     "symbol": "USDT",
        //                     "variable_withdrawal_fee": "0.000000000000000000",
        //                     "withdrawal_status": "enabled"
        //                 },
        //                 "maker_commission_rate": "0.0005",
        //                 "initial_margin_scaling_factor": "2",
        //                 "underlying_asset": {
        //                     "base_withdrawal_fee": "0.000000000000000000",
        //                     "deposit_status": "enabled",
        //                     "id": 66,
        //                     "interest_credit": false,
        //                     "interest_slabs": null,
        //                     "kyc_deposit_limit": "0.000000000000000000",
        //                     "kyc_withdrawal_limit": "0.000000000000000000",
        //                     "min_withdrawal_amount": "0.020000000000000000",
        //                     "minimum_precision": 4,
        //                     "name": "Solana",
        //                     "networks": [
        //                         { "base_withdrawal_fee": "0.01", "deposit_status": "enabled", "memo_required": false, "network": "SOLANA", "variable_withdrawal_fee": "0", "withdrawal_status": "enabled" },
        //                         { "base_withdrawal_fee": "0.01", "deposit_status": "enabled", "memo_required": false, "network": "BEP20(BSC)", "variable_withdrawal_fee": "0", "withdrawal_status": "enabled" }
        //                     ],
        //                     "precision": 8,
        //                     "sort_priority": 7,
        //                     "symbol": "SOL",
        //                     "variable_withdrawal_fee": "0.000000000000000000",
        //                     "withdrawal_status": "enabled"
        //                 },
        //                 "barrier_price": null,
        //                 "contract_value": "1",
        //                 "short_description": "SOL-USDT spot market"
        //             },
        //         ],
        //         "success":true
        //     }
        //
        const markets = this.safeValue(response, 'result', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            let type = this.safeString(market, 'contract_type');
            // const settlingAsset = this.safeValue (market, 'settling_asset', {});
            const quotingAsset = this.safeValue(market, 'quoting_asset', {});
            const underlyingAsset = this.safeValue(market, 'underlying_asset', {});
            const settlingAsset = this.safeValue(market, 'settling_asset');
            const productSpecs = this.safeValue(market, 'product_specs', {});
            const baseId = this.safeString(underlyingAsset, 'symbol');
            const quoteId = this.safeString(quotingAsset, 'symbol');
            const settleId = this.safeString(settlingAsset, 'symbol');
            const id = this.safeString(market, 'symbol');
            const numericId = this.safeInteger(market, 'id');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            const callOptions = (type === 'call_options');
            const putOptions = (type === 'put_options');
            const moveOptions = (type === 'move_options');
            const spot = (type === 'spot');
            const swap = (type === 'perpetual_futures');
            const future = (type === 'futures');
            const option = (callOptions || putOptions || moveOptions);
            const strike = this.safeString(market, 'strike_price');
            const expiryDatetime = this.safeString(market, 'settlement_time');
            const expiry = this.parse8601(expiryDatetime);
            const contractSize = this.safeNumber(market, 'contract_value');
            let amountPrecision = undefined;
            if (spot) {
                amountPrecision = this.parseNumber(this.parsePrecision(this.safeString(productSpecs, 'underlying_precision'))); // seems inverse of 'impact_size'
            }
            else {
                // other markets (swap, futures, move, spread, irs) seem to use the step of '1' contract
                amountPrecision = this.parseNumber('1');
            }
            const linear = (settle === base);
            let optionType = undefined;
            let symbol = base + '/' + quote;
            if (swap || future || option) {
                symbol = symbol + ':' + settle;
                if (future || option) {
                    symbol = symbol + '-' + this.yymmdd(expiry);
                    if (option) {
                        type = 'option';
                        let letter = 'C';
                        optionType = 'call';
                        if (putOptions) {
                            letter = 'P';
                            optionType = 'put';
                        }
                        else if (moveOptions) {
                            letter = 'M';
                            optionType = 'move';
                        }
                        symbol = symbol + '-' + strike + '-' + letter;
                    }
                    else {
                        type = 'future';
                    }
                }
                else {
                    type = 'swap';
                }
            }
            const state = this.safeString(market, 'state');
            result.push({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': spot ? undefined : false,
                'swap': swap,
                'future': future,
                'option': option,
                'active': (state === 'live'),
                'contract': !spot,
                'linear': spot ? undefined : linear,
                'inverse': spot ? undefined : !linear,
                'taker': this.safeNumber(market, 'taker_commission_rate'),
                'maker': this.safeNumber(market, 'maker_commission_rate'),
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': expiryDatetime,
                'strike': this.parseNumber(strike),
                'optionType': optionType,
                'precision': {
                    'amount': amountPrecision,
                    'price': this.safeNumber(market, 'tick_size'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.parseNumber('1'),
                        'max': this.safeNumber(market, 'position_size_limit'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'min_size'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }
    parseTicker(ticker, market = undefined) {
        //
        // spot: fetchTicker, fetchTickers
        //
        //     {
        //         "close": 30634.0,
        //         "contract_type": "spot",
        //         "greeks": null,
        //         "high": 30780.0,
        //         "low": 30340.5,
        //         "mark_price": "48000",
        //         "oi": "0.0000",
        //         "oi_change_usd_6h": "0.0000",
        //         "oi_contracts": "0",
        //         "oi_value": "0.0000",
        //         "oi_value_symbol": "BTC",
        //         "oi_value_usd": "0.0000",
        //         "open": 30464.0,
        //         "price_band": null,
        //         "product_id": 8320,
        //         "quotes": {},
        //         "size": 2.6816639999999996,
        //         "spot_price": "30637.91465121",
        //         "symbol": "BTC_USDT",
        //         "timestamp": 1689139767621299,
        //         "turnover": 2.6816639999999996,
        //         "turnover_symbol": "BTC",
        //         "turnover_usd": 81896.45613400004,
        //         "volume": 2.6816639999999996
        //     }
        //
        // swap: fetchTicker, fetchTickers
        //
        //     {
        //         "close": 30600.5,
        //         "contract_type": "perpetual_futures",
        //         "funding_rate": "0.00602961",
        //         "greeks": null,
        //         "high": 30803.0,
        //         "low": 30265.5,
        //         "mark_basis": "-0.45601594",
        //         "mark_price": "30600.10481568",
        //         "oi": "469.9190",
        //         "oi_change_usd_6h": "2226314.9900",
        //         "oi_contracts": "469919",
        //         "oi_value": "469.9190",
        //         "oi_value_symbol": "BTC",
        //         "oi_value_usd": "14385640.6802",
        //         "open": 30458.5,
        //         "price_band": {
        //             "lower_limit": "29067.08312627",
        //             "upper_limit": "32126.77608693"
        //         },
        //         "product_id": 139,
        //         "quotes": {
        //             "ask_iv": null,
        //             "ask_size": "965",
        //             "best_ask": "30600.5",
        //             "best_bid": "30599.5",
        //             "bid_iv": null,
        //             "bid_size": "196",
        //             "impact_mid_price": null,
        //             "mark_iv": "-0.44931641"
        //         },
        //         "size": 1226303,
        //         "spot_price": "30612.85362773",
        //         "symbol": "BTCUSDT",
        //         "timestamp": 1689136597460456,
        //         "turnover": 37392218.45999999,
        //         "turnover_symbol": "USDT",
        //         "turnover_usd": 37392218.45999999,
        //         "volume": 1226.3029999999485
        //     }
        //
        // option: fetchTicker, fetchTickers
        //
        //     {
        //         "contract_type": "call_options",
        //         "greeks": {
        //             "delta": "0.60873994",
        //             "gamma": "0.00014854",
        //             "rho": "7.71808010",
        //             "spot": "30598.49040622",
        //             "theta": "-30.44743017",
        //             "vega": "24.83508248"
        //         },
        //         "mark_price": "1347.74819696",
        //         "mark_vol": "0.39966303",
        //         "oi": "2.7810",
        //         "oi_change_usd_6h": "0.0000",
        //         "oi_contracts": "2781",
        //         "oi_value": "2.7810",
        //         "oi_value_symbol": "BTC",
        //         "oi_value_usd": "85127.4337",
        //         "price_band": {
        //             "lower_limit": "91.27423497",
        //             "upper_limit": "7846.19454697"
        //         },
        //         "product_id": 107150,
        //         "quotes": {
        //             "ask_iv": "0.41023239",
        //             "ask_size": "2397",
        //             "best_ask": "1374",
        //             "best_bid": "1322",
        //             "bid_iv": "0.38929375",
        //             "bid_size": "3995",
        //             "impact_mid_price": null,
        //             "mark_iv": "0.39965618"
        //         },
        //         "spot_price": "30598.43379314",
        //         "strike_price": "30000",
        //         "symbol": "C-BTC-30000-280723",
        //         "timestamp": 1689136932893181,
        //         "turnover_symbol": "USDT"
        //     }
        //
        const timestamp = this.safeIntegerProduct(ticker, 'timestamp', 0.001);
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const last = this.safeString(ticker, 'close');
        const quotes = this.safeValue(ticker, 'quotes', {});
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeNumber(ticker, 'high'),
            'low': this.safeNumber(ticker, 'low'),
            'bid': this.safeNumber(quotes, 'best_bid'),
            'bidVolume': this.safeNumber(quotes, 'bid_size'),
            'ask': this.safeNumber(quotes, 'best_ask'),
            'askVolume': this.safeNumber(quotes, 'ask_size'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber(ticker, 'volume'),
            'quoteVolume': this.safeNumber(ticker, 'turnover'),
            'info': ticker,
        }, market);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name delta#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.delta.exchange/#get-ticker-for-a-product-by-symbol
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTickersSymbol(this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "result": {
        //             "close": 30634.0,
        //             "contract_type": "spot",
        //             "greeks": null,
        //             "high": 30780.0,
        //             "low": 30340.5,
        //             "mark_price": "48000",
        //             "oi": "0.0000",
        //             "oi_change_usd_6h": "0.0000",
        //             "oi_contracts": "0",
        //             "oi_value": "0.0000",
        //             "oi_value_symbol": "BTC",
        //             "oi_value_usd": "0.0000",
        //             "open": 30464.0,
        //             "price_band": null,
        //             "product_id": 8320,
        //             "quotes": {},
        //             "size": 2.6816639999999996,
        //             "spot_price": "30637.91465121",
        //             "symbol": "BTC_USDT",
        //             "timestamp": 1689139767621299,
        //             "turnover": 2.6816639999999996,
        //             "turnover_symbol": "BTC",
        //             "turnover_usd": 81896.45613400004,
        //             "volume": 2.6816639999999996
        //         },
        //         "success": true
        //     }
        //
        // swap
        //
        //     {
        //         "result": {
        //             "close": 30600.5,
        //             "contract_type": "perpetual_futures",
        //             "funding_rate": "0.00602961",
        //             "greeks": null,
        //             "high": 30803.0,
        //             "low": 30265.5,
        //             "mark_basis": "-0.45601594",
        //             "mark_price": "30600.10481568",
        //             "oi": "469.9190",
        //             "oi_change_usd_6h": "2226314.9900",
        //             "oi_contracts": "469919",
        //             "oi_value": "469.9190",
        //             "oi_value_symbol": "BTC",
        //             "oi_value_usd": "14385640.6802",
        //             "open": 30458.5,
        //             "price_band": {
        //                 "lower_limit": "29067.08312627",
        //                 "upper_limit": "32126.77608693"
        //             },
        //             "product_id": 139,
        //             "quotes": {
        //                 "ask_iv": null,
        //                 "ask_size": "965",
        //                 "best_ask": "30600.5",
        //                 "best_bid": "30599.5",
        //                 "bid_iv": null,
        //                 "bid_size": "196",
        //                 "impact_mid_price": null,
        //                 "mark_iv": "-0.44931641"
        //             },
        //             "size": 1226303,
        //             "spot_price": "30612.85362773",
        //             "symbol": "BTCUSDT",
        //             "timestamp": 1689136597460456,
        //             "turnover": 37392218.45999999,
        //             "turnover_symbol": "USDT",
        //             "turnover_usd": 37392218.45999999,
        //             "volume": 1226.3029999999485
        //         },
        //         "success": true
        //     }
        //
        // option
        //
        //     {
        //         "result": {
        //             "contract_type": "call_options",
        //             "greeks": {
        //                 "delta": "0.60873994",
        //                 "gamma": "0.00014854",
        //                 "rho": "7.71808010",
        //                 "spot": "30598.49040622",
        //                 "theta": "-30.44743017",
        //                 "vega": "24.83508248"
        //             },
        //             "mark_price": "1347.74819696",
        //             "mark_vol": "0.39966303",
        //             "oi": "2.7810",
        //             "oi_change_usd_6h": "0.0000",
        //             "oi_contracts": "2781",
        //             "oi_value": "2.7810",
        //             "oi_value_symbol": "BTC",
        //             "oi_value_usd": "85127.4337",
        //             "price_band": {
        //                 "lower_limit": "91.27423497",
        //                 "upper_limit": "7846.19454697"
        //             },
        //             "product_id": 107150,
        //             "quotes": {
        //                 "ask_iv": "0.41023239",
        //                 "ask_size": "2397",
        //                 "best_ask": "1374",
        //                 "best_bid": "1322",
        //                 "bid_iv": "0.38929375",
        //                 "bid_size": "3995",
        //                 "impact_mid_price": null,
        //                 "mark_iv": "0.39965618"
        //             },
        //             "spot_price": "30598.43379314",
        //             "strike_price": "30000",
        //             "symbol": "C-BTC-30000-280723",
        //             "timestamp": 1689136932893181,
        //             "turnover_symbol": "USDT"
        //         },
        //         "success": true
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseTicker(result, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://docs.delta.exchange/#get-tickers-for-products
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetTickers(params);
        //
        // spot
        //
        //     {
        //         "result": [
        //             {
        //                 "close": 30634.0,
        //                 "contract_type": "spot",
        //                 "greeks": null,
        //                 "high": 30780.0,
        //                 "low": 30340.5,
        //                 "mark_price": "48000",
        //                 "oi": "0.0000",
        //                 "oi_change_usd_6h": "0.0000",
        //                 "oi_contracts": "0",
        //                 "oi_value": "0.0000",
        //                 "oi_value_symbol": "BTC",
        //                 "oi_value_usd": "0.0000",
        //                 "open": 30464.0,
        //                 "price_band": null,
        //                 "product_id": 8320,
        //                 "quotes": {},
        //                 "size": 2.6816639999999996,
        //                 "spot_price": "30637.91465121",
        //                 "symbol": "BTC_USDT",
        //                 "timestamp": 1689139767621299,
        //                 "turnover": 2.6816639999999996,
        //                 "turnover_symbol": "BTC",
        //                 "turnover_usd": 81896.45613400004,
        //                 "volume": 2.6816639999999996
        //             },
        //         ],
        //         "success":true
        //     }
        //
        // swap
        //
        //     {
        //         "result": [
        //             {
        //                 "close": 30600.5,
        //                 "contract_type": "perpetual_futures",
        //                 "funding_rate": "0.00602961",
        //                 "greeks": null,
        //                 "high": 30803.0,
        //                 "low": 30265.5,
        //                 "mark_basis": "-0.45601594",
        //                 "mark_price": "30600.10481568",
        //                 "oi": "469.9190",
        //                 "oi_change_usd_6h": "2226314.9900",
        //                 "oi_contracts": "469919",
        //                 "oi_value": "469.9190",
        //                 "oi_value_symbol": "BTC",
        //                 "oi_value_usd": "14385640.6802",
        //                 "open": 30458.5,
        //                 "price_band": {
        //                     "lower_limit": "29067.08312627",
        //                     "upper_limit": "32126.77608693"
        //                 },
        //                 "product_id": 139,
        //                 "quotes": {
        //                     "ask_iv": null,
        //                     "ask_size": "965",
        //                     "best_ask": "30600.5",
        //                     "best_bid": "30599.5",
        //                     "bid_iv": null,
        //                     "bid_size": "196",
        //                     "impact_mid_price": null,
        //                     "mark_iv": "-0.44931641"
        //                 },
        //                 "size": 1226303,
        //                 "spot_price": "30612.85362773",
        //                 "symbol": "BTCUSDT",
        //                 "timestamp": 1689136597460456,
        //                 "turnover": 37392218.45999999,
        //                 "turnover_symbol": "USDT",
        //                 "turnover_usd": 37392218.45999999,
        //                 "volume": 1226.3029999999485
        //             },
        //         ],
        //         "success":true
        //     }
        //
        // option
        //
        //     {
        //         "result": [
        //             {
        //                 "contract_type": "call_options",
        //                 "greeks": {
        //                     "delta": "0.60873994",
        //                     "gamma": "0.00014854",
        //                     "rho": "7.71808010",
        //                     "spot": "30598.49040622",
        //                     "theta": "-30.44743017",
        //                     "vega": "24.83508248"
        //                 },
        //                 "mark_price": "1347.74819696",
        //                 "mark_vol": "0.39966303",
        //                 "oi": "2.7810",
        //                 "oi_change_usd_6h": "0.0000",
        //                 "oi_contracts": "2781",
        //                 "oi_value": "2.7810",
        //                 "oi_value_symbol": "BTC",
        //                 "oi_value_usd": "85127.4337",
        //                 "price_band": {
        //                     "lower_limit": "91.27423497",
        //                     "upper_limit": "7846.19454697"
        //                 },
        //                 "product_id": 107150,
        //                 "quotes": {
        //                     "ask_iv": "0.41023239",
        //                     "ask_size": "2397",
        //                     "best_ask": "1374",
        //                     "best_bid": "1322",
        //                     "bid_iv": "0.38929375",
        //                     "bid_size": "3995",
        //                     "impact_mid_price": null,
        //                     "mark_iv": "0.39965618"
        //                 },
        //                 "spot_price": "30598.43379314",
        //                 "strike_price": "30000",
        //                 "symbol": "C-BTC-30000-280723",
        //                 "timestamp": 1689136932893181,
        //                 "turnover_symbol": "USDT"
        //             },
        //         ],
        //         "success":true
        //     }
        //
        const tickers = this.safeValue(response, 'result', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker(tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray(result, 'symbol', symbols);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.delta.exchange/#get-l2-orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetL2orderbookSymbol(this.extend(request, params));
        //
        //     {
        //         "result":{
        //             "buy":[
        //                 {"price":"15814.0","size":912},
        //                 {"price":"15813.5","size":1279},
        //                 {"price":"15813.0","size":1634},
        //             ],
        //             "sell":[
        //                 {"price":"15814.5","size":625},
        //                 {"price":"15815.0","size":982},
        //                 {"price":"15815.5","size":1328},
        //             ],
        //             "symbol":"BTCUSDT"
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseOrderBook(result, market['symbol'], undefined, 'buy', 'sell', 'price', 'size');
    }
    parseTrade(trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "buyer_role":"maker",
        //         "price":"15896.5",
        //         "seller_role":"taker",
        //         "size":241,
        //         "symbol":"BTCUSDT",
        //         "timestamp":1605376684714595
        //     }
        //
        // private fetchMyTrades
        //
        //     {
        //         "commission":"0.008335000000000000",
        //         "created_at":"2020-11-16T19:07:19Z",
        //         "fill_type":"normal",
        //         "id":"e7ff05c233a74245b72381f8dd91d1ce",
        //         "meta_data":{
        //             "effective_commission_rate":"0.0005",
        //             "order_price":"16249",
        //             "order_size":1,
        //             "order_type":"market_order",
        //             "order_unfilled_size":0,
        //             "trading_fee_credits_used":"0"
        //         },
        //         "order_id":"152999629",
        //         "price":"16669",
        //         "product":{
        //             "contract_type":"perpetual_futures",
        //             "contract_unit_currency":"BTC",
        //             "contract_value":"0.001",
        //             "id":139,
        //             "notional_type":"vanilla",
        //             "quoting_asset":{"minimum_precision":2,"precision":6,"symbol":"USDT"},
        //             "settling_asset":{"minimum_precision":2,"precision":6,"symbol":"USDT"},
        //             "symbol":"BTCUSDT",
        //             "tick_size":"0.5",
        //             "underlying_asset":{"minimum_precision":4,"precision":8,"symbol":"BTC"}
        //         },
        //         "product_id":139,
        //         "role":"taker",
        //         "side":"sell",
        //         "size":1
        //     }
        //
        const id = this.safeString(trade, 'id');
        const orderId = this.safeString(trade, 'order_id');
        let timestamp = this.parse8601(this.safeString(trade, 'created_at'));
        timestamp = this.safeIntegerProduct(trade, 'timestamp', 0.001, timestamp);
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'size');
        const product = this.safeValue(trade, 'product', {});
        const marketId = this.safeString(product, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const sellerRole = this.safeString(trade, 'seller_role');
        let side = this.safeString(trade, 'side');
        if (side === undefined) {
            if (sellerRole === 'taker') {
                side = 'sell';
            }
            else if (sellerRole === 'maker') {
                side = 'buy';
            }
        }
        const takerOrMaker = this.safeString(trade, 'role');
        const metaData = this.safeValue(trade, 'meta_data', {});
        let type = this.safeString(metaData, 'order_type');
        if (type !== undefined) {
            type = type.replace('_order', '');
        }
        const feeCostString = this.safeString(trade, 'commission');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const settlingAsset = this.safeValue(product, 'settling_asset', {});
            const feeCurrencyId = this.safeString(settlingAsset, 'symbol');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        }, market);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.delta.exchange/#get-public-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTradesSymbol(this.extend(request, params));
        //
        //     {
        //         "result":[
        //             {
        //                 "buyer_role":"maker",
        //                 "price":"15896.5",
        //                 "seller_role":"taker",
        //                 "size":241,
        //                 "symbol":"BTCUSDT",
        //                 "timestamp":1605376684714595
        //             }
        //         ],
        //         "success":true
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        return this.parseTrades(result, market, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "time":1605393120,
        //         "open":15989,
        //         "high":15989,
        //         "low":15987.5,
        //         "close":15987.5,
        //         "volume":565
        //     }
        //
        return [
            this.safeTimestamp(ohlcv, 'time'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.delta.exchange/#get-ohlc-candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const duration = this.parseTimeframe(timeframe);
        limit = limit ? limit : 2000; // max 2000
        if (since === undefined) {
            const end = this.seconds();
            request['end'] = end;
            request['start'] = end - limit * duration;
        }
        else {
            const start = this.parseToInt(since / 1000);
            request['start'] = start;
            request['end'] = this.sum(start, limit * duration);
        }
        const price = this.safeString(params, 'price');
        if (price === 'mark') {
            request['symbol'] = 'MARK:' + market['id'];
        }
        else if (price === 'index') {
            request['symbol'] = market['info']['spot_index']['symbol'];
        }
        else {
            request['symbol'] = market['id'];
        }
        params = this.omit(params, 'price');
        const response = await this.publicGetHistoryCandles(this.extend(request, params));
        //
        //     {
        //         "success":true,
        //         "result":[
        //             {"time":1605393120,"open":15989,"high":15989,"low":15987.5,"close":15987.5,"volume":565},
        //             {"time":1605393180,"open":15966,"high":15966,"low":15959,"close":15959,"volume":24},
        //             {"time":1605393300,"open":15973,"high":15973,"low":15973,"close":15973,"volume":1288},
        //         ]
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        return this.parseOHLCVs(result, market, timeframe, since, limit);
    }
    parseBalance(response) {
        const balances = this.safeValue(response, 'result', []);
        const result = { 'info': response };
        const currenciesByNumericId = this.safeValue(this.options, 'currenciesByNumericId', {});
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString(balance, 'asset_id');
            const currency = this.safeValue(currenciesByNumericId, currencyId);
            const code = (currency === undefined) ? currencyId : currency['code'];
            const account = this.account();
            account['total'] = this.safeString(balance, 'balance');
            account['free'] = this.safeString(balance, 'available_balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name delta#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.delta.exchange/#get-wallet-balances
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        const response = await this.privateGetWalletBalances(params);
        //
        //     {
        //         "result":[
        //             {
        //                 "asset_id":1,
        //                 "available_balance":"0",
        //                 "balance":"0",
        //                 "commission":"0",
        //                 "id":154883,
        //                 "interest_credit":"0",
        //                 "order_margin":"0",
        //                 "pending_referral_bonus":"0",
        //                 "pending_trading_fee_credit":"0",
        //                 "position_margin":"0",
        //                 "trading_fee_credit":"0",
        //                 "user_id":22142
        //             },
        //         ],
        //         "success":true
        //     }
        //
        return this.parseBalance(response);
    }
    async fetchPosition(symbol, params = {}) {
        /**
         * @method
         * @name delta#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://docs.delta.exchange/#get-position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'product_id': market['numericId'],
        };
        const response = await this.privateGetPositions(this.extend(request, params));
        //
        //     {
        //         "result":{
        //             "entry_price":null,
        //             "size":0,
        //             "timestamp":1605454074268079
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parsePosition(result, market);
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchPositions
         * @description fetch all open positions
         * @see https://docs.delta.exchange/#get-margined-positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const response = await this.privateGetPositionsMargined(params);
        //
        //     {
        //         "success": true,
        //         "result": [
        //           {
        //             "user_id": 0,
        //             "size": 0,
        //             "entry_price": "string",
        //             "margin": "string",
        //             "liquidation_price": "string",
        //             "bankruptcy_price": "string",
        //             "adl_level": 0,
        //             "product_id": 0,
        //             "product_symbol": "string",
        //             "commission": "string",
        //             "realized_pnl": "string",
        //             "realized_funding": "string"
        //           }
        //         ]
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        return this.parsePositions(result, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        // fetchPosition
        //
        //     {
        //         "entry_price":null,
        //         "size":0,
        //         "timestamp":1605454074268079
        //     }
        //
        //
        // fetchPositions
        //
        //     {
        //         "user_id": 0,
        //         "size": 0,
        //         "entry_price": "string",
        //         "margin": "string",
        //         "liquidation_price": "string",
        //         "bankruptcy_price": "string",
        //         "adl_level": 0,
        //         "product_id": 0,
        //         "product_symbol": "string",
        //         "commission": "string",
        //         "realized_pnl": "string",
        //         "realized_funding": "string"
        //     }
        //
        const marketId = this.safeString(position, 'product_symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct(position, 'timestamp', 0.001);
        const sizeString = this.safeString(position, 'size');
        let side = undefined;
        if (sizeString !== undefined) {
            if (Precise["default"].stringGt(sizeString, '0')) {
                side = 'buy';
            }
            else if (Precise["default"].stringLt(sizeString, '0')) {
                side = 'sell';
            }
        }
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'notional': undefined,
            'marginMode': undefined,
            'liquidationPrice': this.safeNumber(position, 'liquidation_price'),
            'entryPrice': this.safeNumber(position, 'entry_price'),
            'unrealizedPnl': undefined,
            'percentage': undefined,
            'contracts': this.parseNumber(sizeString),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'markPrice': undefined,
            'side': side,
            'hedged': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        };
    }
    parseOrderStatus(status) {
        const statuses = {
            'open': 'open',
            'pending': 'open',
            'closed': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder, cancelOrder, editOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "average_fill_price":null,
        //         "bracket_order":null,
        //         "bracket_stop_loss_limit_price":null,
        //         "bracket_stop_loss_price":null,
        //         "bracket_take_profit_limit_price":null,
        //         "bracket_take_profit_price":null,
        //         "bracket_trail_amount":null,
        //         "cancellation_reason":null,
        //         "client_order_id":null,
        //         "close_on_trigger":"false",
        //         "commission":"0",
        //         "created_at":"2020-11-16T02:38:26Z",
        //         "id":152870626,
        //         "limit_price":"10000",
        //         "meta_data":{"source":"api"},
        //         "order_type":"limit_order",
        //         "paid_commission":"0",
        //         "product_id":139,
        //         "reduce_only":false,
        //         "side":"buy",
        //         "size":0,
        //         "state":"open",
        //         "stop_order_type":null,
        //         "stop_price":null,
        //         "stop_trigger_method":"mark_price",
        //         "time_in_force":"gtc",
        //         "trail_amount":null,
        //         "unfilled_size":0,
        //         "user_id":22142
        //     }
        //
        const id = this.safeString(order, 'id');
        const clientOrderId = this.safeString(order, 'client_order_id');
        const timestamp = this.parse8601(this.safeString(order, 'created_at'));
        const marketId = this.safeString(order, 'product_id');
        const marketsByNumericId = this.safeValue(this.options, 'marketsByNumericId', {});
        market = this.safeValue(marketsByNumericId, marketId, market);
        const symbol = (market === undefined) ? marketId : market['symbol'];
        const status = this.parseOrderStatus(this.safeString(order, 'state'));
        const side = this.safeString(order, 'side');
        let type = this.safeString(order, 'order_type');
        type = type.replace('_order', '');
        const price = this.safeString(order, 'limit_price');
        const amount = this.safeString(order, 'size');
        const remaining = this.safeString(order, 'unfilled_size');
        const average = this.safeString(order, 'average_fill_price');
        let fee = undefined;
        const feeCostString = this.safeString(order, 'paid_commission');
        if (feeCostString !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                const settlingAsset = this.safeValue(market['info'], 'settling_asset', {});
                const feeCurrencyId = this.safeString(settlingAsset, 'symbol');
                feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name delta#createOrder
         * @description create a trade order
         * @see https://docs.delta.exchange/#place-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @param {bool} [params.reduceOnly] *contract only* indicates if this order is to reduce the size of a position
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const orderType = type + '_order';
        const market = this.market(symbol);
        const request = {
            'product_id': market['numericId'],
            // 'limit_price': this.priceToPrecision (market['symbol'], price),
            'size': this.amountToPrecision(market['symbol'], amount),
            'side': side,
            'order_type': orderType,
            // 'client_order_id': 'string',
            // 'time_in_force': 'gtc', // gtc, ioc, fok
            // 'post_only': 'false', // 'true',
            // 'reduce_only': 'false', // 'true',
        };
        if (type === 'limit') {
            request['limit_price'] = this.priceToPrecision(market['symbol'], price);
        }
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_order_id');
        params = this.omit(params, ['clientOrderId', 'client_order_id']);
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        const reduceOnly = this.safeValue(params, 'reduceOnly');
        if (reduceOnly) {
            request['reduce_only'] = reduceOnly;
            params = this.omit(params, 'reduceOnly');
        }
        const response = await this.privatePostOrders(this.extend(request, params));
        //
        //     {
        //         "result":{
        //             "average_fill_price":null,
        //             "bracket_order":null,
        //             "bracket_stop_loss_limit_price":null,
        //             "bracket_stop_loss_price":null,
        //             "bracket_take_profit_limit_price":null,
        //             "bracket_take_profit_price":null,
        //             "bracket_trail_amount":null,
        //             "cancellation_reason":null,
        //             "client_order_id":null,
        //             "close_on_trigger":"false",
        //             "commission":"0",
        //             "created_at":"2020-11-16T02:38:26Z",
        //             "id":152870626,
        //             "limit_price":"10000",
        //             "meta_data":{"source":"api"},
        //             "order_type":"limit_order",
        //             "paid_commission":"0",
        //             "product_id":139,
        //             "reduce_only":false,
        //             "side":"buy",
        //             "size":0,
        //             "state":"open",
        //             "stop_order_type":null,
        //             "stop_price":null,
        //             "stop_trigger_method":"mark_price",
        //             "time_in_force":"gtc",
        //             "trail_amount":null,
        //             "unfilled_size":0,
        //             "user_id":22142
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseOrder(result, market);
    }
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name delta#editOrder
         * @description edit a trade order
         * @see https://docs.delta.exchange/#edit-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float} price the price at which the order is to be fullfilled, in units of the quote currency
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'id': parseInt(id),
            'product_id': market['numericId'],
            // 'limit_price': this.priceToPrecision (symbol, price),
            // 'size': this.amountToPrecision (symbol, amount),
        };
        if (amount !== undefined) {
            request['size'] = parseInt(this.amountToPrecision(symbol, amount));
        }
        if (price !== undefined) {
            request['limit_price'] = this.priceToPrecision(symbol, price);
        }
        const response = await this.privatePutOrders(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "id": "ashb1212",
        //             "product_id": 27,
        //             "limit_price": "9200",
        //             "side": "buy",
        //             "size": 100,
        //             "unfilled_size": 50,
        //             "user_id": 1,
        //             "order_type": "limit_order",
        //             "state": "open",
        //             "created_at": "..."
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result');
        return this.parseOrder(result, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name delta#cancelOrder
         * @description cancels an open order
         * @see https://docs.delta.exchange/#cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('cancelOrder', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'id': parseInt(id),
            'product_id': market['numericId'],
        };
        const response = await this.privateDeleteOrders(this.extend(request, params));
        //
        //     {
        //         "result":{
        //             "average_fill_price":null,
        //             "bracket_order":null,
        //             "bracket_stop_loss_limit_price":null,
        //             "bracket_stop_loss_price":null,
        //             "bracket_take_profit_limit_price":null,
        //             "bracket_take_profit_price":null,
        //             "bracket_trail_amount":null,
        //             "cancellation_reason":"cancelled_by_user",
        //             "client_order_id":null,
        //             "close_on_trigger":"false",
        //             "commission":"0",
        //             "created_at":"2020-11-16T02:38:26Z",
        //             "id":152870626,
        //             "limit_price":"10000",
        //             "meta_data":{"source":"api"},
        //             "order_type":"limit_order",
        //             "paid_commission":"0",
        //             "product_id":139,
        //             "reduce_only":false,
        //             "side":"buy",
        //             "size":0,
        //             "state":"cancelled",
        //             "stop_order_type":null,
        //             "stop_price":null,
        //             "stop_trigger_method":"mark_price",
        //             "time_in_force":"gtc",
        //             "trail_amount":null,
        //             "unfilled_size":0,
        //             "user_id":22142
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue(response, 'result');
        return this.parseOrder(result, market);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name delta#cancelAllOrders
         * @description cancel all open orders in a market
         * @see https://docs.delta.exchange/#cancel-all-open-orders
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('cancelAllOrders', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'product_id': market['numericId'],
            // 'cancel_limit_orders': 'true',
            // 'cancel_stop_orders': 'true',
        };
        const response = this.privateDeleteOrdersAll(this.extend(request, params));
        //
        //     {
        //         "result":{},
        //         "success":true
        //     }
        //
        return response;
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.delta.exchange/#get-active-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersWithMethod('privateGetOrders', symbol, since, limit, params);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://docs.delta.exchange/#get-order-history-cancelled-and-closed
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersWithMethod('privateGetOrdersHistory', symbol, since, limit, params);
    }
    async fetchOrdersWithMethod(method, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'product_ids': market['id'], // comma-separated
        // 'contract_types': types, // comma-separated, futures, perpetual_futures, call_options, put_options, interest_rate_swaps, move_options, spreads
        // 'order_types': types, // comma-separated, market, limit, stop_market, stop_limit, all_stop
        // 'start_time': since * 1000,
        // 'end_time': this.microseconds (),
        // 'after', // after cursor for pagination
        // 'before', // before cursor for pagination
        // 'page_size': limit, // number of records per page
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['product_ids'] = market['numericId']; // accepts a comma-separated list of ids
        }
        if (since !== undefined) {
            request['start_time'] = since.toString() + '000';
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "id": "ashb1212",
        //                 "product_id": 27,
        //                 "limit_price": "9200",
        //                 "side": "buy",
        //                 "size": 100,
        //                 "unfilled_size": 50,
        //                 "user_id": 1,
        //                 "order_type": "limit_order",
        //                 "state": "open",
        //                 "created_at": "..."
        //             }
        //         ],
        //         "meta": {
        //             "after": "string",
        //             "before": "string"
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        return this.parseOrders(result, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.delta.exchange/#get-user-fills-by-filters
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        const request = {
        // 'product_ids': market['id'], // comma-separated
        // 'contract_types': types, // comma-separated, futures, perpetual_futures, call_options, put_options, interest_rate_swaps, move_options, spreads
        // 'start_time': since * 1000,
        // 'end_time': this.microseconds (),
        // 'after', // after cursor for pagination
        // 'before', // before cursor for pagination
        // 'page_size': limit, // number of records per page
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['product_ids'] = market['numericId']; // accepts a comma-separated list of ids
        }
        if (since !== undefined) {
            request['start_time'] = since.toString() + '000';
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetFills(this.extend(request, params));
        //
        //     {
        //         "meta":{
        //             "after":null,
        //             "before":null,
        //             "limit":10,
        //             "total_count":2
        //         },
        //         "result":[
        //             {
        //                 "commission":"0.008335000000000000",
        //                 "created_at":"2020-11-16T19:07:19Z",
        //                 "fill_type":"normal",
        //                 "id":"e7ff05c233a74245b72381f8dd91d1ce",
        //                 "meta_data":{
        //                     "effective_commission_rate":"0.0005",
        //                     "order_price":"16249",
        //                     "order_size":1,
        //                     "order_type":"market_order",
        //                     "order_unfilled_size":0,
        //                     "trading_fee_credits_used":"0"
        //                 },
        //                 "order_id":"152999629",
        //                 "price":"16669",
        //                 "product":{
        //                     "contract_type":"perpetual_futures",
        //                     "contract_unit_currency":"BTC",
        //                     "contract_value":"0.001",
        //                     "id":139,
        //                     "notional_type":"vanilla",
        //                     "quoting_asset":{"minimum_precision":2,"precision":6,"symbol":"USDT"},
        //                     "settling_asset":{"minimum_precision":2,"precision":6,"symbol":"USDT"},
        //                     "symbol":"BTCUSDT",
        //                     "tick_size":"0.5",
        //                     "underlying_asset":{"minimum_precision":4,"precision":8,"symbol":"BTC"}
        //                 },
        //                 "product_id":139,
        //                 "role":"taker",
        //                 "side":"sell",
        //                 "size":1
        //             }
        //         ],
        //         "success":true
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        return this.parseTrades(result, market, since, limit);
    }
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://docs.delta.exchange/#get-wallet-transactions
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets();
        const request = {
        // 'asset_id': currency['numericId'],
        // 'end_time': this.seconds (),
        // 'after': 'string', // after cursor for pagination
        // 'before': 'string', // before cursor for pagination
        // 'page_size': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['asset_id'] = currency['numericId'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetWalletTransactions(this.extend(request, params));
        //
        //     {
        //         "meta":{"after":null,"before":null,"limit":10,"total_count":1},
        //         "result":[
        //             {
        //                 "amount":"29.889184",
        //                 "asset_id":5,
        //                 "balance":"29.889184",
        //                 "created_at":"2020-11-15T21:25:01Z",
        //                 "meta_data":{
        //                     "deposit_id":3884,
        //                     "transaction_id":"0x41a60174849828530abb5008e98fc63c9b598288743ec4ba9620bcce900a3b8d"
        //                 },
        //                 "transaction_type":"deposit",
        //                 "user_id":22142,
        //                 "uuid":"70bb5679da3c4637884e2dc63efaa846"
        //             }
        //         ],
        //         "success":true
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        return this.parseLedger(result, currency, since, limit);
    }
    parseLedgerEntryType(type) {
        const types = {
            'pnl': 'pnl',
            'deposit': 'transaction',
            'withdrawal': 'transaction',
            'commission': 'fee',
            'conversion': 'trade',
            // 'perpetual_futures_funding': 'perpetual_futures_funding',
            // 'withdrawal_cancellation': 'withdrawal_cancellation',
            'referral_bonus': 'referral',
            'commission_rebate': 'rebate',
            // 'promo_credit': 'promo_credit',
        };
        return this.safeString(types, type, type);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         "amount":"29.889184",
        //         "asset_id":5,
        //         "balance":"29.889184",
        //         "created_at":"2020-11-15T21:25:01Z",
        //         "meta_data":{
        //             "deposit_id":3884,
        //             "transaction_id":"0x41a60174849828530abb5008e98fc63c9b598288743ec4ba9620bcce900a3b8d"
        //         },
        //         "transaction_type":"deposit",
        //         "user_id":22142,
        //         "uuid":"70bb5679da3c4637884e2dc63efaa846"
        //     }
        //
        const id = this.safeString(item, 'uuid');
        let direction = undefined;
        const account = undefined;
        const metaData = this.safeValue(item, 'meta_data', {});
        const referenceId = this.safeString(metaData, 'transaction_id');
        const referenceAccount = undefined;
        let type = this.safeString(item, 'transaction_type');
        if ((type === 'deposit') || (type === 'commission_rebate') || (type === 'referral_bonus') || (type === 'pnl') || (type === 'withdrawal_cancellation') || (type === 'promo_credit')) {
            direction = 'in';
        }
        else if ((type === 'withdrawal') || (type === 'commission') || (type === 'conversion') || (type === 'perpetual_futures_funding')) {
            direction = 'out';
        }
        type = this.parseLedgerEntryType(type);
        const currencyId = this.safeInteger(item, 'asset_id');
        const currenciesByNumericId = this.safeValue(this.options, 'currenciesByNumericId');
        currency = this.safeValue(currenciesByNumericId, currencyId, currency);
        const code = (currency === undefined) ? undefined : currency['code'];
        const amount = this.safeString(item, 'amount');
        const timestamp = this.parse8601(this.safeString(item, 'created_at'));
        const after = this.safeString(item, 'balance');
        const before = Precise["default"].stringMax('0', Precise["default"].stringSub(after, amount));
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'amount': this.parseNumber(amount),
            'before': this.parseNumber(before),
            'after': this.parseNumber(after),
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fee': undefined,
        };
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name delta#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @param {string} [params.network] unified network code
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset_symbol': currency['id'],
        };
        const networkCode = this.safeStringUpper(params, 'network');
        if (networkCode !== undefined) {
            request['network'] = this.networkCodeToId(networkCode, code);
            params = this.omit(params, 'network');
        }
        const response = await this.privateGetDepositsAddress(this.extend(request, params));
        //
        //    {
        //        "success": true,
        //        "result": {
        //            "id": 1915615,
        //            "user_id": 27854758,
        //            "address": "TXYB4GdKsXKEWbeSNPsmGZu4ZVCkhVh1Zz",
        //            "memo": "",
        //            "status": "active",
        //            "updated_at": "2023-01-12T06:03:46.000Z",
        //            "created_at": "2023-01-12T06:03:46.000Z",
        //            "asset_symbol": "USDT",
        //            "network": "TRC20(TRON)",
        //            "custodian": "fireblocks"
        //        }
        //    }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseDepositAddress(result, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //    {
        //        "id": 1915615,
        //        "user_id": 27854758,
        //        "address": "TXYB4GdKsXKEWbeSNPsmGZu4ZVCkhVh1Zz",
        //        "memo": "",
        //        "status": "active",
        //        "updated_at": "2023-01-12T06:03:46.000Z",
        //        "created_at": "2023-01-12T06:03:46.000Z",
        //        "asset_symbol": "USDT",
        //        "network": "TRC20(TRON)",
        //        "custodian": "fireblocks"
        //    }
        //
        const address = this.safeString(depositAddress, 'address');
        const marketId = this.safeString(depositAddress, 'asset_symbol');
        const networkId = this.safeString(depositAddress, 'network');
        this.checkAddress(address);
        return {
            'currency': this.safeCurrencyCode(marketId, currency),
            'address': address,
            'tag': this.safeString(depositAddress, 'memo'),
            'network': this.networkIdToCode(networkId),
            'info': depositAddress,
        };
    }
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name delta#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://docs.delta.exchange/#get-ticker-for-a-product-by-symbol
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTickersSymbol(this.extend(request, params));
        //
        //     {
        //         "result": {
        //             "close": 30600.5,
        //             "contract_type": "perpetual_futures",
        //             "funding_rate": "0.00602961",
        //             "greeks": null,
        //             "high": 30803.0,
        //             "low": 30265.5,
        //             "mark_basis": "-0.45601594",
        //             "mark_price": "30600.10481568",
        //             "oi": "469.9190",
        //             "oi_change_usd_6h": "2226314.9900",
        //             "oi_contracts": "469919",
        //             "oi_value": "469.9190",
        //             "oi_value_symbol": "BTC",
        //             "oi_value_usd": "14385640.6802",
        //             "open": 30458.5,
        //             "price_band": {
        //                 "lower_limit": "29067.08312627",
        //                 "upper_limit": "32126.77608693"
        //             },
        //             "product_id": 139,
        //             "quotes": {
        //                 "ask_iv": null,
        //                 "ask_size": "965",
        //                 "best_ask": "30600.5",
        //                 "best_bid": "30599.5",
        //                 "bid_iv": null,
        //                 "bid_size": "196",
        //                 "impact_mid_price": null,
        //                 "mark_iv": "-0.44931641"
        //             },
        //             "size": 1226303,
        //             "spot_price": "30612.85362773",
        //             "symbol": "BTCUSDT",
        //             "timestamp": 1689136597460456,
        //             "turnover": 37392218.45999999,
        //             "turnover_symbol": "USDT",
        //             "turnover_usd": 37392218.45999999,
        //             "volume": 1226.3029999999485
        //         },
        //         "success": true
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseFundingRate(result, market);
    }
    async fetchFundingRates(symbols = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @see https://docs.delta.exchange/#get-tickers-for-products
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {
            'contract_types': 'perpetual_futures',
        };
        const response = await this.publicGetTickers(this.extend(request, params));
        //
        //     {
        //         "result": [
        //             {
        //                 "close": 30600.5,
        //                 "contract_type": "perpetual_futures",
        //                 "funding_rate": "0.00602961",
        //                 "greeks": null,
        //                 "high": 30803.0,
        //                 "low": 30265.5,
        //                 "mark_basis": "-0.45601594",
        //                 "mark_price": "30600.10481568",
        //                 "oi": "469.9190",
        //                 "oi_change_usd_6h": "2226314.9900",
        //                 "oi_contracts": "469919",
        //                 "oi_value": "469.9190",
        //                 "oi_value_symbol": "BTC",
        //                 "oi_value_usd": "14385640.6802",
        //                 "open": 30458.5,
        //                 "price_band": {
        //                     "lower_limit": "29067.08312627",
        //                     "upper_limit": "32126.77608693"
        //                 },
        //                 "product_id": 139,
        //                 "quotes": {
        //                     "ask_iv": null,
        //                     "ask_size": "965",
        //                     "best_ask": "30600.5",
        //                     "best_bid": "30599.5",
        //                     "bid_iv": null,
        //                     "bid_size": "196",
        //                     "impact_mid_price": null,
        //                     "mark_iv": "-0.44931641"
        //                 },
        //                 "size": 1226303,
        //                 "spot_price": "30612.85362773",
        //                 "symbol": "BTCUSDT",
        //                 "timestamp": 1689136597460456,
        //                 "turnover": 37392218.45999999,
        //                 "turnover_symbol": "USDT",
        //                 "turnover_usd": 37392218.45999999,
        //                 "volume": 1226.3029999999485
        //             },
        //         ],
        //         "success":true
        //     }
        //
        const rates = this.safeValue(response, 'result', []);
        const result = this.parseFundingRates(rates);
        return this.filterByArray(result, 'symbol', symbols);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "close": 30600.5,
        //         "contract_type": "perpetual_futures",
        //         "funding_rate": "0.00602961",
        //         "greeks": null,
        //         "high": 30803.0,
        //         "low": 30265.5,
        //         "mark_basis": "-0.45601594",
        //         "mark_price": "30600.10481568",
        //         "oi": "469.9190",
        //         "oi_change_usd_6h": "2226314.9900",
        //         "oi_contracts": "469919",
        //         "oi_value": "469.9190",
        //         "oi_value_symbol": "BTC",
        //         "oi_value_usd": "14385640.6802",
        //         "open": 30458.5,
        //         "price_band": {
        //             "lower_limit": "29067.08312627",
        //             "upper_limit": "32126.77608693"
        //         },
        //         "product_id": 139,
        //         "quotes": {
        //             "ask_iv": null,
        //             "ask_size": "965",
        //             "best_ask": "30600.5",
        //             "best_bid": "30599.5",
        //             "bid_iv": null,
        //             "bid_size": "196",
        //             "impact_mid_price": null,
        //             "mark_iv": "-0.44931641"
        //         },
        //         "size": 1226303,
        //         "spot_price": "30612.85362773",
        //         "symbol": "BTCUSDT",
        //         "timestamp": 1689136597460456,
        //         "turnover": 37392218.45999999,
        //         "turnover_symbol": "USDT",
        //         "turnover_usd": 37392218.45999999,
        //         "volume": 1226.3029999999485
        //     }
        //
        const timestamp = this.safeIntegerProduct(contract, 'timestamp', 0.001);
        const marketId = this.safeString(contract, 'symbol');
        const fundingRateString = this.safeString(contract, 'funding_rate');
        const fundingRate = Precise["default"].stringDiv(fundingRateString, '100');
        return {
            'info': contract,
            'symbol': this.safeSymbol(marketId, market),
            'markPrice': this.safeNumber(contract, 'mark_price'),
            'indexPrice': this.safeNumber(contract, 'spot_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fundingRate': this.parseNumber(fundingRate),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }
    async addMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name delta#addMargin
         * @description add margin
         * @see https://docs.delta.exchange/#add-remove-position-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'add', params);
    }
    async reduceMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name delta#reduceMargin
         * @description remove margin from a position
         * @see https://docs.delta.exchange/#add-remove-position-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'reduce', params);
    }
    async modifyMarginHelper(symbol, amount, type, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        amount = amount.toString();
        if (type === 'reduce') {
            amount = Precise["default"].stringMul(amount, '-1');
        }
        const request = {
            'product_id': market['numericId'],
            'delta_margin': amount,
        };
        const response = await this.privatePostPositionsChangeMargin(this.extend(request, params));
        //
        //     {
        //         "result": {
        //             "auto_topup": false,
        //             "bankruptcy_price": "24934.12",
        //             "commission": "0.01197072",
        //             "created_at": "2023-07-20T03:49:09.159401Z",
        //             "entry_price": "29926.8",
        //             "liquidation_price": "25083.754",
        //             "margin": "4.99268",
        //             "margin_mode": "isolated",
        //             "product_id": 84,
        //             "product_symbol": "BTCUSDT",
        //             "realized_cashflow": "0",
        //             "realized_funding": "0",
        //             "realized_pnl": "0",
        //             "size": 1,
        //             "updated_at": "2023-07-20T03:49:09.159401Z",
        //             "user_id": 30084879
        //         },
        //         "success": true
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseMarginModification(result, market);
    }
    parseMarginModification(data, market = undefined) {
        //
        //     {
        //         "auto_topup": false,
        //         "bankruptcy_price": "24934.12",
        //         "commission": "0.01197072",
        //         "created_at": "2023-07-20T03:49:09.159401Z",
        //         "entry_price": "29926.8",
        //         "liquidation_price": "25083.754",
        //         "margin": "4.99268",
        //         "margin_mode": "isolated",
        //         "product_id": 84,
        //         "product_symbol": "BTCUSDT",
        //         "realized_cashflow": "0",
        //         "realized_funding": "0",
        //         "realized_pnl": "0",
        //         "size": 1,
        //         "updated_at": "2023-07-20T03:49:09.159401Z",
        //         "user_id": 30084879
        //     }
        //
        const marketId = this.safeString(data, 'product_symbol');
        market = this.safeMarket(marketId, market);
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'total': this.safeNumber(data, 'margin'),
            'code': undefined,
            'symbol': market['symbol'],
            'status': undefined,
        };
    }
    async fetchOpenInterest(symbol, params = {}) {
        /**
         * @method
         * @name delta#fetchOpenInterest
         * @description retrieves the open interest of a derivative market
         * @see https://docs.delta.exchange/#get-ticker-for-a-product-by-symbol
         * @param {string} symbol unified market symbol
         * @param {object} [params] exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTickersSymbol(this.extend(request, params));
        //
        //     {
        //         "result": {
        //             "close": 894.0,
        //             "contract_type": "call_options",
        //             "greeks": {
        //                 "delta": "0.67324861",
        //                 "gamma": "0.00022178",
        //                 "rho": "4.34638266",
        //                 "spot": "30178.53195697",
        //                 "theta": "-35.64972577",
        //                 "vega": "16.34381277"
        //             },
        //             "high": 946.0,
        //             "low": 893.0,
        //             "mark_price": "1037.07582681",
        //             "mark_vol": "0.35899491",
        //             "oi": "0.0910",
        //             "oi_change_usd_6h": "-90.5500",
        //             "oi_contracts": "91",
        //             "oi_value": "0.0910",
        //             "oi_value_symbol": "BTC",
        //             "oi_value_usd": "2746.3549",
        //             "open": 946.0,
        //             "price_band": {
        //                 "lower_limit": "133.37794509",
        //                 "upper_limit": "5663.66930164"
        //             },
        //             "product_id": 116171,
        //             "quotes": {
        //                 "ask_iv": "0.36932389",
        //                 "ask_size": "1321",
        //                 "best_ask": "1054",
        //                 "best_bid": "1020",
        //                 "bid_iv": "0.34851914",
        //                 "bid_size": "2202",
        //                 "impact_mid_price": null,
        //                 "mark_iv": "0.35896335"
        //             },
        //             "size": 152,
        //             "spot_price": "30178.53195697",
        //             "strike_price": "29500",
        //             "symbol": "C-BTC-29500-280723",
        //             "timestamp": 1689834695286094,
        //             "turnover": 4546.601744940001,
        //             "turnover_symbol": "USDT",
        //             "turnover_usd": 4546.601744940001,
        //             "volume": 0.15200000000000002
        //         },
        //         "success": true
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseOpenInterest(result, market);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //     {
        //         "close": 894.0,
        //         "contract_type": "call_options",
        //         "greeks": {
        //             "delta": "0.67324861",
        //             "gamma": "0.00022178",
        //             "rho": "4.34638266",
        //             "spot": "30178.53195697",
        //             "theta": "-35.64972577",
        //             "vega": "16.34381277"
        //         },
        //         "high": 946.0,
        //         "low": 893.0,
        //         "mark_price": "1037.07582681",
        //         "mark_vol": "0.35899491",
        //         "oi": "0.0910",
        //         "oi_change_usd_6h": "-90.5500",
        //         "oi_contracts": "91",
        //         "oi_value": "0.0910",
        //         "oi_value_symbol": "BTC",
        //         "oi_value_usd": "2746.3549",
        //         "open": 946.0,
        //         "price_band": {
        //             "lower_limit": "133.37794509",
        //             "upper_limit": "5663.66930164"
        //         },
        //         "product_id": 116171,
        //         "quotes": {
        //             "ask_iv": "0.36932389",
        //             "ask_size": "1321",
        //             "best_ask": "1054",
        //             "best_bid": "1020",
        //             "bid_iv": "0.34851914",
        //             "bid_size": "2202",
        //             "impact_mid_price": null,
        //             "mark_iv": "0.35896335"
        //         },
        //         "size": 152,
        //         "spot_price": "30178.53195697",
        //         "strike_price": "29500",
        //         "symbol": "C-BTC-29500-280723",
        //         "timestamp": 1689834695286094,
        //         "turnover": 4546.601744940001,
        //         "turnover_symbol": "USDT",
        //         "turnover_usd": 4546.601744940001,
        //         "volume": 0.15200000000000002
        //     }
        //
        const timestamp = this.safeIntegerProduct(interest, 'timestamp', 0.001);
        const marketId = this.safeString(interest, 'symbol');
        return {
            'symbol': this.safeSymbol(marketId, market),
            'baseVolume': this.safeNumber(interest, 'oi_value'),
            'quoteVolume': this.safeNumber(interest, 'oi_value_usd'),
            'openInterestAmount': this.safeNumber(interest, 'oi_contracts'),
            'openInterestValue': this.safeNumber(interest, 'oi'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        };
    }
    async fetchLeverage(symbol, params = {}) {
        /**
         * @method
         * @name delta#fetchLeverage
         * @description fetch the set leverage for a market
         * @see https://docs.delta.exchange/#get-order-leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'product_id': market['numericId'],
        };
        //
        //     {
        //         "result": {
        //             "index_symbol": null,
        //             "leverage": "10",
        //             "margin_mode": "isolated",
        //             "order_margin": "0",
        //             "product_id": 84,
        //             "user_id": 30084879
        //         },
        //         "success": true
        //     }
        //
        return await this.privateGetProductsProductIdOrdersLeverage(this.extend(request, params));
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name delta#setLeverage
         * @description set the level of leverage for a market
         * @see https://docs.delta.exchange/#change-order-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the delta api endpoint
         * @returns {object} response from the exchange
         */
        this.checkRequiredSymbol('setLeverage', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'product_id': market['numericId'],
            'leverage': leverage,
        };
        //
        //     {
        //         "result": {
        //             "leverage": "20",
        //             "margin_mode": "isolated",
        //             "order_margin": "0",
        //             "product_id": 84
        //         },
        //         "success": true
        //     }
        //
        return await this.privatePostProductsProductIdOrdersLeverage(this.extend(request, params));
    }
    async fetchSettlementHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name delta#fetchSettlementHistory
         * @description fetches historical settlement records
         * @see https://docs.delta.exchange/#get-product-settlement-prices
         * @param {string} symbol unified market symbol of the settlement history
         * @param {int} [since] timestamp in ms
         * @param {int} [limit] number of records
         * @param {object} [params] exchange specific params
         * @returns {object[]} a list of [settlement history objects]
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'states': 'expired',
        };
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.publicGetProducts(this.extend(request, params));
        //
        //     {
        //         "result": [
        //             {
        //                 "contract_value": "0.001",
        //                 "basis_factor_max_limit": "10.95",
        //                 "maker_commission_rate": "0.0003",
        //                 "launch_time": "2023-07-19T04:30:03Z",
        //                 "trading_status": "operational",
        //                 "product_specs": {
        //                     "backup_vol_expiry_time": 31536000,
        //                     "max_deviation_from_external_vol": 0.75,
        //                     "max_lower_deviation_from_external_vol": 0.75,
        //                     "max_upper_deviation_from_external_vol": 0.5,
        //                     "max_volatility": 3,
        //                     "min_volatility": 0.1,
        //                     "premium_commission_rate": 0.1,
        //                     "settlement_index_price": "29993.536675710806",
        //                     "vol_calculation_method": "orderbook",
        //                     "vol_expiry_time": 31536000
        //                 },
        //                 "description": "BTC call option expiring on 19-7-2023",
        //                 "settlement_price": "0",
        //                 "disruption_reason": null,
        //                 "settling_asset": {},
        //                 "initial_margin": "1",
        //                 "tick_size": "0.1",
        //                 "maintenance_margin": "0.5",
        //                 "id": 117542,
        //                 "notional_type": "vanilla",
        //                 "ui_config": {},
        //                 "contract_unit_currency": "BTC",
        //                 "symbol": "C-BTC-30900-190723",
        //                 "insurance_fund_margin_contribution": "1",
        //                 "price_band": "2",
        //                 "annualized_funding": "10.95",
        //                 "impact_size": 200,
        //                 "contract_type": "call_options",
        //                 "position_size_limit": 255633,
        //                 "max_leverage_notional": "200000",
        //                 "initial_margin_scaling_factor": "0.000002",
        //                 "strike_price": "30900",
        //                 "is_quanto": false,
        //                 "settlement_time": "2023-07-19T12:00:00Z",
        //                 "liquidation_penalty_factor": "0.5",
        //                 "funding_method": "mark_price",
        //                 "taker_commission_rate": "0.0003",
        //                 "default_leverage": "100.000000000000000000",
        //                 "state": "expired",
        //                 "auction_start_time": null,
        //                 "short_description": "BTC  Call",
        //                 "quoting_asset": {},
        //                 "maintenance_margin_scaling_factor":"0.000002"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        const settlements = this.parseSettlements(result, market);
        const sorted = this.sortBy(settlements, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    parseSettlement(settlement, market) {
        //
        //     {
        //         "contract_value": "0.001",
        //         "basis_factor_max_limit": "10.95",
        //         "maker_commission_rate": "0.0003",
        //         "launch_time": "2023-07-19T04:30:03Z",
        //         "trading_status": "operational",
        //         "product_specs": {
        //             "backup_vol_expiry_time": 31536000,
        //             "max_deviation_from_external_vol": 0.75,
        //             "max_lower_deviation_from_external_vol": 0.75,
        //             "max_upper_deviation_from_external_vol": 0.5,
        //             "max_volatility": 3,
        //             "min_volatility": 0.1,
        //             "premium_commission_rate": 0.1,
        //             "settlement_index_price": "29993.536675710806",
        //             "vol_calculation_method": "orderbook",
        //             "vol_expiry_time": 31536000
        //         },
        //         "description": "BTC call option expiring on 19-7-2023",
        //         "settlement_price": "0",
        //         "disruption_reason": null,
        //         "settling_asset": {},
        //         "initial_margin": "1",
        //         "tick_size": "0.1",
        //         "maintenance_margin": "0.5",
        //         "id": 117542,
        //         "notional_type": "vanilla",
        //         "ui_config": {},
        //         "contract_unit_currency": "BTC",
        //         "symbol": "C-BTC-30900-190723",
        //         "insurance_fund_margin_contribution": "1",
        //         "price_band": "2",
        //         "annualized_funding": "10.95",
        //         "impact_size": 200,
        //         "contract_type": "call_options",
        //         "position_size_limit": 255633,
        //         "max_leverage_notional": "200000",
        //         "initial_margin_scaling_factor": "0.000002",
        //         "strike_price": "30900",
        //         "is_quanto": false,
        //         "settlement_time": "2023-07-19T12:00:00Z",
        //         "liquidation_penalty_factor": "0.5",
        //         "funding_method": "mark_price",
        //         "taker_commission_rate": "0.0003",
        //         "default_leverage": "100.000000000000000000",
        //         "state": "expired",
        //         "auction_start_time": null,
        //         "short_description": "BTC  Call",
        //         "quoting_asset": {},
        //         "maintenance_margin_scaling_factor":"0.000002"
        //     }
        //
        const datetime = this.safeString(settlement, 'settlement_time');
        const marketId = this.safeString(settlement, 'symbol');
        return {
            'info': settlement,
            'symbol': this.safeSymbol(marketId, market),
            'price': this.safeNumber(settlement, 'settlement_price'),
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
        };
    }
    parseSettlements(settlements, market) {
        const result = [];
        for (let i = 0; i < settlements.length; i++) {
            result.push(this.parseSettlement(settlements[i], market));
        }
        return result;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const requestPath = '/' + this.version + '/' + this.implodeParams(path, params);
        let url = this.urls['api'][api] + requestPath;
        const query = this.omit(params, this.extractParams(path));
        if (api === 'public') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else if (api === 'private') {
            this.checkRequiredCredentials();
            const timestamp = this.seconds().toString();
            headers = {
                'api-key': this.apiKey,
                'timestamp': timestamp,
            };
            let auth = method + timestamp + requestPath;
            if ((method === 'GET') || (method === 'DELETE')) {
                if (Object.keys(query).length) {
                    const queryString = '?' + this.urlencode(query);
                    auth += queryString;
                    url += queryString;
                }
            }
            else {
                body = this.json(query);
                auth += body;
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
            headers['signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        // {"error":{"code":"insufficient_margin","context":{"available_balance":"0.000000000000000000","required_additional_balance":"1.618626000000000000000000000"}},"success":false}
        //
        const error = this.safeValue(response, 'error', {});
        const errorCode = this.safeString(error, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], errorCode, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = delta;
