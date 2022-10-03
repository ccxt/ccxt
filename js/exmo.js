'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, OrderNotFound, AuthenticationError, InsufficientFunds, InvalidOrder, InvalidNonce, OnMaintenance, RateLimitExceeded, BadRequest, PermissionDenied } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class exmo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'exmo',
            'name': 'EXMO',
            'countries': [ 'LT' ], // Lithuania
            'rateLimit': 350, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
            'version': 'v1.1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': 'emulated',
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrderTrades': true,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFees': true,
                'fetchTransactions': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setMargin': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '45m': '45',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg',
                'api': {
                    'public': 'https://api.exmo.com',
                    'private': 'https://api.exmo.com',
                    'web': 'https://exmo.me',
                },
                'www': 'https://exmo.me',
                'referral': 'https://exmo.me/?ref=131685',
                'doc': [
                    'https://exmo.me/en/api_doc?ref=131685',
                ],
                'fees': 'https://exmo.com/en/docs/fees',
            },
            'api': {
                'web': {
                    'get': [
                        'ctrl/feesAndLimits',
                        'en/docs/fees',
                    ],
                },
                'public': {
                    'get': [
                        'currency',
                        'currency/list/extended',
                        'order_book',
                        'pair_settings',
                        'ticker',
                        'trades',
                        'candles_history',
                        'required_amount',
                        'payments/providers/crypto/list',
                    ],
                },
                'private': {
                    'post': [
                        'user_info',
                        'order_create',
                        'order_cancel',
                        'stop_market_order_create',
                        'stop_market_order_cancel',
                        'user_open_orders',
                        'user_trades',
                        'user_cancelled_orders',
                        'order_trades',
                        'deposit_address',
                        'withdraw_crypt',
                        'withdraw_get_txid',
                        'excode_create',
                        'excode_load',
                        'code_check',
                        'wallet_history',
                        'wallet_operations',
                        'margin/user/order/create',
                        'margin/user/order/update',
                        'margin/user/order/cancel',
                        'margin/user/position/close',
                        'margin/user/position/margin_add',
                        'margin/user/position/margin_remove',
                        'margin/currency/list',
                        'margin/pair/list',
                        'margin/settings',
                        'margin/funding/list',
                        'margin/user/info',
                        'margin/user/order/list',
                        'margin/user/order/history',
                        'margin/user/order/trades',
                        'margin/user/order/max_quantity',
                        'margin/user/position/list',
                        'margin/user/position/margin_remove_info',
                        'margin/user/position/margin_add_info',
                        'margin/user/wallet/list',
                        'margin/user/wallet/history',
                        'margin/user/trade/list',
                        'margin/trades',
                        'margin/liquidation/feed',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.004'),
                    'taker': this.parseNumber ('0.004'),
                },
                'transaction': {
                    'tierBased': false,
                    'percentage': false, // fixed transaction fees for crypto, see fetchTransactionFees below
                },
            },
            'options': {
                'networks': {
                    'ETH': 'ERC20',
                    'TRX': 'TRC20',
                },
                'fetchTradingFees': {
                    'method': 'fetchPrivateTradingFees', // or 'fetchPublicTradingFees'
                },
                'margin': {
                    'fillResponseFromRequest': true,
                },
            },
            'commonCurrencies': {
                'GMT': 'GMT Token',
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '40005': AuthenticationError, // Authorization error, incorrect signature
                    '40009': InvalidNonce, //
                    '40015': ExchangeError, // API function do not exist
                    '40016': OnMaintenance, // {"result":false,"error":"Error 40016: Maintenance work in progress"}
                    '40017': AuthenticationError, // Wrong API Key
                    '40032': PermissionDenied, // {"result":false,"error":"Error 40032: Access is denied for this API key"}
                    '40033': PermissionDenied, // {"result":false,"error":"Error 40033: Access is denied, this resources are temporarily blocked to user"}
                    '40034': RateLimitExceeded, // {"result":false,"error":"Error 40034: Access is denied, rate limit is exceeded"}
                    '50052': InsufficientFunds,
                    '50054': InsufficientFunds,
                    '50304': OrderNotFound, // "Order was not found '123456789'" (fetching order trades for an order that does not have trades yet)
                    '50173': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
                    '50277': InvalidOrder,
                    '50319': InvalidOrder, // Price by order is less than permissible minimum for this pair
                    '50321': InvalidOrder, // Price by order is more than permissible maximum for this pair
                    '50381': InvalidOrder, // {"result":false,"error":"Error 50381: More than 2 decimal places are not permitted for pair BTC_USD"}
                },
                'broad': {
                    'range period is too long': BadRequest,
                    'invalid syntax': BadRequest,
                    'API rate limit exceeded': RateLimitExceeded, // {"result":false,"error":"API rate limit exceeded for x.x.x.x. Retry after 60 sec.","history":[],"begin":1579392000,"end":1579478400}
                },
            },
        });
    }

    async modifyMarginHelper (symbol, amount, type, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'position_id': market['id'],
            'quantity': amount,
        };
        let method = undefined;
        if (type === 'add') {
            method = 'privatePostMarginUserPositionMarginAdd';
        } else if (type === 'reduce') {
            method = 'privatePostMarginUserPositionMarginReduce';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //      {}
        //
        const margin = this.parseMarginModification (response, market);
        const options = this.safeValue (this.options, 'margin', {});
        const fillResponseFromRequest = this.safeValue (options, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            margin['type'] = type;
            margin['amount'] = amount;
        }
        return margin;
    }

    parseMarginModification (data, market = undefined) {
        //
        //      {}
        //
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': this.safeValue (market, 'quote'),
            'symbol': this.safeSymbol (undefined, market),
            'total': undefined,
            'status': 'ok',
        };
    }

    async reduceMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name exmo#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#reduce-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    async addMargin (symbol, amount, params = {}) {
        /**
         * @method
         * @name exmo#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/en/latest/manual.html#add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name exmo#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        let method = this.safeString (params, 'method');
        params = this.omit (params, 'method');
        if (method === undefined) {
            const options = this.safeValue (this.options, 'fetchTradingFees', {});
            method = this.safeString (options, 'method', 'fetchPrivateTradingFees');
        }
        return await this[method] (params);
    }

    async fetchPrivateTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostMarginPairList (params);
        //
        //     {
        //         pairs: [{
        //             name: 'EXM_USD',
        //             buy_price: '0.02728391',
        //             sell_price: '0.0276',
        //             last_trade_price: '0.0276',
        //             ticker_updated: '1646956050056696046',
        //             is_fair_price: true,
        //             max_price_precision: '8',
        //             min_order_quantity: '1',
        //             max_order_quantity: '50000',
        //             min_order_price: '0.00000001',
        //             max_order_price: '1000',
        //             max_position_quantity: '50000',
        //             trade_taker_fee: '0.05',
        //             trade_maker_fee: '0',
        //             liquidation_fee: '0.5',
        //             max_leverage: '3',
        //             default_leverage: '3',
        //             liquidation_level: '5',
        //             margin_call_level: '7.5',
        //             position: '1',
        //             updated: '1638976144797807397'
        //         }
        //         ...
        //         ]
        //     }
        //
        const pairs = this.safeValue (response, 'pairs', []);
        const result = {};
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const marketId = this.safeString (pair, 'name');
            const symbol = this.safeSymbol (marketId, undefined, '_');
            const makerString = this.safeString (pair, 'trade_maker_fee');
            const takerString = this.safeString (pair, 'trade_taker_fee');
            const maker = this.parseNumber (Precise.stringDiv (makerString, '100'));
            const taker = this.parseNumber (Precise.stringDiv (takerString, '100'));
            result[symbol] = {
                'info': pair,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchPublicTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetPairSettings (params);
        //
        //     {
        //         BTC_USD: {
        //             min_quantity: '0.00002',
        //             max_quantity: '1000',
        //             min_price: '1',
        //             max_price: '150000',
        //             max_amount: '500000',
        //             min_amount: '1',
        //             price_precision: '2',
        //             commission_taker_percent: '0.3',
        //             commission_maker_percent: '0.3'
        //         },
        //     }
        //
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const fee = this.safeValue (response, market['id'], {});
            const makerString = this.safeString (fee, 'commission_maker_percent');
            const takerString = this.safeString (fee, 'commission_taker_percent');
            const maker = this.parseNumber (Precise.stringDiv (makerString, '100'));
            const taker = this.parseNumber (Precise.stringDiv (takerString, '100'));
            result[symbol] = {
                'info': fee,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    parseFixedFloatValue (input) {
        if ((input === undefined) || (input === '-')) {
            return undefined;
        }
        if (input === '') {
            return 0;
        }
        const isPercentage = (input.indexOf ('%') >= 0);
        const parts = input.split (' ');
        const value = parts[0].replace ('%', '');
        const result = parseFloat (value);
        if ((result > 0) && isPercentage) {
            throw new ExchangeError (this.id + ' parseFixedFloatValue() detected an unsupported non-zero percentage-based fee ' + input);
        }
        return result;
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchTransactionFees
         * @description fetch transaction fees
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a list of [transaction fees structures]{@link https://docs.ccxt.com/en/latest/manual.html#fees-structure}
         */
        await this.loadMarkets ();
        const currencyList = await this.publicGetCurrencyListExtended (params);
        //
        //     [
        //         {"name":"VLX","description":"Velas"},
        //         {"name":"RUB","description":"Russian Ruble"},
        //         {"name":"BTC","description":"Bitcoin"},
        //         {"name":"USD","description":"US Dollar"}
        //     ]
        //
        const cryptoList = await this.publicGetPaymentsProvidersCryptoList (params);
        //
        //     {
        //         "BTC":[
        //             { "type":"deposit", "name":"BTC", "currency_name":"BTC", "min":"0.001", "max":"0", "enabled":true,"comment":"Minimum deposit amount is 0.001 BTC. We do not support BSC and BEP20 network, please consider this when sending funds", "commission_desc":"0%", "currency_confirmations":1 },
        //             { "type":"withdraw", "name":"BTC", "currency_name":"BTC", "min":"0.001", "max":"350", "enabled":true,"comment":"Do not withdraw directly to the Crowdfunding or ICO address as your account will not be credited with tokens from such sales.", "commission_desc":"0.0005 BTC", "currency_confirmations":6 }
        //         ],
        //         "ETH":[
        //             { "type":"withdraw", "name":"ETH", "currency_name":"ETH", "min":"0.01", "max":"500", "enabled":true,"comment":"Do not withdraw directly to the Crowdfunding or ICO address as your account will not be credited with tokens from such sales.", "commission_desc":"0.004 ETH", "currency_confirmations":4 },
        //             { "type":"deposit", "name":"ETH", "currency_name":"ETH", "min":"0.01", "max":"0", "enabled":true,"comment":"Minimum deposit amount is 0.01 ETH. We do not support BSC and BEP20 network, please consider this when sending funds", "commission_desc":"0%", "currency_confirmations":1 }
        //         ],
        //         "USDT":[
        //             { "type":"deposit", "name":"USDT (OMNI)", "currency_name":"USDT", "min":"10", "max":"0", "enabled":false,"comment":"Minimum deposit amount is 10 USDT", "commission_desc":"0%", "currency_confirmations":2 },
        //             { "type":"withdraw", "name":"USDT (OMNI)", "currency_name":"USDT", "min":"10", "max":"100000", "enabled":false,"comment":"Do not withdraw directly to the Crowdfunding or ICO address as your account will not be credited with tokens from such sales.", "commission_desc":"5 USDT", "currency_confirmations":6 },
        //             { "type":"deposit", "name":"USDT (ERC20)", "currency_name":"USDT", "min":"10", "max":"0", "enabled":true,"comment":"Minimum deposit amount is 10 USDT", "commission_desc":"0%", "currency_confirmations":2 },
        //             {
        //                 "type":"withdraw",
        //                 "name":"USDT (ERC20)",
        //                 "currency_name":"USDT",
        //                 "min":"55",
        //                 "max":"200000",
        //                 "enabled":true,
        //                 "comment":"Caution! Do not withdraw directly to a crowdfund or ICO address, as your account will not be credited with tokens from such sales. Recommendation: Due to the high load of ERC20 network, using TRC20 address for withdrawal is recommended.",
        //                 "commission_desc":"10 USDT",
        //                 "currency_confirmations":6
        //             },
        //             { "type":"deposit", "name":"USDT (TRC20)", "currency_name":"USDT", "min":"10", "max":"100000", "enabled":true,"comment":"Minimum deposit amount is 10 USDT. Only TRON main network supported", "commission_desc":"0%", "currency_confirmations":2 },
        //             { "type":"withdraw", "name":"USDT (TRC20)", "currency_name":"USDT", "min":"10", "max":"150000", "enabled":true,"comment":"Caution! Do not withdraw directly to a crowdfund or ICO address, as your account will not be credited with tokens from such sales. Only TRON main network supported.", "commission_desc":"1 USDT", "currency_confirmations":6 }
        //         ],
        //         "XLM":[
        //             { "type":"deposit", "name":"XLM", "currency_name":"XLM", "min":"1", "max":"1000000", "enabled":true,"comment":"Attention! A deposit without memo(invoice) will not be credited. Minimum deposit amount is 1 XLM. We do not support BSC and BEP20 network, please consider this when sending funds", "commission_desc":"0%", "currency_confirmations":1 },
        //             { "type":"withdraw", "name":"XLM", "currency_name":"XLM", "min":"21", "max":"1000000", "enabled":true,"comment":"Caution! Do not withdraw directly to a crowdfund or ICO address, as your account will not be credited with tokens from such sales.", "commission_desc":"0.01 XLM", "currency_confirmations":1 }
        //         ],
        //     }
        //
        const result = {
            'info': cryptoList,
            'withdraw': {},
            'deposit': {},
        };
        for (let i = 0; i < currencyList.length; i++) {
            const currency = currencyList[i];
            const currencyId = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (currencyId);
            const providers = this.safeValue (cryptoList, currencyId, []);
            for (let j = 0; j < providers.length; j++) {
                const provider = providers[j];
                const type = this.safeString (provider, 'type');
                const commissionDesc = this.safeString (provider, 'commission_desc');
                const newFee = this.parseFixedFloatValue (commissionDesc);
                const previousFee = this.safeNumber (result[type], code);
                if ((previousFee === undefined) || ((newFee !== undefined) && (newFee < previousFee))) {
                    result[type][code] = newFee;
                }
            }
        }
        // cache them for later use
        this.options['transactionFees'] = result;
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name exmo#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        //
        const currencyList = await this.publicGetCurrencyListExtended (params);
        //
        //     [
        //         {"name":"VLX","description":"Velas"},
        //         {"name":"RUB","description":"Russian Ruble"},
        //         {"name":"BTC","description":"Bitcoin"},
        //         {"name":"USD","description":"US Dollar"}
        //     ]
        //
        const cryptoList = await this.publicGetPaymentsProvidersCryptoList (params);
        //
        //     {
        //         "BTC":[
        //             { "type":"deposit", "name":"BTC", "currency_name":"BTC", "min":"0.001", "max":"0", "enabled":true,"comment":"Minimum deposit amount is 0.001 BTC. We do not support BSC and BEP20 network, please consider this when sending funds", "commission_desc":"0%", "currency_confirmations":1 },
        //             { "type":"withdraw", "name":"BTC", "currency_name":"BTC", "min":"0.001", "max":"350", "enabled":true,"comment":"Do not withdraw directly to the Crowdfunding or ICO address as your account will not be credited with tokens from such sales.", "commission_desc":"0.0005 BTC", "currency_confirmations":6 }
        //         ],
        //         "ETH":[
        //             { "type":"withdraw", "name":"ETH", "currency_name":"ETH", "min":"0.01", "max":"500", "enabled":true,"comment":"Do not withdraw directly to the Crowdfunding or ICO address as your account will not be credited with tokens from such sales.", "commission_desc":"0.004 ETH", "currency_confirmations":4 },
        //             { "type":"deposit", "name":"ETH", "currency_name":"ETH", "min":"0.01", "max":"0", "enabled":true,"comment":"Minimum deposit amount is 0.01 ETH. We do not support BSC and BEP20 network, please consider this when sending funds", "commission_desc":"0%", "currency_confirmations":1 }
        //         ],
        //         "USDT":[
        //             { "type":"deposit", "name":"USDT (OMNI)", "currency_name":"USDT", "min":"10", "max":"0", "enabled":false,"comment":"Minimum deposit amount is 10 USDT", "commission_desc":"0%", "currency_confirmations":2 },
        //             { "type":"withdraw", "name":"USDT (OMNI)", "currency_name":"USDT", "min":"10", "max":"100000", "enabled":false,"comment":"Do not withdraw directly to the Crowdfunding or ICO address as your account will not be credited with tokens from such sales.", "commission_desc":"5 USDT", "currency_confirmations":6 },
        //             { "type":"deposit", "name":"USDT (ERC20)", "currency_name":"USDT", "min":"10", "max":"0", "enabled":true,"comment":"Minimum deposit amount is 10 USDT", "commission_desc":"0%", "currency_confirmations":2 },
        //             { "type":"withdraw", "name":"USDT (ERC20)", "currency_name":"USDT", "min":"55", "max":"200000", "enabled":true, "comment":"Caution! Do not withdraw directly to a crowdfund or ICO address, as your account will not be credited with tokens from such sales. Recommendation: Due to the high load of ERC20 network, using TRC20 address for withdrawal is recommended.",  "commission_desc":"10 USDT", "currency_confirmations":6 },
        //             { "type":"deposit", "name":"USDT (TRC20)", "currency_name":"USDT", "min":"10", "max":"100000", "enabled":true,"comment":"Minimum deposit amount is 10 USDT. Only TRON main network supported", "commission_desc":"0%", "currency_confirmations":2 },
        //             { "type":"withdraw", "name":"USDT (TRC20)", "currency_name":"USDT", "min":"10", "max":"150000", "enabled":true,"comment":"Caution! Do not withdraw directly to a crowdfund or ICO address, as your account will not be credited with tokens from such sales. Only TRON main network supported.", "commission_desc":"1 USDT", "currency_confirmations":6 }
        //         ],
        //         "XLM":[
        //             { "type":"deposit", "name":"XLM", "currency_name":"XLM", "min":"1", "max":"1000000", "enabled":true,"comment":"Attention! A deposit without memo(invoice) will not be credited. Minimum deposit amount is 1 XLM. We do not support BSC and BEP20 network, please consider this when sending funds", "commission_desc":"0%", "currency_confirmations":1 },
        //             { "type":"withdraw", "name":"XLM", "currency_name":"XLM", "min":"21", "max":"1000000", "enabled":true,"comment":"Caution! Do not withdraw directly to a crowdfund or ICO address, as your account will not be credited with tokens from such sales.", "commission_desc":"0.01 XLM", "currency_confirmations":1 }
        //         ],
        //     }
        //
        const result = {};
        for (let i = 0; i < currencyList.length; i++) {
            const currency = currencyList[i];
            const currencyId = this.safeString (currency, 'name');
            const name = this.safeString (currency, 'description');
            const providers = this.safeValue (cryptoList, currencyId);
            let active = false;
            let type = 'crypto';
            const limits = {
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            let fee = undefined;
            let depositEnabled = undefined;
            let withdrawEnabled = undefined;
            if (providers === undefined) {
                active = true;
                type = 'fiat';
            } else {
                for (let j = 0; j < providers.length; j++) {
                    const provider = providers[j];
                    const type = this.safeString (provider, 'type');
                    const minValue = this.safeNumber (provider, 'min');
                    let maxValue = this.safeNumber (provider, 'max');
                    if (maxValue === 0.0) {
                        maxValue = undefined;
                    }
                    const activeProvider = this.safeValue (provider, 'enabled');
                    if (type === 'deposit') {
                        if (activeProvider && !depositEnabled) {
                            depositEnabled = true;
                        } else if (!activeProvider) {
                            depositEnabled = false;
                        }
                    } else if (type === 'withdraw') {
                        if (activeProvider && !withdrawEnabled) {
                            withdrawEnabled = true;
                        } else if (!activeProvider) {
                            withdrawEnabled = false;
                        }
                    }
                    if (activeProvider) {
                        active = true;
                        if ((limits[type]['min'] === undefined) || (minValue < limits[type]['min'])) {
                            limits[type]['min'] = minValue;
                            limits[type]['max'] = maxValue;
                            if (type === 'withdraw') {
                                const commissionDesc = this.safeString (provider, 'commission_desc');
                                fee = this.parseFixedFloatValue (commissionDesc);
                            }
                        }
                    }
                }
            }
            const code = this.safeCurrencyCode (currencyId);
            result[code] = {
                'id': currencyId,
                'code': code,
                'name': name,
                'type': type,
                'active': active,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': fee,
                'precision': this.parseNumber ('0.00000001'),
                'limits': limits,
                'info': providers,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name exmo#fetchMarkets
         * @description retrieves data on all markets for exmo
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetPairSettings (params);
        //
        //     {
        //         "BTC_USD":{
        //             "min_quantity":"0.0001",
        //             "max_quantity":"1000",
        //             "min_price":"1",
        //             "max_price":"30000",
        //             "max_amount":"500000",
        //             "min_amount":"1",
        //             "price_precision":8,
        //             "commission_taker_percent":"0.4",
        //             "commission_maker_percent":"0.4"
        //         },
        //     }
        //
        const keys = Object.keys (response);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = response[id];
            const symbol = id.replace ('_', '/');
            const [ baseId, quoteId ] = symbol.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const takerString = this.safeString (market, 'commission_taker_percent');
            const makerString = this.safeString (market, 'commission_maker_percent');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.parseNumber (Precise.stringDiv (takerString, '100')),
                'maker': this.parseNumber (Precise.stringDiv (makerString, '100')),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber ('0.00000001'),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_quantity'),
                        'max': this.safeNumber (market, 'max_quantity'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': this.safeNumber (market, 'max_amount'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        const options = this.safeValue (this.options, 'fetchOHLCV');
        const maxLimit = this.safeInteger (options, 'maxLimit', 3000);
        const duration = this.parseTimeframe (timeframe);
        const now = this.milliseconds ();
        if (since === undefined) {
            if (limit === undefined) {
                limit = 1000; // cap default at generous amount
            }
            if (limit > maxLimit) {
                limit = maxLimit; // avoid exception
            }
            request['from'] = parseInt (now / 1000) - limit * duration - 1;
            request['to'] = parseInt (now / 1000);
        } else {
            request['from'] = parseInt (since / 1000) - 1;
            if (limit === undefined) {
                request['to'] = parseInt (now / 1000);
            } else {
                if (limit > maxLimit) {
                    throw new BadRequest (this.id + ' fetchOHLCV() will serve ' + maxLimit.toString () + ' candles at most');
                }
                const to = this.sum (since, limit * duration * 1000);
                request['to'] = parseInt (to / 1000);
            }
        }
        const response = await this.publicGetCandlesHistory (this.extend (request, params));
        //
        //     {
        //         "candles":[
        //             {"t":1584057600000,"o":0.02235144,"c":0.02400233,"h":0.025171,"l":0.02221,"v":5988.34031761},
        //             {"t":1584144000000,"o":0.0240373,"c":0.02367413,"h":0.024399,"l":0.0235,"v":2027.82522329},
        //             {"t":1584230400000,"o":0.02363458,"c":0.02319242,"h":0.0237948,"l":0.02223196,"v":1707.96944997},
        //         ]
        //     }
        //
        const candles = this.safeValue (response, 'candles', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "t":1584057600000,
        //         "o":0.02235144,
        //         "c":0.02400233,
        //         "h":0.025171,
        //         "l":0.02221,
        //         "v":5988.34031761
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    parseBalance (response) {
        const result = { 'info': response };
        const free = this.safeValue (response, 'balances', {});
        const used = this.safeValue (response, 'reserved', {});
        const currencyIds = Object.keys (free);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            if (currencyId in free) {
                account['free'] = this.safeString (free, currencyId);
            }
            if (currencyId in used) {
                account['used'] = this.safeString (used, currencyId);
            }
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name exmo#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostUserInfo (params);
        //
        //     {
        //         "uid":131685,
        //         "server_date":1628999600,
        //         "balances":{
        //             "EXM":"0",
        //             "USD":"0",
        //             "EUR":"0",
        //             "GBP":"0",
        //         },
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const result = this.safeValue (response, market['id']);
        return this.parseOrderBook (result, market['symbol'], undefined, 'bid', 'ask');
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @param {[string]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int|undefined} limit max number of entries per orderbook to return, default is undefined
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbol
         */
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join (',');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                const numIds = this.ids.length;
                throw new ExchangeError (this.id + ' fetchOrderBooks() has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join (',');
        }
        const request = {
            'pair': ids,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const result = {};
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const symbol = this.safeSymbol (marketId);
            result[symbol] = this.parseOrderBook (response[marketId], symbol, undefined, 'bid', 'ask');
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "buy_price":"0.00002996",
        //         "sell_price":"0.00003002",
        //         "last_trade":"0.00002992",
        //         "high":"0.00003028",
        //         "low":"0.00002935",
        //         "avg":"0.00002963",
        //         "vol":"1196546.3163222",
        //         "vol_curr":"35.80066578",
        //         "updated":1642291733
        //     }
        //
        const timestamp = this.safeTimestamp (ticker, 'updated');
        market = this.safeMarket (undefined, market);
        const last = this.safeString (ticker, 'last_trade');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy_price'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell_price'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeString (ticker, 'avg'),
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': this.safeString (ticker, 'vol_curr'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetTicker (params);
        //
        //     {
        //         "ADA_BTC":{
        //             "buy_price":"0.00002996",
        //             "sell_price":"0.00003002",
        //             "last_trade":"0.00002992",
        //             "high":"0.00003028",
        //             "low":"0.00002935",
        //             "avg":"0.00002963",
        //             "vol":"1196546.3163222",
        //             "vol_curr":"35.80066578",
        //             "updated":1642291733
        //         }
        //     }
        //
        const result = {};
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId, undefined, '_');
            const symbol = market['symbol'];
            const ticker = this.safeValue (response, marketId);
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name exmo#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const market = this.market (symbol);
        return this.parseTicker (response[market['id']], market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "trade_id":165087520,
        //         "date":1587470005,
        //         "type":"buy",
        //         "quantity":"1.004",
        //         "price":"0.02491461",
        //         "amount":"0.02501426"
        //     },
        //
        // fetchMyTrades, fetchOrderTrades
        //
        //     {
        //         "trade_id": 3,
        //         "date": 1435488248,
        //         "type": "buy",
        //         "pair": "BTC_USD",
        //         "order_id": 12345,
        //         "quantity": 1,
        //         "price": 100,
        //         "amount": 100,
        //         "exec_type": "taker",
        //         "commission_amount": "0.02",
        //         "commission_currency": "BTC",
        //         "commission_percent": "0.2"
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString (trade, 'trade_id');
        const orderId = this.safeString (trade, 'order_id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'quantity');
        const costString = this.safeString (trade, 'amount');
        const side = this.safeString (trade, 'type');
        const type = undefined;
        const marketId = this.safeString (trade, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const takerOrMaker = this.safeString (trade, 'exec_type');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'commission_amount');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commission_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            let feeRateString = this.safeString (trade, 'commission_percent');
            if (feeRateString !== undefined) {
                feeRateString = Precise.stringDiv (feeRateString, '1000', 18);
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': feeRateString,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "ETH_BTC":[
        //             {
        //                 "trade_id":165087520,
        //                 "date":1587470005,
        //                 "type":"buy",
        //                 "quantity":"1.004",
        //                 "price":"0.02491461",
        //                 "amount":"0.02501426"
        //             },
        //             {
        //                 "trade_id":165087369,
        //                 "date":1587469938,
        //                 "type":"buy",
        //                 "quantity":"0.94",
        //                 "price":"0.02492348",
        //                 "amount":"0.02342807"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, market['id'], []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        // a symbol is required but it can be a single string, or a non-empty array
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument (a single symbol or an array)');
        }
        await this.loadMarkets ();
        let pair = undefined;
        let market = undefined;
        if (Array.isArray (symbol)) {
            const numSymbols = symbol.length;
            if (numSymbols < 1) {
                throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a non-empty symbol array');
            }
            const marketIds = this.marketIds (symbol);
            pair = marketIds.join (',');
        } else {
            market = this.market (symbol);
            pair = market['id'];
        }
        const request = {
            'pair': pair,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostUserTrades (this.extend (request, params));
        let result = [];
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const resultMarket = this.safeMarket (marketId, undefined, '_');
            const items = response[marketId];
            const trades = this.parseTrades (items, resultMarket, since, limit);
            result = this.arrayConcat (result, trades);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name exmo#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const prefix = (type === 'market') ? (type + '_') : '';
        const orderType = prefix + side;
        let orderPrice = price;
        if ((type === 'market') && (price === undefined)) {
            orderPrice = 0;
        }
        const request = {
            'pair': market['id'],
            // 'leverage': 2,
            'quantity': this.amountToPrecision (market['symbol'], amount),
            // spot - buy, sell, market_buy, market_sell, market_buy_total, market_sell_total
            // margin - limit_buy, limit_sell, market_buy, market_sell, stop_buy, stop_sell, stop_limit_buy, stop_limit_sell, trailing_stop_buy, trailing_stop_sell
            'type': orderType,
            'price': this.priceToPrecision (market['symbol'], orderPrice),
            // 'stop_price': this.priceToPrecision (symbol, stopPrice),
            // 'distance': 0, // distance for trailing stop orders
            // 'expire': 0, // expiration timestamp in UTC timezone for the order, unless expire is 0
            // 'client_id': 123, // optional, must be a positive integer
            // 'comment': '', // up to 50 latin symbols, whitespaces, underscores
        };
        let method = 'privatePostOrderCreate';
        let clientOrderId = this.safeValue2 (params, 'client_id', 'clientOrderId');
        if (clientOrderId !== undefined) {
            clientOrderId = this.safeInteger2 (params, 'client_id', 'clientOrderId');
            if (clientOrderId === undefined) {
                throw new BadRequest (this.id + ' createOrder() client order id must be an integer / numeric literal');
            } else {
                request['client_id'] = clientOrderId;
            }
            params = this.omit (params, [ 'client_id', 'clientOrderId' ]);
        }
        if ((type === 'stop') || (type === 'stop_limit') || (type === 'trailing_stop')) {
            const stopPrice = this.safeNumber2 (params, 'stop_price', 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice extra param for a ' + type + ' order');
            } else {
                params = this.omit (params, [ 'stopPrice', 'stop_price' ]);
                request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
                method = 'privatePostMarginUserOrderCreate';
            }
        }
        const response = await this[method] (this.extend (request, params));
        const id = this.safeString (response, 'order_id');
        const timestamp = this.milliseconds ();
        const status = 'open';
        return {
            'id': id,
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': undefined,
            'trades': undefined,
            'clientOrderId': clientOrderId,
            'average': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name exmo#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by exmo cancelOrder ()
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = { 'order_id': id };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by exmo fetchOrder
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id.toString (),
        };
        const response = await this.privatePostOrderTrades (this.extend (request, params));
        //
        //     {
        //         "type": "buy",
        //         "in_currency": "BTC",
        //         "in_amount": "1",
        //         "out_currency": "USD",
        //         "out_amount": "100",
        //         "trades": [
        //             {
        //                 "trade_id": 3,
        //                 "date": 1435488248,
        //                 "type": "buy",
        //                 "pair": "BTC_USD",
        //                 "order_id": 12345,
        //                 "quantity": 1,
        //                 "price": 100,
        //                 "amount": 100
        //             }
        //         ]
        //     }
        //
        const order = this.parseOrder (response);
        return this.extend (order, {
            'id': id.toString (),
        });
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'order_id': id.toString (),
        };
        const response = await this.privatePostOrderTrades (this.extend (request, params));
        //
        //     {
        //         "type": "buy",
        //         "in_currency": "BTC",
        //         "in_amount": "1",
        //         "out_currency": "USD",
        //         "out_amount": "100",
        //         "trades": [
        //             {
        //                 "trade_id": 3,
        //                 "date": 1435488248,
        //                 "type": "buy",
        //                 "pair": "BTC_USD",
        //                 "order_id": 12345,
        //                 "quantity": 1,
        //                 "price": 100,
        //                 "amount": 100,
        //                 "exec_type": "taker",
        //                 "commission_amount": "0.02",
        //                 "commission_currency": "BTC",
        //                 "commission_percent": "0.2"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades');
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const response = await this.privatePostUserOpenOrders (params);
        const marketIds = Object.keys (response);
        let orders = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const parsedOrders = this.parseOrders (response[marketId], market);
            orders = this.arrayConcat (orders, parsedOrders);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders
        //
        //     {
        //         "order_id": "14",
        //         "created": "1435517311",
        //         "type": "buy",
        //         "pair": "BTC_USD",
        //         "price": "100",
        //         "quantity": "1",
        //         "amount": "100"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "type": "buy",
        //         "in_currency": "BTC",
        //         "in_amount": "1",
        //         "out_currency": "USD",
        //         "out_amount": "100",
        //         "trades": [
        //             {
        //                 "trade_id": 3,
        //                 "date": 1435488248,
        //                 "type": "buy",
        //                 "pair": "BTC_USD",
        //                 "order_id": 12345,
        //                 "quantity": 1,
        //                 "price": 100,
        //                 "amount": 100
        //             }
        //         ]
        //     }
        //
        let id = this.safeString (order, 'order_id');
        let timestamp = this.safeTimestamp (order, 'created');
        let symbol = undefined;
        const side = this.safeString (order, 'type');
        let marketId = undefined;
        if ('pair' in order) {
            marketId = order['pair'];
        } else if (('in_currency' in order) && ('out_currency' in order)) {
            if (side === 'buy') {
                marketId = order['in_currency'] + '_' + order['out_currency'];
            } else {
                marketId = order['out_currency'] + '_' + order['in_currency'];
            }
        }
        market = this.safeMarket (marketId, market);
        let amount = this.safeNumber (order, 'quantity');
        if (amount === undefined) {
            const amountField = (side === 'buy') ? 'in_amount' : 'out_amount';
            amount = this.safeNumber (order, amountField);
        }
        let price = this.safeNumber (order, 'price');
        let cost = this.safeNumber (order, 'amount');
        let filled = 0.0;
        const trades = [];
        const transactions = this.safeValue (order, 'trades', []);
        let feeCost = undefined;
        let lastTradeTimestamp = undefined;
        let average = undefined;
        const numTransactions = transactions.length;
        if (numTransactions > 0) {
            feeCost = 0;
            for (let i = 0; i < numTransactions; i++) {
                const trade = this.parseTrade (transactions[i], market);
                if (id === undefined) {
                    id = trade['order'];
                }
                if (timestamp === undefined) {
                    timestamp = trade['timestamp'];
                }
                if (timestamp > trade['timestamp']) {
                    timestamp = trade['timestamp'];
                }
                filled = this.sum (filled, trade['amount']);
                feeCost = this.sum (feeCost, trade['fee']['cost']);
                trades.push (trade);
            }
            lastTradeTimestamp = trades[numTransactions - 1]['timestamp'];
        }
        let status = this.safeString (order, 'status'); // in case we need to redefine it for canceled orders
        let remaining = undefined;
        if (amount !== undefined) {
            remaining = amount - filled;
            if (filled >= amount) {
                status = 'closed';
            } else {
                status = 'open';
            }
        }
        if (market === undefined) {
            market = this.getMarketFromTrades (trades);
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        if (cost === undefined) {
            if (price !== undefined) {
                cost = price * filled;
            }
        } else {
            if (filled > 0) {
                if (average === undefined) {
                    average = cost / filled;
                }
                if (price === undefined) {
                    price = cost / filled;
                }
            }
        }
        const fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        const clientOrderId = this.safeInteger (order, 'client_id');
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': average,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order, default is undefined
         * @param {int|undefined} limit max number of orders to return, default is undefined
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['offset'] = limit;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privatePostUserCancelledOrders (this.extend (request, params));
        //
        //     [{
        //         "order_id": "27056153840",
        //         "client_id": "0",
        //         "created": "1653428646",
        //         "type": "buy",
        //         "pair": "BTC_USDT",
        //         "quantity": "0.1",
        //         "price": "10",
        //         "amount": "1"
        //     }]
        //
        return this.parseOrders (response, market, since, limit, params);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name exmo#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostDepositAddress (params);
        //
        //     {
        //         "TRX":"TBnwrf4ZdoYXE3C8L2KMs7YPSL3fg6q6V9",
        //         "USDTTRC20":"TBnwrf4ZdoYXE3C8L2KMs7YPSL3fg6q6V9"
        //     }
        //
        const depositAddress = this.safeString (response, code);
        let address = undefined;
        let tag = undefined;
        if (depositAddress) {
            const addressAndTag = depositAddress.split (',');
            address = addressAndTag[0];
            const numParts = addressAndTag.length;
            if (numParts > 1) {
                tag = addressAndTag[1];
            }
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    getMarketFromTrades (trades) {
        const tradesBySymbol = this.indexBy (trades, 'pair');
        const symbols = Object.keys (tradesBySymbol);
        const numSymbols = symbols.length;
        if (numSymbols === 1) {
            return this.markets[symbols[0]];
        }
        return undefined;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name exmo#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
            'currency': currency['id'],
            'address': address,
        };
        if (tag !== undefined) {
            request['invoice'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['transport'] = network;
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostWithdrawCrypt (this.extend (request, params));
        return this.parseTransaction (response, currency);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'transferred': 'ok',
            'paid': 'ok',
            'pending': 'pending',
            'processing': 'pending',
            'verifying': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchTransactions
        //
        //          {
        //            "dt": 1461841192,
        //            "type": "deposit",
        //            "curr": "RUB",
        //            "status": "processing",
        //            "provider": "Qiwi (LA) [12345]",
        //            "amount": "1",
        //            "account": "",
        //            "txid": "ec46f784ad976fd7f7539089d1a129fe46...",
        //          }
        //
        // fetchWithdrawals
        //
        //          {
        //             "operation_id": 47412538520634344,
        //             "created": 1573760013,
        //             "updated": 1573760013,
        //             "type": "withdraw",
        //             "currency": "DOGE",
        //             "status": "Paid",
        //             "amount": "300",
        //             "provider": "DOGE",
        //             "commission": "0",
        //             "account": "DOGE: DBVy8pF1f8yxaCVEHqHeR7kkcHecLQ8nRS",
        //             "order_id": 69670170,
        //             "provider_type": "crypto",
        //             "crypto_address": "DBVy8pF1f8yxaCVEHqHeR7kkcHecLQ8nRS",
        //             "card_number": "",
        //             "wallet_address": "",
        //             "email": "",
        //             "phone": "",
        //             "extra": {
        //                 "txid": "f2b66259ae1580f371d38dd27e31a23fff8c04122b65ee3ab5a3f612d579c792",
        //                 "confirmations": null,
        //                 "excode": "",
        //                 "invoice": ""
        //             },
        //             "error": ""
        //          },
        //
        const id = this.safeString2 (transaction, 'order_id', 'task_id');
        const timestamp = this.safeTimestamp2 (transaction, 'dt', 'created');
        const updated = this.safeTimestamp (transaction, 'updated');
        let amount = this.safeString (transaction, 'amount');
        if (amount !== undefined) {
            amount = Precise.stringAbs (amount);
        }
        const status = this.parseTransactionStatus (this.safeStringLower (transaction, 'status'));
        let txid = this.safeString (transaction, 'txid');
        if (txid === undefined) {
            const extra = this.safeValue (transaction, 'extra', {});
            const extraTxid = this.safeString (extra, 'txid');
            if (extraTxid !== '') {
                txid = extraTxid;
            }
        }
        const type = this.safeString (transaction, 'type');
        const currencyId = this.safeString2 (transaction, 'curr', 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let address = undefined;
        const tag = undefined;
        let comment = undefined;
        const account = this.safeString (transaction, 'account');
        if (type === 'deposit') {
            comment = account;
        } else if (type === 'withdrawal') {
            address = account;
            if (address !== undefined) {
                const parts = address.split (':');
                const numParts = parts.length;
                if (numParts === 2) {
                    address = this.safeString (parts, 1);
                    address = address.replace (' ', '');
                }
            }
        }
        let fee = undefined;
        // fixed funding fees only (for now)
        if (!this.fees['transaction']['percentage']) {
            const key = (type === 'withdrawal') ? 'withdraw' : 'deposit';
            let feeCost = this.safeString (transaction, 'commission');
            if (feeCost === undefined) {
                feeCost = this.safeString (this.options['transactionFees'][key], code);
            }
            // users don't pay for cashbacks, no fees for that
            const provider = this.safeString (transaction, 'provider');
            if (provider === 'cashback') {
                feeCost = '0';
            }
            if (feeCost !== undefined) {
                // withdrawal amount includes the fee
                if (type === 'withdrawal') {
                    amount = Precise.stringSub (amount, feeCost);
                }
                fee = {
                    'cost': this.parseNumber (feeCost),
                    'currency': code,
                    'rate': undefined,
                };
            }
        }
        const network = this.safeString (transaction, 'provider');
        return {
            'info': transaction,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'network': network,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'updated': updated,
            'comment': comment,
            'txid': txid,
            'fee': fee,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['date'] = parseInt (since / 1000);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privatePostWalletHistory (this.extend (request, params));
        //
        //     {
        //       "result": true,
        //       "error": "",
        //       "begin": "1493942400",
        //       "end": "1494028800",
        //       "history": [
        //          {
        //            "dt": 1461841192,
        //            "type": "deposit",
        //            "curr": "RUB",
        //            "status": "processing",
        //            "provider": "Qiwi (LA) [12345]",
        //            "amount": "1",
        //            "account": "",
        //            "txid": "ec46f784ad976fd7f7539089d1a129fe46...",
        //          },
        //          {
        //            "dt": 1463414785,
        //            "type": "withdrawal",
        //            "curr": "USD",
        //            "status": "paid",
        //            "provider": "EXCODE",
        //            "amount": "-1",
        //            "account": "EX-CODE_19371_USDda...",
        //            "txid": "",
        //          },
        //       ],
        //     }
        //
        return this.parseTransactions (response['history'], currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'type': 'withdraw',
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default: 100, maximum: 100
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privatePostWalletOperations (this.extend (request, params));
        //
        //     {
        //         "items": [
        //         {
        //             "operation_id": 47412538520634344,
        //             "created": 1573760013,
        //             "updated": 1573760013,
        //             "type": "withdraw",
        //             "currency": "DOGE",
        //             "status": "Paid",
        //             "amount": "300",
        //             "provider": "DOGE",
        //             "commission": "0",
        //             "account": "DOGE: DBVy8pF1f8yxaCVEHqHeR7kkcHecLQ8nRS",
        //             "order_id": 69670170,
        //             "extra": {
        //                 "txid": "f2b66259ae1580f371d38dd27e31a23fff8c04122b65ee3ab5a3f612d579c792",
        //                 "excode": "",
        //                 "invoice": ""
        //             },
        //             "error": ""
        //         },
        //     ],
        //         "count": 23
        //     }
        //
        const items = this.safeValue (response, 'items', []);
        return this.parseTransactions (items, currency, since, limit);
    }

    async fetchWithdrawal (id, code = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @param {string} id withdrawal id
         * @param {string|undefined} code unified currency code of the currency withdrawn, default is undefined
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'order_id': id,
            'type': 'withdraw',
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privatePostWalletOperations (this.extend (request, params));
        //
        //     {
        //         "items": [
        //         {
        //             "operation_id": 47412538520634344,
        //             "created": 1573760013,
        //             "updated": 1573760013,
        //             "type": "deposit",
        //             "currency": "DOGE",
        //             "status": "Paid",
        //             "amount": "300",
        //             "provider": "DOGE",
        //             "commission": "0",
        //             "account": "DOGE: DBVy8pF1f8yxaCVEHqHeR7kkcHecLQ8nRS",
        //             "order_id": 69670170,
        //             "extra": {
        //                 "txid": "f2b66259ae1580f371d38dd27e31a23fff8c04122b65ee3ab5a3f612d579c792",
        //                 "excode": "",
        //                 "invoice": ""
        //             },
        //             "error": ""
        //         },
        //     ],
        //         "count": 23
        //     }
        //
        const items = this.safeValue (response, 'items', []);
        const first = this.safeValue (items, 0, {});
        return this.parseTransaction (first, currency);
    }

    async fetchDeposit (id = undefined, code = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchDeposit
         * @description fetch information on a deposit
         * @param {string} id deposit id
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'order_id': id,
            'type': 'deposit',
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privatePostWalletOperations (this.extend (request, params));
        //
        //     {
        //         "items": [
        //         {
        //             "operation_id": 47412538520634344,
        //             "created": 1573760013,
        //             "updated": 1573760013,
        //             "type": "deposit",
        //             "currency": "DOGE",
        //             "status": "Paid",
        //             "amount": "300",
        //             "provider": "DOGE",
        //             "commission": "0",
        //             "account": "DOGE: DBVy8pF1f8yxaCVEHqHeR7kkcHecLQ8nRS",
        //             "order_id": 69670170,
        //             "extra": {
        //                 "txid": "f2b66259ae1580f371d38dd27e31a23fff8c04122b65ee3ab5a3f612d579c792",
        //                 "excode": "",
        //                 "invoice": ""
        //             },
        //             "error": ""
        //         },
        //     ],
        //         "count": 23
        //     }
        //
        const items = this.safeValue (response, 'items', []);
        const first = this.safeValue (items, 0, {});
        return this.parseTransaction (first, currency);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'type': 'deposit',
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default: 100, maximum: 100
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privatePostWalletOperations (this.extend (request, params));
        //
        //     {
        //         "items": [
        //         {
        //             "operation_id": 47412538520634344,
        //             "created": 1573760013,
        //             "updated": 1573760013,
        //             "type": "deposit",
        //             "currency": "DOGE",
        //             "status": "Paid",
        //             "amount": "300",
        //             "provider": "DOGE",
        //             "commission": "0",
        //             "account": "DOGE: DBVy8pF1f8yxaCVEHqHeR7kkcHecLQ8nRS",
        //             "order_id": 69670170,
        //             "extra": {
        //                 "txid": "f2b66259ae1580f371d38dd27e31a23fff8c04122b65ee3ab5a3f612d579c792",
        //                 "excode": "",
        //                 "invoice": ""
        //             },
        //             "error": ""
        //         },
        //     ],
        //         "count": 23
        //     }
        //
        const items = this.safeValue (response, 'items', []);
        return this.parseTransactions (items, currency, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        if (api !== 'web') {
            url += this.version + '/';
        }
        url += path;
        if ((api === 'public') || (api === 'web')) {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (('result' in response) || ('errmsg' in response)) {
            //
            //     {"result":false,"error":"Error 50052: Insufficient funds"}
            //     {"s":"error","errmsg":"strconv.ParseInt: parsing \"\": invalid syntax"}
            //
            let success = this.safeValue (response, 'result', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1')) {
                    success = true;
                } else {
                    success = false;
                }
            }
            if (!success) {
                let code = undefined;
                const message = this.safeString2 (response, 'error', 'errmsg');
                const errorParts = message.split (':');
                const numParts = errorParts.length;
                if (numParts > 1) {
                    const errorSubParts = errorParts[0].split (' ');
                    const numSubParts = errorSubParts.length;
                    code = (numSubParts > 1) ? errorSubParts[1] : errorSubParts[0];
                }
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
