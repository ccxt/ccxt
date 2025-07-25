'use strict';

var onetrading$1 = require('./abstract/onetrading.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class onetrading
 * @augments Exchange
 */
class onetrading extends onetrading$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'onetrading',
            'name': 'One Trading',
            'countries': ['AT'],
            'rateLimit': 300,
            'version': 'v1',
            'pro': true,
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1/MINUTES',
                '5m': '5/MINUTES',
                '15m': '15/MINUTES',
                '30m': '30/MINUTES',
                '1h': '1/HOURS',
                '4h': '4/HOURS',
                '1d': '1/DAYS',
                '1w': '1/WEEKS',
                '1M': '1/MONTHS',
            },
            'urls': {
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/bdbc26fd-02f2-4ca7-9f1e-17333690bb1c',
                'api': {
                    'public': 'https://api.onetrading.com/fast',
                    'private': 'https://api.onetrading.com/fast',
                },
                'www': 'https://onetrading.com/',
                'doc': [
                    'https://docs.onetrading.com',
                ],
                'fees': 'https://onetrading.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'candlesticks/{instrument_code}',
                        'fees',
                        'instruments',
                        'order-book/{instrument_code}',
                        'market-ticker',
                        'market-ticker/{instrument_code}',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'account/balances',
                        'account/fees',
                        'account/orders',
                        'account/orders/{order_id}',
                        'account/orders/{order_id}/trades',
                        'account/trades',
                        'account/trades/{trade_id}',
                    ],
                    'post': [
                        'account/orders',
                    ],
                    'delete': [
                        'account/orders',
                        'account/orders/{order_id}',
                        'account/orders/client/{client_id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0015'),
                    'maker': this.parseNumber('0.001'),
                    'tiers': [
                        // volume in BTC
                        {
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
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    'INVALID_CLIENT_UUID': errors.InvalidOrder,
                    'ORDER_NOT_FOUND': errors.OrderNotFound,
                    'ONLY_ONE_ERC20_ADDRESS_ALLOWED': errors.InvalidAddress,
                    'DEPOSIT_ADDRESS_NOT_USED': errors.InvalidAddress,
                    'INVALID_CREDENTIALS': errors.AuthenticationError,
                    'MISSING_CREDENTIALS': errors.AuthenticationError,
                    'INVALID_APIKEY': errors.AuthenticationError,
                    'INVALID_SCOPES': errors.AuthenticationError,
                    'INVALID_SUBJECT': errors.AuthenticationError,
                    'INVALID_ISSUER': errors.AuthenticationError,
                    'INVALID_AUDIENCE': errors.AuthenticationError,
                    'INVALID_DEVICE_ID': errors.AuthenticationError,
                    'INVALID_IP_RESTRICTION': errors.AuthenticationError,
                    'APIKEY_REVOKED': errors.AuthenticationError,
                    'APIKEY_EXPIRED': errors.AuthenticationError,
                    'SYNCHRONIZER_TOKEN_MISMATCH': errors.AuthenticationError,
                    'SESSION_EXPIRED': errors.AuthenticationError,
                    'INTERNAL_ERROR': errors.AuthenticationError,
                    'CLIENT_IP_BLOCKED': errors.PermissionDenied,
                    'MISSING_PERMISSION': errors.PermissionDenied,
                    'ILLEGAL_CHARS': errors.BadRequest,
                    'UNSUPPORTED_MEDIA_TYPE': errors.BadRequest,
                    'ACCOUNT_HISTORY_TIME_RANGE_TOO_BIG': errors.BadRequest,
                    'CANDLESTICKS_TIME_RANGE_TOO_BIG': errors.BadRequest,
                    'INVALID_INSTRUMENT_CODE': errors.BadRequest,
                    'INVALID_ORDER_TYPE': errors.BadRequest,
                    'INVALID_UNIT': errors.BadRequest,
                    'INVALID_PERIOD': errors.BadRequest,
                    'INVALID_TIME': errors.BadRequest,
                    'INVALID_DATE': errors.BadRequest,
                    'INVALID_CURRENCY': errors.BadRequest,
                    'INVALID_AMOUNT': errors.BadRequest,
                    'INVALID_PRICE': errors.BadRequest,
                    'INVALID_LIMIT': errors.BadRequest,
                    'INVALID_QUERY': errors.BadRequest,
                    'INVALID_CURSOR': errors.BadRequest,
                    'INVALID_ACCOUNT_ID': errors.BadRequest,
                    'INVALID_SIDE': errors.InvalidOrder,
                    'INVALID_ACCOUNT_HISTORY_FROM_TIME': errors.BadRequest,
                    'INVALID_ACCOUNT_HISTORY_MAX_PAGE_SIZE': errors.BadRequest,
                    'INVALID_ACCOUNT_HISTORY_TIME_PERIOD': errors.BadRequest,
                    'INVALID_ACCOUNT_HISTORY_TO_TIME': errors.BadRequest,
                    'INVALID_CANDLESTICKS_GRANULARITY': errors.BadRequest,
                    'INVALID_CANDLESTICKS_UNIT': errors.BadRequest,
                    'INVALID_ORDER_BOOK_DEPTH': errors.BadRequest,
                    'INVALID_ORDER_BOOK_LEVEL': errors.BadRequest,
                    'INVALID_PAGE_CURSOR': errors.BadRequest,
                    'INVALID_TIME_RANGE': errors.BadRequest,
                    'INVALID_TRADE_ID': errors.BadRequest,
                    'INVALID_UI_ACCOUNT_SETTINGS': errors.BadRequest,
                    'NEGATIVE_AMOUNT': errors.InvalidOrder,
                    'NEGATIVE_PRICE': errors.InvalidOrder,
                    'MIN_SIZE_NOT_SATISFIED': errors.InvalidOrder,
                    'BAD_AMOUNT_PRECISION': errors.InvalidOrder,
                    'BAD_PRICE_PRECISION': errors.InvalidOrder,
                    'BAD_TRIGGER_PRICE_PRECISION': errors.InvalidOrder,
                    'MAX_OPEN_ORDERS_EXCEEDED': errors.BadRequest,
                    'MISSING_PRICE': errors.InvalidOrder,
                    'MISSING_ORDER_TYPE': errors.InvalidOrder,
                    'MISSING_SIDE': errors.InvalidOrder,
                    'MISSING_CANDLESTICKS_PERIOD_PARAM': errors.ArgumentsRequired,
                    'MISSING_CANDLESTICKS_UNIT_PARAM': errors.ArgumentsRequired,
                    'MISSING_FROM_PARAM': errors.ArgumentsRequired,
                    'MISSING_INSTRUMENT_CODE': errors.ArgumentsRequired,
                    'MISSING_ORDER_ID': errors.InvalidOrder,
                    'MISSING_TO_PARAM': errors.ArgumentsRequired,
                    'MISSING_TRADE_ID': errors.ArgumentsRequired,
                    'INVALID_ORDER_ID': errors.OrderNotFound,
                    'NOT_FOUND': errors.OrderNotFound,
                    'INSUFFICIENT_LIQUIDITY': errors.InsufficientFunds,
                    'INSUFFICIENT_FUNDS': errors.InsufficientFunds,
                    'NO_TRADING': errors.ExchangeNotAvailable,
                    'SERVICE_UNAVAILABLE': errors.ExchangeNotAvailable,
                    'GATEWAY_TIMEOUT': errors.ExchangeNotAvailable,
                    'RATELIMIT': errors.DDoSProtection,
                    'CF_RATELIMIT': errors.DDoSProtection,
                    'INTERNAL_SERVER_ERROR': errors.ExchangeError,
                },
                'broad': {
                    'Order not found.': errors.OrderNotFound,
                },
            },
            'commonCurrencies': {
                'MIOTA': 'IOTA', // https://github.com/ccxt/ccxt/issues/7487
            },
            // exchange-specific options
            'options': {
                'fetchTradingFees': {
                    'method': 'fetchPrivateTradingFees', // or 'fetchPublicTradingFees'
                },
                'fiat': ['EUR', 'CHF'],
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerDirection': false,
                        'triggerPriceType': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000,
                        'daysBackCanceled': 1 / 12,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 5000,
                    },
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
        });
    }
    /**
     * @method
     * @name onetrading#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.onetrading.com/#time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetTime(params);
        //
        //     {
        //         "iso": "2020-07-10T05:17:26.716Z",
        //         "epoch_millis": 1594358246716,
        //     }
        //
        return this.safeInteger(response, 'epoch_millis');
    }
    /**
     * @method
     * @name onetrading#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.onetrading.com/#currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetCurrencies(params);
        //
        //     [
        //         {
        //             "code": "USDT",
        //             "precision": 6,
        //             "unified_cryptoasset_id": 825,
        //             "name": "Tether USDt",
        //             "collateral_percentage": 0
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString(currency, 'code');
            const code = this.safeCurrencyCode(id);
            result[code] = this.safeCurrencyStructure({
                'id': id,
                'code': code,
                'name': this.safeString(currency, 'name'),
                'info': currency,
                'active': undefined,
                'fee': undefined,
                'precision': this.parseNumber(this.parsePrecision(this.safeString(currency, 'precision'))),
                'withdraw': undefined,
                'deposit': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
                'networks': {},
            });
        }
        return result;
    }
    /**
     * @method
     * @name onetrading#fetchMarkets
     * @description retrieves data on all markets for onetrading
     * @see https://docs.onetrading.com/#instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetInstruments(params);
        //
        //     [
        //         {
        //             "state": "ACTIVE",
        //             "base": { code: "ETH", precision: 8 },
        //             "quote": { code: "CHF", precision: 2 },
        //             "amount_precision": 4,
        //             "market_precision": 2,
        //             "min_size": "10.0"
        //         }
        //     ]
        //
        return this.parseMarkets(response);
    }
    parseMarket(market) {
        const baseAsset = this.safeValue(market, 'base', {});
        const quoteAsset = this.safeValue(market, 'quote', {});
        const baseId = this.safeString(baseAsset, 'code');
        const quoteId = this.safeString(quoteAsset, 'code');
        const id = baseId + '_' + quoteId;
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const state = this.safeString(market, 'state');
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
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': (state === 'ACTIVE'),
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'amount_precision'))),
                'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'market_precision'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
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
            'created': undefined,
            'info': market,
        };
    }
    /**
     * @method
     * @name onetrading#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.onetrading.com/#fee-groups
     * @see https://docs.onetrading.com/#fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        let method = this.safeString(params, 'method');
        params = this.omit(params, 'method');
        if (method === undefined) {
            const options = this.safeValue(this.options, 'fetchTradingFees', {});
            method = this.safeString(options, 'method', 'fetchPrivateTradingFees');
        }
        if (method === 'fetchPrivateTradingFees') {
            return await this.fetchPrivateTradingFees(params);
        }
        else if (method === 'fetchPublicTradingFees') {
            return await this.fetchPublicTradingFees(params);
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchTradingFees() does not support ' + method + ', fetchPrivateTradingFees and fetchPublicTradingFees are supported');
        }
    }
    async fetchPublicTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetFees(params);
        //
        //     [
        //         {
        //             "fee_group_id":"default",
        //             "display_text":"The standard fee plan.",
        //             "fee_tiers":[
        //                 {"volume":"0.0","fee_group_id":"default","maker_fee":"0.1","taker_fee":"0.15"},
        //                 {"volume":"100.0","fee_group_id":"default","maker_fee":"0.1","taker_fee":"0.13"},
        //                 {"volume":"250.0","fee_group_id":"default","maker_fee":"0.09","taker_fee":"0.13"},
        //                 {"volume":"1000.0","fee_group_id":"default","maker_fee":"0.075","taker_fee":"0.1"},
        //                 {"volume":"5000.0","fee_group_id":"default","maker_fee":"0.06","taker_fee":"0.09"},
        //                 {"volume":"10000.0","fee_group_id":"default","maker_fee":"0.05","taker_fee":"0.075"},
        //                 {"volume":"20000.0","fee_group_id":"default","maker_fee":"0.05","taker_fee":"0.065"}
        //             ],
        //             "fee_discount_rate":"25.0",
        //             "minimum_price_value":"0.12"
        //         }
        //     ]
        //
        const first = this.safeValue(response, 0, {});
        const feeTiers = this.safeValue(first, 'fee_tiers');
        const tiers = this.parseFeeTiers(feeTiers);
        const firstTier = this.safeValue(feeTiers, 0, {});
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': first,
                'symbol': symbol,
                'maker': this.safeNumber(firstTier, 'maker_fee'),
                'taker': this.safeNumber(firstTier, 'taker_fee'),
                'percentage': true,
                'tierBased': true,
                'tiers': tiers,
            };
        }
        return result;
    }
    async fetchPrivateTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetAccountFees(params);
        //
        //     {
        //         "account_id": "ed524d00-820a-11e9-8f1e-69602df16d85",
        //         "running_trading_volume": "0.0",
        //         "fee_group_id": "default",
        //         "collect_fees_in_best": false,
        //         "fee_discount_rate": "25.0",
        //         "minimum_price_value": "0.12",
        //         "fee_tiers": [
        //             { "volume": "0.0", "fee_group_id": "default", "maker_fee": "0.1", "taker_fee": "0.1" },
        //             { "volume": "100.0", "fee_group_id": "default", "maker_fee": "0.09", "taker_fee": "0.1" },
        //             { "volume": "250.0", "fee_group_id": "default", "maker_fee": "0.08", "taker_fee": "0.1" },
        //             { "volume": "1000.0", "fee_group_id": "default", "maker_fee": "0.07", "taker_fee": "0.09" },
        //             { "volume": "5000.0", "fee_group_id": "default", "maker_fee": "0.06", "taker_fee": "0.08" },
        //             { "volume": "10000.0", "fee_group_id": "default", "maker_fee": "0.05", "taker_fee": "0.07" },
        //             { "volume": "20000.0", "fee_group_id": "default", "maker_fee": "0.05", "taker_fee": "0.06" },
        //             { "volume": "50000.0", "fee_group_id": "default", "maker_fee": "0.05", "taker_fee": "0.05" }
        //         ],
        //         "active_fee_tier": { "volume": "0.0", "fee_group_id": "default", "maker_fee": "0.1", "taker_fee": "0.1" }
        //     }
        //
        const activeFeeTier = this.safeValue(response, 'active_fee_tier', {});
        let makerFee = this.safeString(activeFeeTier, 'maker_fee');
        let takerFee = this.safeString(activeFeeTier, 'taker_fee');
        makerFee = Precise["default"].stringDiv(makerFee, '100');
        takerFee = Precise["default"].stringDiv(takerFee, '100');
        const feeTiers = this.safeValue(response, 'fee_tiers');
        const result = {};
        const tiers = this.parseFeeTiers(feeTiers);
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.parseNumber(makerFee),
                'taker': this.parseNumber(takerFee),
                'percentage': true,
                'tierBased': true,
                'tiers': tiers,
            };
        }
        return result;
    }
    parseFeeTiers(feeTiers, market = undefined) {
        const takerFees = [];
        const makerFees = [];
        for (let i = 0; i < feeTiers.length; i++) {
            const tier = feeTiers[i];
            const volume = this.safeNumber(tier, 'volume');
            let taker = this.safeString(tier, 'taker_fee');
            let maker = this.safeString(tier, 'maker_fee');
            maker = Precise["default"].stringDiv(maker, '100');
            taker = Precise["default"].stringDiv(taker, '100');
            makerFees.push([volume, this.parseNumber(maker)]);
            takerFees.push([volume, this.parseNumber(taker)]);
        }
        return {
            'maker': makerFees,
            'taker': takerFees,
        };
    }
    parseTicker(ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "sequence":602562,
        //         "time":"2020-07-10T06:27:34.951Z",
        //         "state":"ACTIVE",
        //         "is_frozen":0,
        //         "quote_volume":"1695555.1783768",
        //         "base_volume":"205.67436",
        //         "last_price":"8143.91",
        //         "best_bid":"8143.71",
        //         "best_ask":"8156.9",
        //         "price_change":"-147.47",
        //         "price_change_percentage":"-1.78",
        //         "high":"8337.45",
        //         "low":"8110.0"
        //     }
        //
        const timestamp = this.parse8601(this.safeString(ticker, 'time'));
        const marketId = this.safeString(ticker, 'instrument_code');
        const symbol = this.safeSymbol(marketId, market, '_');
        const last = this.safeString(ticker, 'last_price');
        const percentage = this.safeString(ticker, 'price_change_percentage');
        const change = this.safeString(ticker, 'price_change');
        const baseVolume = this.safeString(ticker, 'base_volume');
        const quoteVolume = this.safeString(ticker, 'quote_volume');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.safeString(ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name onetrading#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.onetrading.com/#market-ticker-for-instrument
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_code': market['id'],
        };
        const response = await this.publicGetMarketTickerInstrumentCode(this.extend(request, params));
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "sequence":602562,
        //         "time":"2020-07-10T06:27:34.951Z",
        //         "state":"ACTIVE",
        //         "is_frozen":0,
        //         "quote_volume":"1695555.1783768",
        //         "base_volume":"205.67436",
        //         "last_price":"8143.91",
        //         "best_bid":"8143.71",
        //         "best_ask":"8156.9",
        //         "price_change":"-147.47",
        //         "price_change_percentage":"-1.78",
        //         "high":"8337.45",
        //         "low":"8110.0"
        //     }
        //
        return this.parseTicker(response, market);
    }
    /**
     * @method
     * @name onetrading#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.onetrading.com/#market-ticker
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetMarketTicker(params);
        //
        //     [
        //         {
        //             "instrument_code":"BTC_EUR",
        //             "sequence":602562,
        //             "time":"2020-07-10T06:27:34.951Z",
        //             "state":"ACTIVE",
        //             "is_frozen":0,
        //             "quote_volume":"1695555.1783768",
        //             "base_volume":"205.67436",
        //             "last_price":"8143.91",
        //             "best_bid":"8143.71",
        //             "best_ask":"8156.9",
        //             "price_change":"-147.47",
        //             "price_change_percentage":"-1.78",
        //             "high":"8337.45",
        //             "low":"8110.0"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker(response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    /**
     * @method
     * @name onetrading#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.onetrading.com/#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instrument_code': market['id'],
            // level 1 means only the best bid and ask
            // level 2 is a compiled order book up to market precision
            // level 3 is a full orderbook
            // if you wish to get regular updates about orderbooks please use the Websocket channel
            // heavy usage of this endpoint may result in limited access according to rate limits rules
            // 'level': 3, // default
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOrderBookInstrumentCode(this.extend(request, params));
        //
        // level 1
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "time":"2020-07-10T07:39:06.343Z",
        //         "asks":{
        //             "value":{
        //                 "price":"8145.29",
        //                 "amount":"0.96538",
        //                 "number_of_orders":1
        //             }
        //         },
        //         "bids":{
        //             "value":{
        //                 "price":"8134.0",
        //                 "amount":"1.5978",
        //                 "number_of_orders":5
        //             }
        //         }
        //     }
        //
        // level 2
        //
        //     {
        //         "instrument_code":"BTC_EUR","time":"2020-07-10T07:36:43.538Z",
        //         "asks":[
        //             {"price":"8146.59","amount":"0.89691","number_of_orders":1},
        //             {"price":"8146.89","amount":"1.92062","number_of_orders":1},
        //             {"price":"8169.5","amount":"0.0663","number_of_orders":1},
        //         ],
        //         "bids":[
        //             {"price":"8143.49","amount":"0.01329","number_of_orders":1},
        //             {"price":"8137.01","amount":"5.34748","number_of_orders":1},
        //             {"price":"8137.0","amount":"2.0","number_of_orders":1},
        //         ]
        //     }
        //
        // level 3
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "time":"2020-07-10T07:32:31.525Z",
        //         "bids":[
        //             {"price":"8146.79","amount":"0.01537","order_id":"5d717da1-a8f4-422d-afcc-03cb6ab66825"},
        //             {"price":"8139.32","amount":"3.66009","order_id":"d0715c68-f28d-4cf1-a450-d56cf650e11c"},
        //             {"price":"8137.51","amount":"2.61049","order_id":"085fd6f4-e835-4ca5-9449-a8f165772e60"},
        //         ],
        //         "asks":[
        //             {"price":"8153.49","amount":"0.93384","order_id":"755d3aa3-42b5-46fa-903d-98f42e9ae6c4"},
        //             {"price":"8153.79","amount":"1.80456","order_id":"62034cf3-b70d-45ff-b285-ba6307941e7c"},
        //             {"price":"8167.9","amount":"0.0018","order_id":"036354e0-71cd-492f-94f2-01f7d4b66422"},
        //         ]
        //     }
        //
        const timestamp = this.parse8601(this.safeString(response, 'time'));
        return this.parseOrderBook(response, market['symbol'], timestamp, 'bids', 'asks', 'price', 'amount');
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "granularity":{"unit":"HOURS","period":1},
        //         "high":"9252.65",
        //         "low":"9115.27",
        //         "open":"9250.0",
        //         "close":"9132.35",
        //         "total_amount":"33.85924",
        //         "volume":"311958.9635744",
        //         "time":"2020-05-08T22:59:59.999Z",
        //         "last_sequence":461123
        //     }
        //
        const granularity = this.safeValue(ohlcv, 'granularity');
        const unit = this.safeString(granularity, 'unit');
        const period = this.safeString(granularity, 'period');
        const units = {
            'MINUTES': 'm',
            'HOURS': 'h',
            'DAYS': 'd',
            'WEEKS': 'w',
            'MONTHS': 'M',
        };
        const lowercaseUnit = this.safeString(units, unit);
        const timeframe = period + lowercaseUnit;
        const durationInSeconds = this.parseTimeframe(timeframe);
        const duration = durationInSeconds * 1000;
        const timestamp = this.parse8601(this.safeString(ohlcv, 'time'));
        const alignedTimestamp = duration * this.parseToInt(timestamp / duration);
        const options = this.safeValue(this.options, 'fetchOHLCV', {});
        const volumeField = this.safeString(options, 'volume', 'total_amount');
        return [
            alignedTimestamp,
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, volumeField),
        ];
    }
    /**
     * @method
     * @name onetrading#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.onetrading.com/#candlesticks
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const periodUnit = this.safeString(this.timeframes, timeframe);
        const [period, unit] = periodUnit.split('/');
        const durationInSeconds = this.parseTimeframe(timeframe);
        const duration = durationInSeconds * 1000;
        if (limit === undefined) {
            limit = 1500;
        }
        const request = {
            'instrument_code': market['id'],
            // 'from': this.iso8601 (since),
            // 'to': this.iso8601 (this.milliseconds ()),
            'period': period,
            'unit': unit,
        };
        if (since === undefined) {
            const now = this.milliseconds();
            request['to'] = this.iso8601(now);
            request['from'] = this.iso8601(now - limit * duration);
        }
        else {
            request['from'] = this.iso8601(since);
            request['to'] = this.iso8601(this.sum(since, limit * duration));
        }
        const response = await this.publicGetCandlesticksInstrumentCode(this.extend(request, params));
        //
        //     [
        //         {"instrument_code":"BTC_EUR","granularity":{"unit":"HOURS","period":1},"high":"9252.65","low":"9115.27","open":"9250.0","close":"9132.35","total_amount":"33.85924","volume":"311958.9635744","time":"2020-05-08T22:59:59.999Z","last_sequence":461123},
        //         {"instrument_code":"BTC_EUR","granularity":{"unit":"HOURS","period":1},"high":"9162.49","low":"9040.0","open":"9132.53","close":"9083.69","total_amount":"26.19685","volume":"238553.7812365","time":"2020-05-08T23:59:59.999Z","last_sequence":461376},
        //         {"instrument_code":"BTC_EUR","granularity":{"unit":"HOURS","period":1},"high":"9135.7","low":"9002.59","open":"9055.45","close":"9133.98","total_amount":"26.21919","volume":"238278.8724959","time":"2020-05-09T00:59:59.999Z","last_sequence":461521},
        //     ]
        //
        const ohlcv = this.safeList(response, 'candlesticks');
        return this.parseOHLCVs(ohlcv, market, timeframe, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "instrument_code":"BTC_EUR",
        //         "price":"8137.28",
        //         "amount":"0.22269",
        //         "taker_side":"BUY",
        //         "volume":"1812.0908832",
        //         "time":"2020-07-10T14:44:32.299Z",
        //         "trade_timestamp":1594392272299,
        //         "sequence":603047
        //     }
        //
        // fetchMyTrades, fetchOrder, fetchOpenOrders, fetchClosedOrders trades (private)
        //
        //     {
        //         "fee": {
        //             "fee_amount": "0.0014",
        //             "fee_currency": "BTC",
        //             "fee_percentage": "0.1",
        //             "fee_group_id": "default",
        //             "fee_type": "TAKER",
        //             "running_trading_volume": "0.0"
        //         },
        //         "trade": {
        //             "trade_id": "fdff2bcc-37d6-4a2d-92a5-46e09c868664",
        //             "order_id": "36bb2437-7402-4794-bf26-4bdf03526439",
        //             "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //             "amount": "1.4",
        //             "side": "BUY",
        //             "instrument_code": "BTC_EUR",
        //             "price": "7341.4",
        //             "time": "2019-09-27T15:05:32.564Z",
        //             "sequence": 48670
        //         }
        //     }
        //
        const feeInfo = this.safeValue(trade, 'fee', {});
        trade = this.safeValue(trade, 'trade', trade);
        let timestamp = this.safeInteger(trade, 'trade_timestamp');
        if (timestamp === undefined) {
            timestamp = this.parse8601(this.safeString(trade, 'time'));
        }
        const side = this.safeStringLower2(trade, 'side', 'taker_side');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'amount');
        const costString = this.safeString(trade, 'volume');
        const marketId = this.safeString(trade, 'instrument_code');
        const symbol = this.safeSymbol(marketId, market, '_');
        const feeCostString = this.safeString(feeInfo, 'fee_amount');
        let takerOrMaker = undefined;
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString(feeInfo, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            const feeRateString = this.safeString(feeInfo, 'fee_percentage');
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': feeRateString,
            };
            takerOrMaker = this.safeStringLower(feeInfo, 'fee_type');
        }
        return this.safeTrade({
            'id': this.safeString2(trade, 'trade_id', 'sequence'),
            'order': this.safeString(trade, 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        }, market);
    }
    parseBalance(response) {
        const balances = this.safeValue(response, 'balances', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString(balance, 'currency_code');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'available');
            account['used'] = this.safeString(balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name onetrading#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.onetrading.com/#balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetAccountBalances(params);
        //
        //     {
        //         "account_id":"4b95934f-55f1-460c-a525-bd5afc0cf071",
        //         "balances":[
        //             {
        //                 "account_id":"4b95934f-55f1-460c-a525-bd5afc0cf071",
        //                 "currency_code":"BTC",
        //                 "change":"10.0",
        //                 "available":"10.0",
        //                 "locked":"0.0",
        //                 "sequence":142135994,
        //                 "time":"2020-07-01T10:57:32.959Z"
        //             }
        //         ]
        //     }
        //
        return this.parseBalance(response);
    }
    parseOrderStatus(status) {
        const statuses = {
            'FILLED': 'open',
            'FILLED_FULLY': 'closed',
            'FILLED_CLOSED': 'canceled',
            'FILLED_REJECTED': 'rejected',
            'OPEN': 'open',
            'REJECTED': 'rejected',
            'CLOSED': 'canceled',
            'FAILED': 'failed',
            'STOP_TRIGGERED': 'triggered',
            'DONE': 'closed',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "order_id": "d5492c24-2995-4c18-993a-5b8bf8fffc0d",
        //         "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206",
        //         "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //         "instrument_code": "BTC_EUR",
        //         "time": "2019-08-01T08:00:44.026Z",
        //         "side": "BUY",
        //         "price": "5000",
        //         "amount": "1",
        //         "filled_amount": "0.5",
        //         "type": "LIMIT",
        //         "time_in_force": "GOOD_TILL_CANCELLED"
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "order": {
        //             "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //             "account_id": "1eb2ad5d-55f1-40b5-bc92-7dc05869e905",
        //             "instrument_code": "BTC_EUR",
        //             "amount": "1234.5678",
        //             "filled_amount": "1234.5678",
        //             "side": "BUY",
        //             "type": "LIMIT",
        //             "status": "OPEN",
        //             "sequence": 123456789,
        //             "price": "1234.5678",
        //             "average_price": "1234.5678",
        //             "reason": "INSUFFICIENT_FUNDS",
        //             "time": "2019-08-24T14:15:22Z",
        //             "time_in_force": "GOOD_TILL_CANCELLED",
        //             "time_last_updated": "2019-08-24T14:15:22Z",
        //             "expire_after": "2019-08-24T14:15:22Z",
        //             "is_post_only": false,
        //             "time_triggered": "2019-08-24T14:15:22Z",
        //             "trigger_price": "1234.5678"
        //         },
        //         "trades": [
        //             {
        //                 "fee": {
        //                     "fee_amount": "0.0014",
        //                     "fee_currency": "BTC",
        //                     "fee_percentage": "0.1",
        //                     "fee_group_id": "default",
        //                     "fee_type": "TAKER",
        //                     "running_trading_volume": "0.0"
        //                 },
        //                 "trade": {
        //                     "trade_id": "fdff2bcc-37d6-4a2d-92a5-46e09c868664",
        //                     "order_id": "36bb2437-7402-4794-bf26-4bdf03526439",
        //                     "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //                     "amount": "1.4",
        //                     "side": "BUY",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "7341.4",
        //                     "time": "2019-09-27T15:05:32.564Z",
        //                     "sequence": 48670
        //                 }
        //             }
        //         ]
        //     }
        //
        const rawOrder = this.safeValue(order, 'order', order);
        const id = this.safeString(rawOrder, 'order_id');
        const clientOrderId = this.safeString(rawOrder, 'client_id');
        const timestamp = this.parse8601(this.safeString(rawOrder, 'time'));
        const rawStatus = this.parseOrderStatus(this.safeString(rawOrder, 'status'));
        const status = this.parseOrderStatus(rawStatus);
        const marketId = this.safeString(rawOrder, 'instrument_code');
        const symbol = this.safeSymbol(marketId, market, '_');
        const price = this.safeString(rawOrder, 'price');
        const amount = this.safeString(rawOrder, 'amount');
        const filled = this.safeString(rawOrder, 'filled_amount');
        const side = this.safeStringLower(rawOrder, 'side');
        const type = this.safeStringLower(rawOrder, 'type');
        const timeInForce = this.parseTimeInForce(this.safeString(rawOrder, 'time_in_force'));
        const postOnly = this.safeValue(rawOrder, 'is_post_only');
        const rawTrades = this.safeValue(order, 'trades', []);
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': this.parseOrderType(type),
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'triggerPrice': this.safeNumber(rawOrder, 'trigger_price'),
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            // 'fee': undefined,
            'trades': rawTrades,
        }, market);
    }
    parseOrderType(type) {
        const types = {
            'booked': 'limit',
        };
        return this.safeString(types, type, type);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'GOOD_TILL_CANCELLED': 'GTC',
            'GOOD_TILL_TIME': 'GTT',
            'IMMEDIATE_OR_CANCELLED': 'IOC',
            'FILL_OR_KILL': 'FOK',
        };
        return this.safeString(timeInForces, timeInForce, timeInForce);
    }
    /**
     * @method
     * @name onetrading#createOrder
     * @description create a trade order
     * @see https://docs.onetrading.com/#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] onetrading only does stop limit orders and does not do stop market
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const uppercaseType = type.toUpperCase();
        const request = {
            'instrument_code': market['id'],
            'type': uppercaseType,
            'side': side.toUpperCase(),
            'amount': this.amountToPrecision(symbol, amount),
            // "price": "1234.5678", // required for LIMIT and STOP orders
            // "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206", // optional
            // "time_in_force": "GOOD_TILL_CANCELLED", // limit orders only, GOOD_TILL_CANCELLED, GOOD_TILL_TIME, IMMEDIATE_OR_CANCELLED and FILL_OR_KILL
            // "expire_after": "2020-07-02T19:40:13Z", // required for GOOD_TILL_TIME
            // "is_post_only": false, // limit orders only, optional
            // "trigger_price": "1234.5678" // required for stop orders
        };
        let priceIsRequired = false;
        if (uppercaseType === 'LIMIT' || uppercaseType === 'STOP') {
            priceIsRequired = true;
        }
        const triggerPrice = this.safeNumberN(params, ['triggerPrice', 'trigger_price', 'stopPrice']);
        if (triggerPrice !== undefined) {
            if (uppercaseType === 'MARKET') {
                throw new errors.BadRequest(this.id + ' createOrder() cannot place stop market orders, only stop limit');
            }
            request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
            request['type'] = 'STOP';
            params = this.omit(params, ['triggerPrice', 'trigger_price', 'stopPrice']);
        }
        else if (uppercaseType === 'STOP') {
            throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a triggerPrice param for ' + type + ' orders');
        }
        if (priceIsRequired) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_id');
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
            params = this.omit(params, ['clientOrderId', 'client_id']);
        }
        const timeInForce = this.safeString2(params, 'timeInForce', 'time_in_force', 'GOOD_TILL_CANCELLED');
        params = this.omit(params, 'timeInForce');
        request['time_in_force'] = timeInForce;
        const response = await this.privatePostAccountOrders(this.extend(request, params));
        //
        //     {
        //         "order_id": "d5492c24-2995-4c18-993a-5b8bf8fffc0d",
        //         "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206",
        //         "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //         "instrument_code": "BTC_EUR",
        //         "time": "2019-08-01T08:00:44.026Z",
        //         "side": "BUY",
        //         "price": "5000",
        //         "amount": "1",
        //         "filled_amount": "0.5",
        //         "type": "LIMIT",
        //         "time_in_force": "GOOD_TILL_CANCELLED"
        //     }
        //
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name onetrading#cancelOrder
     * @description cancels an open order
     * @see https://docs.onetrading.com/#close-order-by-order-id
     * @param {string} id order id
     * @param {string} symbol not used by bitmex cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_id');
        params = this.omit(params, ['clientOrderId', 'client_id']);
        let method = 'privateDeleteAccountOrdersOrderId';
        const request = {};
        if (clientOrderId !== undefined) {
            method = 'privateDeleteAccountOrdersClientClientId';
            request['client_id'] = clientOrderId;
        }
        else {
            request['order_id'] = id;
        }
        let response = undefined;
        if (method === 'privateDeleteAccountOrdersOrderId') {
            response = await this.privateDeleteAccountOrdersOrderId(this.extend(request, params));
        }
        else {
            response = await this.privateDeleteAccountOrdersClientClientId(this.extend(request, params));
        }
        //
        // responds with an empty body
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name onetrading#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.onetrading.com/#close-all-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['instrument_code'] = market['id'];
        }
        const response = await this.privateDeleteAccountOrders(this.extend(request, params));
        //
        //     [
        //         "a10e9bd1-8f72-4cfe-9f1b-7f1c8a9bd8ee"
        //     ]
        //
        return [this.safeOrder({ 'info': response })];
    }
    /**
     * @method
     * @name onetrading#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.onetrading.com/#close-all-orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'ids': ids.join(','),
        };
        const response = await this.privateDeleteAccountOrders(this.extend(request, params));
        //
        //     [
        //         "a10e9bd1-8f72-4cfe-9f1b-7f1c8a9bd8ee"
        //     ]
        //
        return response;
    }
    /**
     * @method
     * @name onetrading#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.onetrading.com/#get-order
     * @param {string} id the order id
     * @param {string} symbol not used by onetrading fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetAccountOrdersOrderId(this.extend(request, params));
        //
        //     {
        //         "order": {
        //             "order_id": "36bb2437-7402-4794-bf26-4bdf03526439",
        //             "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //             "time_last_updated": "2019-09-27T15:05:35.096Z",
        //             "sequence": 48782,
        //             "price": "7349.2",
        //             "filled_amount": "100.0",
        //             "status": "FILLED_FULLY",
        //             "amount": "100.0",
        //             "instrument_code": "BTC_EUR",
        //             "side": "BUY",
        //             "time": "2019-09-27T15:05:32.063Z",
        //             "type": "MARKET"
        //         },
        //         "trades": [
        //             {
        //                 "fee": {
        //                     "fee_amount": "0.0014",
        //                     "fee_currency": "BTC",
        //                     "fee_percentage": "0.1",
        //                     "fee_group_id": "default",
        //                     "fee_type": "TAKER",
        //                     "running_trading_volume": "0.0"
        //                 },
        //                 "trade": {
        //                     "trade_id": "fdff2bcc-37d6-4a2d-92a5-46e09c868664",
        //                     "order_id": "36bb2437-7402-4794-bf26-4bdf03526439",
        //                     "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //                     "amount": "1.4",
        //                     "side": "BUY",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "7341.4",
        //                     "time": "2019-09-27T15:05:32.564Z",
        //                     "sequence": 48670
        //                 }
        //             }
        //         ]
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name onetrading#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.onetrading.com/#get-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'from': this.iso8601 (since),
        // 'to': this.iso8601 (this.milliseconds ()), // max range is 100 days
        // 'instrument_code': market['id'],
        // 'with_cancelled_and_rejected': false, // default is false, orders which have been cancelled by the user before being filled or rejected by the system as invalid, additionally, all inactive filled orders which would return with "with_just_filled_inactive"
        // 'with_just_filled_inactive': false, // orders which have been filled and are no longer open, use of "with_cancelled_and_rejected" extends "with_just_filled_inactive" and in case both are specified the latter is ignored
        // 'with_just_orders': false, // do not return any trades corresponsing to the orders, it may be significanly faster and should be used if user is not interesting in trade information
        // 'max_page_size': 100,
        // 'cursor': 'string', // pointer specifying the position from which the next pages should be returned
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instrument_code'] = market['id'];
        }
        if (since !== undefined) {
            const to = this.safeString(params, 'to');
            if (to === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders() requires a "to" iso8601 string param with the since argument is specified, max range is 100 days');
            }
            request['from'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountOrders(this.extend(request, params));
        //
        //     {
        //         "order_history": [
        //             {
        //                 "order": {
        //                     "trigger_price": "12089.88",
        //                     "order_id": "d453ca12-c650-46dd-9dee-66910d96bfc0",
        //                     "account_id": "ef3a5f4c-cfcd-415e-ba89-5a9abf47b28a",
        //                     "instrument_code": "BTC_USDT",
        //                     "time": "2019-08-23T10:02:31.663Z",
        //                     "side": "SELL",
        //                     "price": "10159.76",
        //                     "average_price": "10159.76",
        //                     "amount": "0.2",
        //                     "filled_amount": "0.2",
        //                     "type": "STOP",
        //                     "sequence": 8,
        //                     "status": "FILLED_FULLY"
        //                 },
        //                 "trades": [
        //                     {
        //                         "fee": {
        //                             "fee_amount": "0.4188869",
        //                             "fee_currency": "USDT",
        //                             "fee_percentage": "0.1",
        //                             "fee_group_id": "default",
        //                             "fee_type": "TAKER",
        //                             "running_trading_volume": "0.0"
        //                         },
        //                         "trade": {
        //                             "trade_id": "ec82896f-fd1b-4cbb-89df-a9da85ccbb4b",
        //                             "order_id": "d453ca12-c650-46dd-9dee-66910d96bfc0",
        //                             "account_id": "ef3a5f4c-cfcd-415e-ba89-5a9abf47b28a",
        //                             "amount": "0.2",
        //                             "side": "SELL",
        //                             "instrument_code": "BTC_USDT",
        //                             "price": "10159.76",
        //                             "time": "2019-08-23T10:02:32.663Z",
        //                             "sequence": 9
        //                         }
        //                     }
        //                 ]
        //             },
        //             {
        //                 "order": {
        //                     "order_id": "5151a99e-f414-418f-8cf1-2568d0a63ea5",
        //                     "account_id": "ef3a5f4c-cfcd-415e-ba89-5a9abf47b28a",
        //                     "instrument_code": "BTC_USDT",
        //                     "time": "2019-08-23T10:01:36.773Z",
        //                     "side": "SELL",
        //                     "price": "12289.88",
        //                     "amount": "0.5",
        //                     "filled_amount": "0.0",
        //                     "type": "LIMIT",
        //                     "sequence": 7,
        //                     "status": "OPEN"
        //                 },
        //                 "trades": []
        //             },
        //             {
        //                 "order": {
        //                     "order_id": "ac80d857-75e1-4733-9070-fd4288395fdc",
        //                     "account_id": "ef3a5f4c-cfcd-415e-ba89-5a9abf47b28a",
        //                     "instrument_code": "BTC_USDT",
        //                     "time": "2019-08-23T10:01:25.031Z",
        //                     "side": "SELL",
        //                     "price": "11089.88",
        //                     "amount": "0.1",
        //                     "filled_amount": "0.0",
        //                     "type": "LIMIT",
        //                     "sequence": 6,
        //                     "status": "OPEN"
        //                 },
        //                 "trades": []
        //             }
        //         ],
        //         "max_page_size": 100
        //     }
        //
        const orderHistory = this.safeList(response, 'order_history', []);
        return this.parseOrders(orderHistory, market, since, limit);
    }
    /**
     * @method
     * @name onetrading#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.onetrading.com/#get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'with_cancelled_and_rejected': true, // default is false, orders which have been cancelled by the user before being filled or rejected by the system as invalid, additionally, all inactive filled orders which would return with "with_just_filled_inactive"
        };
        return await this.fetchOpenOrders(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name onetrading#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.onetrading.com/#trades-for-order
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
            // 'max_page_size': 100,
            // 'cursor': 'string', // pointer specifying the position from which the next pages should be returned
        };
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountOrdersOrderIdTrades(this.extend(request, params));
        //
        //     {
        //         "trade_history": [
        //             {
        //                 "trade": {
        //                     "trade_id": "2b42efcd-d5b7-4a56-8e12-b69ffd68c5ef",
        //                     "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //                     "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //                     "amount": "1234.5678",
        //                     "side": "BUY",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "1234.5678",
        //                     "time": "2019-08-24T14:15:22Z",
        //                     "price_tick_sequence": 0,
        //                     "sequence": 123456789
        //                 },
        //                 "fee": {
        //                     "fee_amount": "1234.5678",
        //                     "fee_percentage": "1234.5678",
        //                     "fee_group_id": "default",
        //                     "running_trading_volume": "1234.5678",
        //                     "fee_currency": "BTC",
        //                     "fee_type": "TAKER"
        //                 }
        //             }
        //         ],
        //         "max_page_size": 0,
        //         "cursor": "string"
        //     }
        //
        const tradeHistory = this.safeValue(response, 'trade_history', []);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        return this.parseTrades(tradeHistory, market, since, limit);
    }
    /**
     * @method
     * @name onetrading#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.onetrading.com/#all-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'from': this.iso8601 (since),
        // 'to': this.iso8601 (this.milliseconds ()), // max range is 100 days
        // 'instrument_code': market['id'],
        // 'max_page_size': 100,
        // 'cursor': 'string', // pointer specifying the position from which the next pages should be returned
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instrument_code'] = market['id'];
        }
        if (since !== undefined) {
            const to = this.safeString(params, 'to');
            if (to === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a "to" iso8601 string param with the since argument is specified, max range is 100 days');
            }
            request['from'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountTrades(this.extend(request, params));
        //
        //     {
        //         "trade_history": [
        //             {
        //                 "trade": {
        //                     "trade_id": "2b42efcd-d5b7-4a56-8e12-b69ffd68c5ef",
        //                     "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //                     "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //                     "amount": "1234.5678",
        //                     "side": "BUY",
        //                     "instrument_code": "BTC_EUR",
        //                     "price": "1234.5678",
        //                     "time": "2019-08-24T14:15:22Z",
        //                     "price_tick_sequence": 0,
        //                     "sequence": 123456789
        //                 },
        //                 "fee": {
        //                     "fee_amount": "1234.5678",
        //                     "fee_percentage": "1234.5678",
        //                     "fee_group_id": "default",
        //                     "running_trading_volume": "1234.5678",
        //                     "fee_currency": "BTC",
        //                     "fee_type": "TAKER"
        //                 }
        //             }
        //         ],
        //         "max_page_size": 0,
        //         "cursor": "string"
        //     }
        //
        const tradeHistory = this.safeList(response, 'trade_history', []);
        return this.parseTrades(tradeHistory, market, since, limit);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        if (api === 'public') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else if (api === 'private') {
            this.checkRequiredCredentials();
            headers = {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.apiKey,
            };
            if (method === 'POST') {
                body = this.json(query);
                headers['Content-Type'] = 'application/json';
            }
            else {
                if (Object.keys(query).length) {
                    url += '?' + this.urlencode(query);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     {"error":"MISSING_FROM_PARAM"}
        //     {"error":"MISSING_TO_PARAM"}
        //     {"error":"CANDLESTICKS_TIME_RANGE_TOO_BIG"}
        //
        const message = this.safeString(response, 'error');
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = onetrading;
